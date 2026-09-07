'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { getUserColorVar } from '@/lib/userColor';

interface CollaboratorUser {
  id: string;
  name: string;
  currentFile?: string;
}

interface UserListProps {
  projectId: string;
  getFileName?: (fileId: string) => string | undefined;
}

export default function UserList({ projectId, getFileName }: UserListProps) {
  const [activeUsers, setActiveUsers] = useState<CollaboratorUser[]>([]);
  const user = useAuthStore((s) => s.user);
  const { socket, isConnected } = useSocket(projectId, user);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePresence = (users: CollaboratorUser[]) => {
      setActiveUsers(users);
    };

    socket.on('update-presence', handlePresence);
    socket.emit('get-active-users', { projectId });

    return () => {
      socket.off('update-presence', handlePresence);
    };
  }, [socket, isConnected, projectId]);

  return (
    <div className="flex-1 flex flex-col bg-card/20 backdrop-blur-md border-l border-border h-full">
      <div className="p-4 border-b border-border/50 flex-between">
        <div className="flex-left gap-2">
          <Users size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
            Collaborators
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black">
          {activeUsers.length} LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">
        {activeUsers.length === 0 ? (
          <div className="h-full flex-col-center opacity-30 text-center gap-2">
            <Users size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Awaiting Peers...
            </p>
          </div>
        ) : (
          activeUsers.map((collaborator) => {
            const colorVar = getUserColorVar(collaborator.id);
            const fileLabel = collaborator.currentFile
              ? (getFileName?.(collaborator.currentFile) ??
                collaborator.currentFile)
              : undefined;

            return (
              <div
                key={collaborator.id}
                className="flex-left gap-3 group animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex-center text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: colorVar }}
                  >
                    {collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card animate-pulse" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {collaborator.name}
                    {user && collaborator.id === user.id ? ' (you)' : ''}
                  </span>
                  <div className="flex-left gap-1 opacity-60">
                    <span className="text-[9px] font-medium uppercase tracking-tighter truncate">
                      {fileLabel ? `Editing ${fileLabel}` : 'Idling...'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-background/40">
        <div className="flex-between text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          <span>Session ID</span>
          <span className="text-primary/60">{projectId.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
}
