import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { User } from '@/types';
import { socket as sharedSocket } from '@/lib/socket';

interface UseSocketOptions {
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

const historyCache = new Map<string, any[]>();
let historyCacheAttached = false;

function attachHistoryCache(socket: Socket) {
  if (historyCacheAttached) return;
  historyCacheAttached = true;
  socket.on(
    'chat-history',
    (payload: { projectId: string; messages: any[] }) => {
      historyCache.set(payload.projectId, payload.messages);
    },
  );
}

export function getCachedHistory(projectId: string) {
  return historyCache.get(projectId) ?? null;
}

function identifyOnce(socket: Socket, userId: string) {
  const s = socket as any;
  if (s.__identifiedUserId === userId) return;
  s.__identifiedUserId = userId;
  socket.emit('identify', { userId });
}

function joinProject(
  socket: Socket,
  projectId: string,
  user: User | null | undefined,
) {
  const s = socket as any;
  const prevProjectId: string | undefined = s.__currentProjectId;
  if (prevProjectId && prevProjectId !== projectId) {
    socket.emit('leave-project', {
      projectId: prevProjectId,
      user: user ?? null,
    });
    s.__currentProjectId = undefined;
  }
  const alreadyJoined = s.__currentProjectId === projectId;
  const hasCache = historyCache.has(projectId);
  if (alreadyJoined && hasCache) return;
  s.__currentProjectId = projectId;
  socket.emit('join-project', { projectId, user: user ?? null });
}

export const useSocket = (
  projectId?: string,
  user?: User | null,
  options?: UseSocketOptions | null,
) => {
  const socket = sharedSocket;

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const connectionAttemptRef = useRef(0);

  const userRef = useRef<User | null | undefined>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const projectIdRef = useRef(projectId);
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    if (!options) return;
    const manager = socket.io;
    if (options.reconnection !== undefined)
      manager.reconnection(options.reconnection);
    if (options.reconnectionDelay !== undefined)
      manager.reconnectionDelay(options.reconnectionDelay);
    if (options.reconnectionDelayMax !== undefined)
      manager.reconnectionDelayMax(options.reconnectionDelayMax);
    if (options.reconnectionAttempts !== undefined)
      manager.reconnectionAttempts(options.reconnectionAttempts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    attachHistoryCache(socket);

    try {

      const handleConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        connectionAttemptRef.current = 0;

        const currentUser = userRef.current;
        if (currentUser?.id) {
          identifyOnce(socket, currentUser.id);
        }
        const pid = projectIdRef.current;
        if (pid) {
          joinProject(socket, pid, currentUser ?? null);
        }
      };

      const handleDisconnect = (reason: string) => {
        setIsConnected(false);
        (socket as any).__currentProjectId = undefined;
        if (reason === 'io server disconnect') {
          socket.connect();
        }
      };

      const handleConnectError = (err: Error) => {
        setError(err);
        setIsConnecting(false);
        connectionAttemptRef.current++;
      };

      const handleReconnectAttempt = () => setIsConnecting(true);

      const handleReconnectFailed = () => {
        setError(new Error('Failed to reconnect'));
        setIsConnecting(false);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.io.on('reconnect_attempt', handleReconnectAttempt);
      socket.io.on('reconnect_failed', handleReconnectFailed);

      if (socket.connected) {
        handleConnect();
      } else if (!socket.active) {
        setIsConnecting(true);
        socket.connect();
      }

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        socket.io.off('reconnect_attempt', handleReconnectAttempt);
        socket.io.off('reconnect_failed', handleReconnectFailed);
      };
    } catch (err) {
      const e =
        err instanceof Error ? err : new Error('Failed to create socket');
      setError(e);
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    if (user?.id) {
      identifyOnce(socket, user.id);
    }
    if (projectId) {
      joinProject(socket, projectId, user ?? null);
    }
  }, [socket, isConnected, user, projectId]);

  return {
    socket,
    isConnected,
    isConnecting,
    error,
  };
};

export const disconnectSocket = () => {
  if (sharedSocket?.connected) {
    sharedSocket.disconnect();
  }
  historyCache.clear();
  historyCacheAttached = false;
};

export const reconnectSocket = () => {
  if (!sharedSocket.connected) {
    sharedSocket.connect();
  }
};

export const getSocket = (): Socket => sharedSocket;
