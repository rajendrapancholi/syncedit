'use client';

import { create } from 'zustand';
import { useEffect, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { User } from '@/types';

export type AppNotification = {
  id: string;
  message: string;
  type: 'presence' | 'chat' | 'system' | 'invite';
  timestamp: number;
  read: boolean;
};

interface NotificationStore {
  notifications: AppNotification[];
  push: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  push: (n) =>
    set((state) => ({
      notifications: [
        { ...n, id: crypto.randomUUID(), timestamp: Date.now(), read: false },
        ...state.notifications,
      ].slice(0, 50),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clear: () => set({ notifications: [] }),
}));

export function useNotificationSocket(projectId: string, user: User | null) {
  const { socket } = useSocket(projectId, user);
  const push = useNotificationStore((s) => s.push);
  const prevUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !user) return;

    const handlePresence = (users: { id: string; name: string }[]) => {
      const nextIds = new Set(users.map((u) => u.id));
      // joined
      users.forEach((u) => {
        if (u.id !== user.id && !prevUsersRef.current.has(u.id)) {
          push({ type: 'presence', message: `${u.name} joined the project` });
        }
      });
      // left
      prevUsersRef.current.forEach((id) => {
        if (!nextIds.has(id) && id !== user.id) {
          push({
            type: 'presence',
            message: `A collaborator left the project`,
          });
        }
      });
      prevUsersRef.current = nextIds;
    };

    const handleTeamMessage = (msg: { username: string; message: string }) => {
      if (user && msg.username === user.name) return;
      push({ type: 'chat', message: `${msg.username}: ${msg.message}` });
    };

    socket.on('update-presence', handlePresence);
    socket.on('team-message', handleTeamMessage);
    return () => {
      socket.off('update-presence', handlePresence);
      socket.off('team-message', handleTeamMessage);
    };
  }, [socket, user, push]);
}
