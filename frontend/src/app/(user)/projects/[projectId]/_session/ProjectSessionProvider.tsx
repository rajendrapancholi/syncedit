'use client';

import { createContext, useContext } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/services/stream/hooks/useWebRTC';
import { useAuthStore } from '@/features/auth/authStore';
import type { User } from '@/types';

interface ProjectSessionValue {
  socket: ReturnType<typeof useSocket>['socket'];
  isConnected: boolean;
  isConnecting: boolean;
  user: User;
  projectId: string;
  webrtc: ReturnType<typeof useWebRTC>;
}

const ProjectSessionContext = createContext<ProjectSessionValue | null>(null);

export default function ProjectSessionProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const { socket, isConnected, isConnecting } = useSocket(projectId, user);
  const webrtc = useWebRTC(projectId, user);

  return (
    <ProjectSessionContext.Provider
      value={{ socket, isConnected, isConnecting, user, projectId, webrtc }}
    >
      {children}
    </ProjectSessionContext.Provider>
  );
}

export function useProjectSession() {
  const ctx = useContext(ProjectSessionContext);
  if (!ctx) {
    throw new Error(
      'useProjectSession must be used inside <ProjectSessionProvider>',
    );
  }
  return ctx;
}
