'use client';

import { FileNode } from '@/types/file';
import {
  Plus,
  X,
  FileCode,
  Circle,
  Clock,
  Users,
  AlertCircle,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useYjsSync } from '../hooks/useYjsSync';
import { socket } from '@/lib/socket';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getFileLanguage } from './EditorTab';
import { cn } from '@/lib/utils/cn';
import Tooltip from '@/shared/components/Tooltip';

export type TabsProps = {
  projectId: string;
  openFiles: FileNode[];
  activeFile: FileNode | null;
  readOnly?: boolean;
  setActiveFile: React.Dispatch<React.SetStateAction<FileNode | null>>;
  closeFile: (file: FileNode) => void;
  onNewFile: () => void;
  dirtyFiles: Set<string>;
  onSave: (fileId: string, content: string) => Promise<void>;
  onDirty?: (fileId: string) => void;
};

export default function Tabs({
  openFiles,
  activeFile,
  projectId,
  readOnly,
  setActiveFile,
  closeFile,
  onNewFile,
  dirtyFiles,
  onSave,
}: TabsProps) {
  const isActiveFileDirty = activeFile ? dirtyFiles?.has(activeFile.id) : false;
  const [content, setContent] = useState(activeFile?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [remoteEdits, setRemoteEdits] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const { syncState } = useYjsSync({
    projectId,
    fileId: activeFile?.id || '',
    socket,
  });

  const language = getFileLanguage(activeFile?.name || '');

  const handleSave = useCallback(
    async (contentToSave?: string) => {
      if (!socket || isSaving || readOnly || !activeFile) return;

      setIsSaving(true);
      try {
        const finalContent = contentToSave ?? contentRef.current;
        await onSave(activeFile.id, finalContent);
        socket.emit('file_saved', { projectId, fileId: activeFile.id });
        setLastSavedTime(Date.now());
      } catch (err) {
        console.error('Save failed:', err);
        toast.error('Failed to save file');
      } finally {
        setIsSaving(false);
      }
    },
    [socket, isSaving, readOnly, onSave, activeFile?.id, projectId],
  );

  return (
    <div className="flex items-center bg-card/50 border-b border-border h-10">
      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar min-w-0">
        {openFiles.map((file: FileNode) => {
          const isDirty = dirtyFiles?.has(file.id);
          const isActive = activeFile?.id === file.id;

          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`group flex items-center gap-2 px-3 h-full border-r border-border cursor-pointer transition-all shrink-0 max-w-[180px] ${
                isActive
                  ? 'bg-background text-primary'
                  : 'text-muted-foreground hover:bg-accent/40'
              }`}
            >
              <FileCode size={14} className="shrink-0" />
              <span className="text-[11px] truncate">{file.name}</span>

              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                {isDirty && (
                  <Circle
                    size={8}
                    className="fill-primary text-primary group-hover:hidden"
                  />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file);
                  }}
                  className={`p-0.5 rounded hover:bg-muted transition-all ${
                    isDirty
                      ? 'hidden group-hover:block'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={(e) => {
            e.preventDefault();
            onNewFile();
          }}
          className="p-2 h-full flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-primary transition-colors border-r border-border shrink-0"
          title="New File"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex items-center h-full shrink-0 border-l border-border">
        <div
          className={`flex items-center gap-3 h-full bg-card/30 overflow-hidden transition-all duration-300 ease-in-out ${
            isMinimized
              ? 'max-w-0 opacity-0 px-0'
              : 'max-w-105 opacity-100 px-3'
          }`}
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            {isActiveFileDirty && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-[11px] font-medium">
                <Clock size={11} />
                Unsaved
              </div>
            )}

            {syncState === 'syncing' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[11px] font-medium">
                <Users size={11} />
                Syncing...
              </div>
            )}

            {syncState === 'error' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[11px] font-medium">
                <AlertCircle size={11} />
                Sync Error
              </div>
            )}

            {remoteEdits > 0 && (
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                +{remoteEdits} remote
              </div>
            )}
          </div>

          {language && (
            <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
              {language}
            </span>
          )}

          {lastSavedTime && !isActiveFileDirty && (
            <span className="text-[11px] text-green-600 flex items-center gap-1 whitespace-nowrap">
              <Check size={12} />
              Saved
            </span>
          )}

          <button
            onClick={() => handleSave()}
            disabled={!isActiveFileDirty || readOnly || isSaving}
            className="px-3 py-1 text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <Tooltip content={isMinimized ? 'Expand actions' : 'Minimize actions'}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={cn(
              'p-2 h-full flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-primary  border-border  transition-all md:title-none',
              isMinimized && 'rotate-180',
            )}
          >
            <ChevronRight size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
