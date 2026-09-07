'use client';

import { useState, useRef, useEffect } from 'react';
import { FileNode } from '@/types/file';
import { User } from '@/types';
import FileTree from '../../services/editor/conponents/FileTree';
import Tabs from '../../services/editor/conponents/Tabs';
import EditorTab from '../../services/editor/conponents/EditorTab';
import {
  FilePlus,
  FolderPlus,
  Terminal,
  Sparkles,
  Lock,
  FolderTree,
} from 'lucide-react';
import { useFileTree } from '@/services/editor/hooks/useFileTree';
import CreateNode from '../CreateNode';
import toast from 'react-hot-toast';
import PanelResizer from '../ui/PanelResizer';
import Tooltip from '@/shared/components/Tooltip';

interface IDELayoutProps {
  tree: FileNode[];
  user: User;
  projectId: string;
  canEdit: boolean;
}

const MINI_WIDTH = 56;
const DEFAULT_WIDTH = 220;
export default function IDELayout({
  tree: initialTree,
  user,
  projectId,
  canEdit,
}: IDELayoutProps) {
  const { tree: liveTree, create } = useFileTree(projectId);
  const displayTree = liveTree.length > 0 ? liveTree : initialTree;

  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [modalType, setModalType] = useState<'file' | 'folder' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isResizing = useRef(false);
  const prevSidebarWidthRef = useRef(DEFAULT_WIDTH);

  const isMini = sidebarWidth <= MINI_WIDTH;

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  const toggleSidebarCollapse = () => {
    if (isSidebarCollapsed) {
      setSidebarWidth(prevSidebarWidthRef.current || DEFAULT_WIDTH);
      setIsSidebarCollapsed(false);
    } else {
      prevSidebarWidthRef.current = sidebarWidth;
      setSidebarWidth(MINI_WIDTH);
      setIsSidebarCollapsed(true);
    }
  };

  const handleDirty = (fileId: string) => {
    setDirtyFiles((prev) => new Set(prev).add(fileId));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      if (newWidth < MINI_WIDTH) {
        setSidebarWidth(MINI_WIDTH);
        setIsSidebarCollapsed(true);
      } else if (newWidth <= 600) {
        setSidebarWidth(newWidth);
        setIsSidebarCollapsed(false);
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

  const openFile = (file: FileNode) => {
    setOpenFiles((prev) =>
      prev.find((f) => f.id === file.id) ? prev : [...prev, file],
    );
    setActiveFile(file);
  };

  const closeFile = (file: FileNode) => {
    const newFiles = openFiles.filter((f) => f.id !== file.id);
    setOpenFiles(newFiles);
    if (activeFile?.id === file.id)
      setActiveFile(newFiles[newFiles.length - 1] || null);
  };

  const handleCreate = async (name: string, type: 'file' | 'folder') => {
    if (!canEdit) {
      toast.error('You do not have permission to modify this project');
      return;
    }
    const toastId = toast.loading(`Provisioning ${type}...`);
    try {
      create(null, name, type);
      toast.success(`${name} initialized`, { id: toastId });
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Orchestration failed', { id: toastId });
    }
  };

  const handleManualSave = async (fileId: string, content: string) => {
    try {
      const res = await fetch(`/api/files/content/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to save file');
      }

      if (res.ok) {
        setDirtyFiles((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
      }
    } catch (error) {
      toast.error('Save failed');
    }
  };

  return (
    <div className="relative flex w-full h-full bg-background overflow-hidden">
      {/* SIDEBAR / EXPLORER */}
      <aside
        style={{ width: sidebarWidth }}
        className={`relative flex flex-col bg-card/50 backdrop-blur-xl border-r border-border group/sidebar overflow-hidden ${
          isDragging ? '' : 'transition-[width,background] duration-200'
        }`}
      >
        {/* Header Area */}
        <div className="h-12 px-4 flex-between border-b border-border/50 bg-background/20">
          {!isMini && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Explorer
            </span>
          )}

          {canEdit && !isMini ? (
            <div className="flex gap-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => {
                  setModalType('file');
                  setIsModalOpen(true);
                }}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
              >
                <FilePlus size={14} />
              </button>
              <button
                onClick={() => {
                  setModalType('folder');
                  setIsModalOpen(true);
                }}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
              >
                <FolderPlus size={14} />
              </button>
            </div>
          ) : (
            <div className="p-1.5 z-10 rounded-md hover:bg-accent text-primary transition-colors">
              <FolderTree size={14} />
            </div>
          )}
        </div>
        {isMini ? (
          <div className="absolute inset-0 flex items-center justify-center italic text-xl [writing-mode:vertical-lr] [text-orientation:upright] text-muted-foreground/50 select-none uppercase bg-background overflow-hidden">
            explorer
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar">
            <FileTree
              tree={displayTree}
              onSelect={openFile}
              projectId={projectId}
              sidebarWidth={sidebarWidth}
              readOnly={!canEdit}
            />
          </div>
        )}
      </aside>

      <PanelResizer
        edge="right"
        tooltipSide="right"
        offset={sidebarWidth}
        isDragging={isDragging}
        isCollapsed={isSidebarCollapsed}
        onDragStart={startResize}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <div className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 relative overflow-hidden">
            {activeFile ? (
              <EditorTab
                key={activeFile.id}
                file={activeFile}
                projectId={projectId}
                user={user}
                onSave={handleManualSave}
                readOnly={!canEdit}
                isDirty={dirtyFiles.has(activeFile.id)}
                onDirty={handleDirty}
                openFiles={openFiles}
                setActiveFile={setActiveFile}
                closeFile={closeFile}
                onNewFile={() => {
                  setModalType('file');
                  setIsModalOpen(true);
                }}
                dirtyFiles={dirtyFiles}
              />
            ) : (
              <div className="flex-col-center h-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-3">
                  {canEdit ? (
                    <button
                      onClick={() => {
                        setModalType('file');
                        setIsModalOpen(true);
                      }}
                      className="flex-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-md text-xs font-bold transition-all"
                    >
                      <FilePlus size={14} /> New File
                    </button>
                  ) : (
                    <div className="flex-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md text-xs font-bold cursor-not-allowed">
                      <Lock size={14} /> Read Only
                    </div>
                  )}
                  <button className="flex-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-md text-xs font-bold transition-all">
                    <Terminal size={14} /> Terminal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!canEdit && (
          <div className="absolute bottom-4 right-6 flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest opacity-70">
            <Tooltip content="Read Only">
              <Lock className="size-10 px-3 py-1.5 text-yellow-500 " />
            </Tooltip>
          </div>
        )}
      </main>

      {canEdit && (
        <CreateNode
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={modalType ?? 'file'}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
