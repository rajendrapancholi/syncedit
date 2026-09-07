'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCachedHistory, useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/features/auth/authStore';
import { ChatMessage } from '@/types/chat';

type TypingUser = {
  username: string;
  userId: string;
};

type StoredMessage = ChatMessage & { id?: string; timestamp?: number };

export function useChatSocket(projectId: string, currentUsername: string) {
  const user = useAuthStore((s) => s.user);
  const { socket, isConnected } = useSocket(projectId, user);

  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const seenIds = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const remoteTypingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    setMessages([]);
    seenIds.current.clear();
    setTypingUsers([]);
    remoteTypingTimers.current.forEach((t) => clearTimeout(t));
    remoteTypingTimers.current.clear();
  }, [projectId]);

  useEffect(() => {
    const cached = getCachedHistory(projectId);
    if (cached && cached.length > 0) {
      cached.forEach((m) => {
        if (m.id) seenIds.current.add(m.id);
      });
      setMessages(cached);
    }
  }, [projectId, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handleHistory = (payload: {
      projectId: string;
      messages: StoredMessage[];
    }) => {
      if (payload.projectId !== projectId) return;
      payload.messages.forEach((m) => {
        if (m.id) seenIds.current.add(m.id);
      });
      setMessages(payload.messages);
    };

    socket.on('chat-history', handleHistory);
    return () => {
      socket.off('chat-history', handleHistory);
    };
  }, [socket, projectId]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg: StoredMessage & { projectId: string }) => {
      if (msg.projectId !== projectId) return;
      if (msg.id && seenIds.current.has(msg.id)) return;
      if (msg.id) seenIds.current.add(msg.id);

      setMessages((prev) => [...prev, msg]);
      setTypingUsers((prev) => prev.filter((u) => u.username !== msg.username));
    };

    socket.on('team-message', handleIncoming);
    return () => {
      socket.off('team-message', handleIncoming);
    };
  }, [socket, projectId]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (payload: {
      projectId: string;
      username: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.projectId !== projectId) return;
      if (payload.userId === user?.id || payload.username === currentUsername)
        return;

      const key = payload.userId || payload.username;
      const existing = remoteTypingTimers.current.get(key);
      if (existing) {
        clearTimeout(existing);
        remoteTypingTimers.current.delete(key);
      }

      if (payload.isTyping) {
        setTypingUsers((prev) =>
          prev.some((u) => u.userId === key || u.username === payload.username)
            ? prev
            : [...prev, { username: payload.username, userId: key }],
        );
        const timer = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter(
              (u) => u.userId !== key && u.username !== payload.username,
            ),
          );
          remoteTypingTimers.current.delete(key);
        }, 4000);
        remoteTypingTimers.current.set(key, timer);
      } else {
        setTypingUsers((prev) =>
          prev.filter(
            (u) => u.userId !== key && u.username !== payload.username,
          ),
        );
      }
    };

    socket.on('user-typing', handleTyping);
    return () => {
      socket.off('user-typing', handleTyping);
      remoteTypingTimers.current.forEach((t) => clearTimeout(t));
      remoteTypingTimers.current.clear();
    };
  }, [socket, projectId, user?.id, currentUsername]);

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current || !socket || !isConnected) return;
    isTypingRef.current = false;
    socket.emit('typing-stop', {
      projectId,
      username: currentUsername || user?.name || 'Guest',
    });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, isConnected, projectId, currentUsername, user?.name]);

  const notifyTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing-start', {
        projectId,
        username: currentUsername || user?.name || 'Guest',
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 1500);
  }, [socket, isConnected, projectId, currentUsername, user?.name, stopTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !isConnected || !socket) return;
      stopTyping();

      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const msg: StoredMessage = {
        id,
        username: currentUsername || user?.name || 'Guest',
        message: text.trim(),
        timestamp: Date.now(),
      };

      seenIds.current.add(id!);
      setMessages((prev) => [...prev, msg]);
      socket.emit('team-message', { projectId, ...msg });
    },
    [socket, isConnected, projectId, currentUsername, user?.name, stopTyping],
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && socket) {
        socket.emit('typing-stop', {
          projectId,
          username: currentUsername || user?.name || 'Guest',
        });
      }
    };
  }, [socket, projectId, currentUsername, user?.name]);

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    notifyTyping,
    stopTyping,
  };
}
