import type { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import redis from '../lib/redis';
import { ENV } from '../config/env';
import { registerFileTreeSocket } from './fileTree.socket';
import {
  getRecentChatMessages,
  saveChatMessage,
} from '../services/chat.service';
import { getProjectAccess } from '../services/project.service';
import * as Y from 'yjs';
import { verifyToken } from '../utils/tokenManager';
import { fetchUserById } from '../services/userService';

let io: Server;

const projectPresence = new Map<
  string,
  Map<
    string,
    {
      id: string;
      name: string;
      email?: string;
      socketId: string;
      currentFile?: string;
      accessLevel?: string;
    }
  >
>();

// Yjs documents per project file
const ydocs = new Map<string, Y.Doc>();

// Video rooms: projectId -> Set<socketId>
const videoRooms = new Map<string, Set<string>>();

// User video states
const userVideoStates = new Map<
  string,
  {
    userId: string;
    socketId: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    name: string;
  }
>();

const activeCursors = new Map<
  string,
  Map<string, { fileId: string; userId: string; name: string }>
>();

function broadcastPresence(projectId: string) {
  const room = projectPresence.get(projectId);
  const users = room ? Array.from(room.values()) : [];
  const unique = Array.from(new Map(users.map((u) => [u.id, u])).values());
  io.to(projectId).emit('update-presence', unique);
}

function getOrCreateYDoc(fileId: string): Y.Doc {
  if (!ydocs.has(fileId)) {
    const ydoc = new Y.Doc();
    ydocs.set(fileId, ydoc);
  }
  return ydocs.get(fileId)!;
}

function clearCursor(projectId: string, socketId: string) {
  const cursors = activeCursors.get(projectId);
  const entry = cursors?.get(socketId);
  if (!entry) return;

  cursors!.delete(socketId);
  if (cursors!.size === 0) activeCursors.delete(projectId);

  io.to(projectId).emit('cursor_leave', {
    fileId: entry.fileId,
    userId: entry.userId,
    socketId,
  });
}

function parseCookie(rawCookie: string): Record<string, string> {
  return Object.fromEntries(
    rawCookie.split(';').map((c) => {
      const [key, ...v] = c.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    }),
  );
}

export const initSocket = (httpServer: HTTPServer) => {
  const allowedOrigins = ENV.CLIENT_ORIGINS
    ? ENV.CLIENT_ORIGINS.split(',')
    : [];
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,

      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB for large file transfers
    transports: ['websocket', 'polling'],
  });

  io.adapter(createAdapter(redis, redis.duplicate()));
  
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error('Unauthorized'));

      const { token } = parseCookie(rawCookie);
      if (!token) return next(new Error('Unauthorized'));

      if (!token) return next(new Error('Unauthorized'));

      const decoded = await verifyToken(token);
      const user = await fetchUserById(decoded.id);
      if (!user) return next(new Error('Unauthorized'));

      socket.data.authUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    registerFileTreeSocket(io, socket);
    console.log(`New client connected: ${socket.id}`);

    // Personal notification channel
    socket.on('identify', ({ userId }: { userId: string }) => {
      if (!userId) return;
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} identified as user:${userId}`);
    });

    socket.on('join-project', async ({ projectId }) => {
      if (!projectId) return;
      const user = socket.data.authUser;
      socket.join(projectId);
      socket.data.user = user;
      socket.data.projectId = projectId;

      let accessLevel = 'view';
      try {
        if (user?.id) {
          accessLevel = (await getProjectAccess(user.id, projectId)) || 'view';
        }
      } catch (err) {
        console.error('Failed to resolve project access for socket:', err);
      }

      if (accessLevel === 'none') {
        socket.emit('project_access_denied', { projectId });
        return;
      }

      const canEdit = ['edit', 'admin', 'owner'].includes(accessLevel);
      console.log(
        '[DEBUG]',
        user?.name,
        'DB/cache accessLevel =',
        accessLevel,
        'canEdit =',
        canEdit,
      );
      socket.data.accessLevel = accessLevel;
      socket.data.canEdit = canEdit;

      if (user?.id) {
        if (!projectPresence.has(projectId)) {
          projectPresence.set(projectId, new Map());
        }
        projectPresence.get(projectId)!.set(socket.id, {
          id: user.id,
          name: user.name || 'Someone',
          email: user.email,
          socketId: socket.id,
          accessLevel,
        });
        broadcastPresence(projectId);
      }

      // Send chat history
      try {
        const history = await getRecentChatMessages(projectId);
        socket.emit('chat-history', { projectId, messages: history });
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }

      socket.to(projectId).emit('member-joined', {
        user,
        message: `${user?.name || 'Someone'} joined the project`,
        timestamp: Date.now(),
      });

      // Broadcast current video room state
      if (videoRooms.has(projectId)) {
        const videoUsers = Array.from(videoRooms.get(projectId)!)
          .map((socketId) => {
            return userVideoStates.get(socketId);
          })
          .filter(Boolean);
        socket.emit('video-room-users', { users: videoUsers });
      }
    });

    socket.on('get-active-users', ({ projectId }: { projectId: string }) => {
      if (!projectId) return;
      const room = projectPresence.get(projectId);
      const users = room ? Array.from(room.values()) : [];
      const unique = Array.from(new Map(users.map((u) => [u.id, u])).values());
      socket.emit('update-presence', unique);
    });

    socket.on('leave-project', ({ projectId, user }) => {
      if (!projectId) return;
      socket.leave(projectId);

      clearCursor(projectId, socket.id);

      const room = projectPresence.get(projectId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) projectPresence.delete(projectId);
        else broadcastPresence(projectId);
      }

      socket.to(projectId).emit('notification', {
        type: 'presence',
        message: `${user?.name || 'A collaborator'} left the project`,
        projectId,
        timestamp: Date.now(),
      });
    });

    // YJS COLLABORATIVE EDITING
    socket.on('yjs-update', ({ projectId, fileId, update }) => {
      if (!projectId || !fileId) return;

      if (!socket.data.canEdit) {
        socket.emit('edit_denied', {
          fileId,
          reason: 'You have view-only access to this project.',
        });
        return;
      }

      const ydoc = getOrCreateYDoc(fileId);
      try {
        Y.applyUpdate(ydoc, new Uint8Array(update));
        // Broadcast to all users editing this file
        socket.to(projectId).emit('yjs-update', { fileId, update });
      } catch (err) {
        console.error('Failed to apply Yjs update:', err);
      }
    });

    socket.on('yjs-sync-step', ({ projectId, fileId, step }) => {
      if (!projectId || !fileId) return;
      const ydoc = getOrCreateYDoc(fileId);
      socket.emit('yjs-sync-step', { fileId, step });
    });

    socket.on('request-yjs-state', ({ projectId, fileId }) => {
      if (!projectId || !fileId) return;
      const ydoc = getOrCreateYDoc(fileId);
      const state = Y.encodeStateAsUpdate(ydoc);
      socket.emit('yjs-state', { fileId, state: Array.from(state) });
    });

    // VIDEO STREAMING
    socket.on('join-video-room', ({ projectId, user: clientUser }) => {
      if (!projectId) return;

      // Prefer server-side user from join-project (reliable name/id)
      const authUser = socket.data.user || clientUser || {};
      const name = authUser.name || clientUser?.name || 'Unknown';
      const userId = authUser.id || clientUser?.id || '';

      if (!videoRooms.has(projectId)) {
        videoRooms.set(projectId, new Set());
      }

      const room = videoRooms.get(projectId)!;

      // Existing participants (exclude self)
      const existingUsers = Array.from(room)
        .filter((sid) => sid !== socket.id)
        .map((sid) => userVideoStates.get(sid))
        .filter(Boolean)
        .map((u) => ({
          socketId: u!.socketId,
          userId: u!.userId,
          name: u!.name,
          videoEnabled: u!.videoEnabled,
          audioEnabled: u!.audioEnabled,
        }));

      room.add(socket.id);

      userVideoStates.set(socket.id, {
        userId,
        socketId: socket.id,
        videoEnabled: true,
        audioEnabled: true,
        name,
      });

      // Tell the joiner who is already in the huddle
      socket.emit('video-room-users', { users: existingUsers });

      // Tell everyone else (including other projects members) about the new joiner
      // Include socketId on the user object so clients never lose identity
      socket.to(projectId).emit('user-joined-video', {
        socketId: socket.id,
        user: {
          socketId: socket.id,
          userId,
          name,
          videoEnabled: true,
          audioEnabled: true,
        },
      });

      console.log(
        `User ${name} (${socket.id}) joined video room for project ${projectId}`,
      );
    });

    socket.on('leave-video-room', ({ projectId }) => {
      if (!projectId) return;

      const videoRoom = videoRooms.get(projectId);
      if (videoRoom) {
        videoRoom.delete(socket.id);
        if (videoRoom.size === 0) {
          videoRooms.delete(projectId);
        }
      }

      userVideoStates.delete(socket.id);
      io.to(projectId).emit('user-left-video', { socketId: socket.id });
      console.log(`User ${socket.id} left video room for project ${projectId}`);
    });

    socket.on(
      'video-state-change',
      ({ projectId, videoEnabled, audioEnabled }) => {
        if (!projectId) return;

        const state = userVideoStates.get(socket.id);
        if (state) {
          state.videoEnabled = videoEnabled;
          state.audioEnabled = audioEnabled;
        }

        io.to(projectId).emit('video-state-updated', {
          socketId: socket.id,
          videoEnabled,
          audioEnabled,
        });
      },
    );

    // WebRTC signaling
    socket.on(
      'webrtc-signal',
      ({ projectId, targetSocketId, signal, type }) => {
        if (!projectId || !targetSocketId) return;
        io.to(targetSocketId).emit('webrtc-signal', {
          from: socket.id,
          signal,
          type,
        });
      },
    );

    socket.on('webrtc-answer', ({ projectId, targetSocketId, answer }) => {
      if (!projectId || !targetSocketId) return;
      io.to(targetSocketId).emit('webrtc-answer', {
        from: socket.id,
        answer,
      });
    });

    socket.on(
      'webrtc-ice-candidate',
      ({ projectId, targetSocketId, candidate }) => {
        if (!projectId || !targetSocketId) return;
        io.to(targetSocketId).emit('webrtc-ice-candidate', {
          from: socket.id,
          candidate,
        });
      },
    );
    // CODE & CURSOR UPDATES
    socket.on('code_change', ({ projectId, fileId, content }) => {
      if (!projectId || !fileId) return;

      // Same server-side enforcement as yjs-update, for the legacy
      // raw-content sync path.
      if (!socket.data.canEdit) {
        socket.emit('edit_denied', {
          fileId,
          reason: 'You have view-only access to this project.',
        });
        return;
      }

      socket.to(projectId).emit('code_update', { fileId, content });
    });

    socket.on('cursor_move', ({ projectId, fileId, cursor, selection }) => {
      if (!projectId || !fileId || !cursor) return;
      // if (!socket.data.canEdit) return;

      const user = socket.data.user || null;
      const userId = user?.id || socket.id;

      if (!activeCursors.has(projectId)) {
        activeCursors.set(projectId, new Map());
      }
      const projectCursors = activeCursors.get(projectId)!;
      const previous = projectCursors.get(socket.id);

      if (previous && previous.fileId !== fileId) {
        io.to(projectId).emit('cursor_leave', {
          fileId: previous.fileId,
          userId: previous.userId,
          socketId: socket.id,
        });
      }

      projectCursors.set(socket.id, {
        fileId,
        userId,
        name: user?.name || 'Guest',
      });

      if (!previous || previous.fileId !== fileId) {
        const room = projectPresence.get(projectId);
        const presenceEntry = room?.get(socket.id);
        if (presenceEntry && presenceEntry.currentFile !== fileId) {
          presenceEntry.currentFile = fileId;
          broadcastPresence(projectId);
        }
      }

      let validSelection = null;
      if (
        selection &&
        typeof selection.startLineNumber === 'number' &&
        typeof selection.startColumn === 'number' &&
        typeof selection.endLineNumber === 'number' &&
        typeof selection.endColumn === 'number' &&
        (selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn)
      ) {
        validSelection = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        };
      }

      socket.to(projectId).emit('cursor_update', {
        fileId,
        user: user || { id: userId, name: 'Guest' },
        cursor,
        selection: validSelection,
        role: socket.data.canEdit ? 'edit' : 'view',
        socketId: socket.id,
      });
    });

    socket.on('file_saved', ({ projectId, fileId }) => {
      if (!projectId || !fileId) return;
      socket.to(projectId).emit('file_saved_notification', {
        fileId,
        user: socket.data.user,
      });
    });

    // CHAT
    socket.on(
      'team-message',
      (payload: {
        projectId: string;
        username: string;
        message: string;
        id?: string;
        timestamp?: number;
      }) => {
        const { projectId, username, message, id, timestamp } = payload || {};
        if (!projectId || !message?.trim()) return;

        const outbound = {
          projectId,
          username: username || socket.data.user?.name || 'Anonymous',
          message: message.trim(),
          id: id || `${Date.now()}-${socket.id}`,
          timestamp: timestamp || Date.now(),
        };

        io.to(projectId).emit('team-message', outbound);

        socket.to(projectId).emit('notification', {
          type: 'chat',
          message: `${outbound.username}: ${outbound.message.slice(0, 80)}`,
          projectId,
          timestamp: outbound.timestamp,
        });

        saveChatMessage({
          id: outbound.id,
          projectId: outbound.projectId,
          userId: socket.data.user?.id,
          username: outbound.username,
          message: outbound.message,
          timestamp: outbound.timestamp,
        }).catch((err) =>
          console.error('Failed to persist chat message:', err),
        );
      },
    );

    // TYPING INDICATORS
    socket.on(
      'typing-start',
      (payload: { projectId: string; username?: string }) => {
        const projectId = payload?.projectId || socket.data.projectId;
        if (!projectId) return;
        const username =
          payload?.username || socket.data.user?.name || 'Someone';
        socket.to(projectId).emit('user-typing', {
          projectId,
          username,
          userId: socket.data.user?.id || socket.id,
          isTyping: true,
        });
      },
    );

    socket.on(
      'typing-stop',
      (payload: { projectId: string; username?: string }) => {
        const projectId = payload?.projectId || socket.data.projectId;
        if (!projectId) return;
        const username =
          payload?.username || socket.data.user?.name || 'Someone';
        socket.to(projectId).emit('user-typing', {
          projectId,
          username,
          userId: socket.data.user?.id || socket.id,
          isTyping: false,
        });
      },
    );

    // DISCONNECT
    socket.on('disconnect', () => {
      const { projectId, user } = socket.data || {};
      if (projectId) {
        clearCursor(projectId, socket.id);

        // Remove from presence
        const room = projectPresence.get(projectId);
        if (room) {
          room.delete(socket.id);
          if (room.size === 0) projectPresence.delete(projectId);
          else broadcastPresence(projectId);
        }

        // Remove from video room
        const videoRoom = videoRooms.get(projectId);
        if (videoRoom) {
          videoRoom.delete(socket.id);
          if (videoRoom.size === 0) {
            videoRooms.delete(projectId);
          }
        }

        userVideoStates.delete(socket.id);
        io.to(projectId).emit('user-left-video', { socketId: socket.id });

        socket.to(projectId).emit('notification', {
          type: 'presence',
          message: `${user?.name || 'A collaborator'} left the project`,
          projectId,
          timestamp: Date.now(),
        });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
