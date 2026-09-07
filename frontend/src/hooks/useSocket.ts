import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import type { User } from '@/types';

interface UseSocketOptions {
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
  autoConnect?: boolean;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Global socket instance
let globalSocket: Socket | null = null;

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
    // Use existing global socket if available
    if (globalSocket?.connected) {
      setSocket(globalSocket);
      setIsConnected(true);
      attachHistoryCache(globalSocket);
      const currentUser = userRef.current;
      if (currentUser?.id) {
        identifyOnce(globalSocket, currentUser.id);
      }
      if (projectId) {
        joinProject(globalSocket, projectId, currentUser ?? null);
      }
      return;
    }

    const opts = options || {};
    const socketOptions = {
      reconnection: opts.reconnection !== false,
      reconnectionDelay: opts.reconnectionDelay || 1000,
      reconnectionDelayMax: opts.reconnectionDelayMax || 5000,
      reconnectionAttempts: opts.reconnectionAttempts || 5,
      autoConnect: opts.autoConnect !== false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    };

    setIsConnecting(true);

    try {
      const newSocket = io(SOCKET_URL, socketOptions);

      const handleConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        connectionAttemptRef.current = 0;

        const currentUser = userRef.current;
        if (currentUser?.id) {
          identifyOnce(newSocket, currentUser.id);
        }
        const pid = projectIdRef.current;
        if (pid) {
          joinProject(newSocket, pid, currentUser ?? null);
        }
      };

      const handleDisconnect = (reason: string) => {
        setIsConnected(false);
        const s = newSocket as any;
        s.__currentProjectId = undefined;
        if (reason === 'io server disconnect') {
          newSocket.connect();
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

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);
      newSocket.on('reconnect_attempt', handleReconnectAttempt);
      newSocket.on('reconnect_failed', handleReconnectFailed);

      globalSocket = newSocket;
      setSocket(newSocket);
      attachHistoryCache(newSocket);

      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('connect_error', handleConnectError);
        newSocket.off('reconnect_attempt', handleReconnectAttempt);
        newSocket.off('reconnect_failed', handleReconnectFailed);
      };
    } catch (err) {
      const e =
        err instanceof Error ? err : new Error('Failed to create socket');
      setError(e);
      setIsConnecting(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    if (user?.id) {
      identifyOnce(socket, user.id);
    }
    if (projectId) {
      joinProject(socket, projectId, user ?? null);
    }
  }, [socket, isConnected, user, projectId]);

  // Auto-reconnect on mount
  useEffect(() => {
    if (!socket && !isConnecting && !globalSocket?.connected) {
      const timer = setTimeout(() => {
        if (!socket && connectionAttemptRef.current < 3) {
          setIsConnecting(true);
          connectionAttemptRef.current++;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [socket, isConnecting]);

  return {
    socket: socket || globalSocket,
    isConnected: isConnected || globalSocket?.connected || false,
    isConnecting,
    error,
  };
};

export const disconnectSocket = () => {
  if (globalSocket?.connected) {
    globalSocket.disconnect();
  }
  globalSocket = null;
  historyCache.clear();
  historyCacheAttached = false;
};

export const reconnectSocket = () => {
  if (globalSocket && !globalSocket.connected) {
    globalSocket.connect();
  }
};

export const getSocket = (): Socket | null => {
  return globalSocket;
};
