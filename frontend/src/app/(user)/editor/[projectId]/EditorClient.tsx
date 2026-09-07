'use client';

import { Activity, useEffect, useRef, useState } from 'react';
import { Bot, LucideIcon, MessagesSquare, Users, Video } from 'lucide-react';
import { notFound } from 'next/navigation';

import IDELayout from '@/components/layouts/IDELayout';
import AiChat from '@/services/chat/components/Chat';
import LiveChat from '@/services/chat/components/LiveChat';
import UserList from '@/components/UserList';
import Navbar from '@/shared/components/Navbar';
import ProjectCartSkeleton from '@/components/ProjectCartSkeleton';

import { useAuthStore } from '@/features/auth/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useFileTree } from '@/services/editor/hooks/useFileTree';
import { useProject } from '@/hooks/useProject';
import { useNotificationSocket } from '@/services/notifications/hooks/useNotifications';
import VideoChat from '@/services/stream/components/VideoChat';
import Tooltip from '@/shared/components/Tooltip';
import PanelResizer from '@/components/ui/PanelResizer';

export default function EditorClient({ projectId }: { projectId: string }) {
  const { data, isLoading, isError, error } = useProject(projectId);
  const user = useAuthStore((state) => state.user);

  const [rightPanel, setRightPanel] = useState<
    'ai' | 'team' | 'users' | 'stream'
  >('team');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MINI_WIDTH = 56;
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const prevSidebarWidthRef = useRef(320);

  const isResizing = useRef(false);

  const { tree } = useFileTree(projectId);
  const { isConnected } = useSocket(projectId, user);
  useNotificationSocket(projectId, user);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-width');
    if (saved) setSidebarWidth(parseInt(saved, 10));
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 60 && newWidth <= 600) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth < MINI_WIDTH) {
        setSidebarWidth(MINI_WIDTH);
        setIsPanelCollapsed(true);
      } else if (newWidth <= 600) {
        setSidebarWidth(newWidth);
        setIsPanelCollapsed(false);
      }
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isMini = mounted ? sidebarWidth < 140 : false;

  if (isLoading) return <ProjectCartSkeleton />;

  if (isError || !data) {
    const errMsg = error instanceof Error ? error.message : '';
    if (errMsg === 'UNAUTHORIZED') {
      return (
        <div className="flex-col-center h-screen bg-background text-center space-y-3">
          <p className="text-2xl font-bold">401</p>
          <p className="text-muted-foreground text-sm">
            Session expired. Please log in again.
          </p>
          <a href="/login" className="text-primary text-sm underline">
            Go to Login
          </a>
        </div>
      );
    }
    if (errMsg === 'FORBIDDEN') {
      return (
        <div className="flex-col-center h-screen bg-background text-center space-y-3">
          <p className="text-2xl font-bold">403</p>
          <p className="text-muted-foreground text-sm">
            You do not have access to this project.
          </p>
          <a href="/dashboard" className="text-primary text-sm underline">
            Back to Dashboard
          </a>
        </div>
      );
    }
    return notFound();
  }

  const { project, accessLevel } = data;
  const canEdit = accessLevel !== 'view';

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };
  const togglePanelCollapse = () => {
    if (isPanelCollapsed) {
      setSidebarWidth(prevSidebarWidthRef.current || 320);
      setIsPanelCollapsed(false);
    } else {
      prevSidebarWidthRef.current = sidebarWidth;
      setSidebarWidth(MINI_WIDTH);
      setIsPanelCollapsed(true);
    }
  };

  const tabs: { key: typeof rightPanel; label: string; icon: LucideIcon }[] = [
    { key: 'team', label: 'Team Chat', icon: MessagesSquare },
    { key: 'ai', label: 'AI Agent', icon: Bot },
    { key: 'users', label: 'Live Users', icon: Users },
    { key: 'stream', label: 'Live Stream', icon: Video },
  ];

  return (
    <div
      className={`flex flex-col h-screen bg-background ${isDragging ? 'select-none' : ''}`}
    >
      <Navbar
        projectTitle={project?.name || 'Untitled Project'}
        status={isConnected ? 'online' : 'syncing'}
        accessLevel={accessLevel}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <IDELayout
            tree={tree}
            user={user}
            projectId={projectId}
            canEdit={canEdit}
          />
        </div>

        <aside
          style={{ width: sidebarWidth }}
          className="relative border-l border-border bg-card/30 backdrop-blur-xl flex flex-col transition-[width] duration-75 ease-out"
        >
          <PanelResizer
            edge="left"
            tooltipSide="left"
            isDragging={isDragging}
            isCollapsed={isPanelCollapsed}
            onDragStart={startResize}
            onToggleCollapse={togglePanelCollapse}
          />
          <div
            className={`flex border-b border-border w-full ${isMini ? 'flex-col h-auto' : 'h-12'}`}
          >
            {tabs.map(({ key, label, icon: Icon }) => (
              <Tooltip
                key={key}
                position={isMini ? 'left' : 'top'}
                content={label}
              >
                <button
                  onClick={() => setRightPanel(key)}
                  className={`w-full h-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    rightPanel === key
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:bg-muted'
                  } ${!isMini && rightPanel === key ? 'border-b-2 border-primary' : ''}`}
                >
                  <div className="flex items-center justify-center w-4 h-4">
                    <Icon size={16} />
                  </div>
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            {isMini && (
              <div className="absolute uppercase top-4 left-0 right-0 flex items-center justify-center italic text-md tracking-[0.15em] whitespace-nowrap [writing-mode:vertical-lr] [text-orientation:upright] text-muted-foreground/50 select-none bg-background z-10 overflow-hidden">
                {rightPanel} ACTIVE
              </div>
            )}

            <Activity mode={!isMini && rightPanel === 'team' ? 'visible' : 'hidden'}>
              <LiveChat
                projectId={projectId}
                currentUsername={user?.name || 'Guest'}
              />
            </Activity>
            <Activity mode={!isMini && rightPanel === 'ai' ? 'visible' : 'hidden'}>
              <AiChat projectId={projectId} />
            </Activity>
            <Activity mode={!isMini && rightPanel === 'users' ? 'visible' : 'hidden'}>
              <UserList projectId={projectId} />
            </Activity>
            <Activity mode={!isMini && rightPanel === 'stream' ? 'visible' : 'hidden'}>
              <VideoChat projectId={projectId} user={user} />
            </Activity>
          </div>
        </aside>
      </div>
    </div>
  );
}
