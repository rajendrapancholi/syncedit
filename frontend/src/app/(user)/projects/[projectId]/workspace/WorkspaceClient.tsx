'use client';

import { Activity, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, LucideIcon, MessagesSquare, Users, Video } from 'lucide-react';
import { notFound } from 'next/navigation';
import Navbar from '@/shared/components/Navbar';
import ProjectCartSkeleton from '@/components/ProjectCartSkeleton';
import Tooltip from '@/shared/components/Tooltip';
import { useProjectSession } from '../_session/ProjectSessionProvider';
import { useProject } from '@/hooks/useProject';
import { useFileTree } from '@/services/editor/hooks/useFileTree';
import IDELayout from '@/components/layouts/IDELayout';
import PanelResizer from '@/components/ui/PanelResizer';
import StreamPanel from './_dock/StreamPanel';
import ChatPanel from './_dock/ChatPanel';
import AiPanel from './_dock/AiPanel';
import UsersPanel from './_dock/UsersPanel';
import { cn } from '@/lib/utils/cn';

type PanelKey = 'team' | 'ai' | 'users' | 'stream';

const VALID_PANELS: PanelKey[] = ['team', 'ai', 'users', 'stream'];
const PANEL_ORDER: PanelKey[] = ['stream', 'team', 'ai', 'users'];

export default function WorkspaceClient({
  projectId,
  initialPanels,
}: {
  projectId: string;
  initialPanels?: string;
}) {
  const { data, isLoading, isError, error } = useProject(projectId);
  const { user, isConnected } = useProjectSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPanels = (searchParams.get('panels') ?? initialPanels)?.replace(
    / /g,
    '+',
  );

  const openPanels = new Set<PanelKey>(
    rawPanels
      ?.split('+')
      .filter((p): p is PanelKey => VALID_PANELS.includes(p as PanelKey)) ?? [
      'team',
    ],
  );

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const MINI_WIDTH = 56;
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const prevSidebarWidthRef = useRef(320);
  const isResizing = useRef(false);
  const { tree } = useFileTree(projectId);

  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isVerticalResizing = useRef(false);
  const resizeInfo = useRef<{
    panelAbove: PanelKey;
    panelBelow: PanelKey;
    startY: number;
    startAbove: number;
    startBelow: number;
  } | null>(null);
  const activePanels = PANEL_ORDER.filter((p) => openPanels.has(p));

  useEffect(() => {
    if (activePanels.length === 0) return;

    setPanelHeights((prev) => {
      const next = { ...prev };
      const missing = activePanels.filter((p) => next[p] === undefined);

      if (
        missing.length > 0 ||
        Object.keys(next).length !== activePanels.length
      ) {
        const equal = 1 / activePanels.length;
        activePanels.forEach((p) => {
          next[p] = equal;
        });
      }
      return next;
    });
  }, [activePanels.join('+')]);

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
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        !isVerticalResizing.current ||
        !resizeInfo.current ||
        !containerRef.current
      )
        return;

      const { panelAbove, panelBelow, startY, startAbove, startBelow } =
        resizeInfo.current;
      const containerHeight = containerRef.current.clientHeight;
      const delta = (e.clientY - startY) / containerHeight;

      let newAbove = startAbove + delta;
      let newBelow = startBelow - delta;

      const MIN = 0.12;
      if (newAbove < MIN) {
        newAbove = MIN;
        newBelow = startAbove + startBelow - MIN;
      }
      if (newBelow < MIN) {
        newBelow = MIN;
        newAbove = startAbove + startBelow - MIN;
      }

      setPanelHeights((h) => ({
        ...h,
        [panelAbove]: newAbove,
        [panelBelow]: newBelow,
      }));
    };

    const handleMouseUp = () => {
      isVerticalResizing.current = false;
      resizeInfo.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startVerticalResize = (
    e: React.MouseEvent,
    panelAbove: PanelKey,
    panelBelow: PanelKey,
  ) => {
    e.preventDefault();
    isVerticalResizing.current = true;
    resizeInfo.current = {
      panelAbove,
      panelBelow,
      startY: e.clientY,
      startAbove: panelHeights[panelAbove] ?? 0.5,
      startBelow: panelHeights[panelBelow] ?? 0.5,
    };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

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

  const togglePanel = (key: PanelKey) => {
    const next = new Set(openPanels);
    next.has(key) ? next.delete(key) : next.add(key);

    const params = new URLSearchParams(searchParams.toString());
    next.size === 0
      ? params.delete('panels')
      : params.set('panels', [...next].join('+'));

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const tabs: { key: PanelKey; label: string; icon: LucideIcon }[] = [
    { key: 'team', label: 'Team Chat', icon: MessagesSquare },
    { key: 'ai', label: 'AI Agent', icon: Bot },
    { key: 'users', label: 'Live Users', icon: Users },
    { key: 'stream', label: 'Live Stream', icon: Video },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-background',
        isDragging && 'select-none',
      )}
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
                  onClick={() => togglePanel(key)}
                  aria-pressed={openPanels.has(key)}
                  className={`w-full h-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    openPanels.has(key)
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:bg-muted'
                  } ${!isMini && openPanels.has(key) ? 'border-b-2 border-primary' : ''}`}
                >
                  <div className="flex items-center justify-center w-4 h-4">
                    <Icon size={16} />
                  </div>
                </button>
              </Tooltip>
            ))}
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-hidden flex flex-col relative"
          >
            {isMini && (
              <div className="absolute uppercase top-4 left-0 right-0 flex items-center justify-center italic text-md tracking-[0.15em] whitespace-nowrap [writing-mode:vertical-lr] [text-orientation:upright] text-muted-foreground/50 select-none bg-background z-10 overflow-hidden">
                {openPanels.values().next().value} ACTIVE
              </div>
            )}

            {!isMini &&
              PANEL_ORDER.map((key, index) => {
                const isOpen = openPanels.has(key);
                const openIndex = activePanels.indexOf(key);
                const isLastOpen = openIndex === activePanels.length - 1;
                const height = isOpen
                  ? (panelHeights[key] ?? 1 / Math.max(activePanels.length, 1))
                  : 0;

                return (
                  <div
                    key={key}
                    className="flex flex-col min-h-0 relative"
                    style={{
                      flex: isOpen ? height : 0,
                      display: isOpen ? 'flex' : 'none',
                    }}
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <Activity mode={isOpen ? 'visible' : 'hidden'}>
                        {key === 'stream' && <StreamPanel />}
                        {key === 'team' && (
                          <ChatPanel
                            projectId={projectId}
                            currentUsername={user?.name || 'Guest'}
                          />
                        )}
                        {key === 'ai' && <AiPanel projectId={projectId} />}
                        {key === 'users' && (
                          <UsersPanel projectId={projectId} />
                        )}
                      </Activity>
                    </div>

                    {isOpen && !isLastOpen && (
                      <PanelResizer
                        edge="bottom"
                        isDragging={isVerticalResizing.current}
                        onDragStart={(e) =>
                          startVerticalResize(e, key, activePanels[index + 1])
                        }
                        tooltipSide={'top'}
                        isCollapsed={false}
                        onToggleCollapse={() => {}}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </aside>
      </div>
    </div>
  );
}
