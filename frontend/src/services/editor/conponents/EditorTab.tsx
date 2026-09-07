'use client';

import { FileNode } from '@/types/file';

import { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useSocket } from '@/hooks/useSocket';
import {
  useYjsSync,
  createYjsBinding,
} from '@/services/editor/hooks/useYjsSync';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { getUserColorClass } from '@/lib/userColor';
import { cn } from "@/lib/utils/cn";
import Tooltip from "@/shared/components/Tooltip";
import { AlertCircle, Check, ChevronRight, Circle, Clock, FileCode, Plus, Users, X } from "lucide-react";

interface EditorTabProps {
  file: FileNode;
  projectId: string;
  user: User | null;
  onSave: (fileId: string, content: string) => Promise<void>;
  readOnly?: boolean;
  isDirty?: boolean;
  onDirty?: (fileId: string) => void;
  onCursorChange?: (pos: { lineNumber: number; column: number }) => void;
  openFiles: FileNode[];
  setActiveFile: React.Dispatch<React.SetStateAction<FileNode | null>>;
  closeFile: (file: FileNode) => void;
  onNewFile: () => void;
  dirtyFiles: Set<string>;
}

export const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  sql: 'sql',
  html: 'html',
  css: 'css',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sh: 'shell',
  bash: 'shell',
};

export const getFileLanguage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[ext] || 'plaintext';
};

export default function EditorTab({
  file,
  projectId,
  user,
  onSave,
  readOnly = false,
  isDirty = false,

  onDirty,
  onCursorChange,
  openFiles,
  setActiveFile,
  closeFile,
  onNewFile,
  dirtyFiles,
}: EditorTabProps) {
  const { socket, isConnected } = useSocket(projectId, user);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [content, setContent] = useState(file.content || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [remoteEdits, setRemoteEdits] = useState(0);
const [isMinimized, setIsMinimized] = useState(false);

  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const {
    ytext,
    isReady: yjsReady,
    syncState,
  } = useYjsSync({
    projectId,
    fileId: file.id,
    socket,
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bindingCleanupRef = useRef<(() => void) | null>(null);
  const remoteCaretDecorations = useRef<Map<string, string[]>>(new Map());
  const remoteSelectionDecorations = useRef<Map<string, string[]>>(new Map());
  const remoteCursorWidgets = useRef<
    Map<string, { widget: any; domNode: HTMLDivElement }>
  >(new Map());
  const remoteChangeRef = useRef(false);

  const handleSave = useCallback(
    async (contentToSave?: string) => {
      if (!socket || isSaving || readOnly) return;

      setIsSaving(true);
      try {
        const finalContent = contentToSave ?? contentRef.current;
        await onSave(file.id, finalContent);
        socket.emit('file_saved', { projectId, fileId: file.id });
        setLastSavedTime(Date.now());
      } catch (err) {
        console.error('Save failed:', err);
        toast.error('Failed to save file');
      } finally {
        setIsSaving(false);
      }
    },
    [socket, isSaving, readOnly, onSave, file.id, projectId],
  );

  const handleEditorMount = useCallback(
    (editor: any, monacoInstance: any) => {
      editorRef.current = editor;
      monacoRef.current = monacoInstance;
      setIsLoading(false);
      onCursorChange?.({ lineNumber: 1, column: 1 });

      editor.updateOptions({
        readOnly: readOnly,
        fontSize: 13,
        fontFamily: 'Fira Code, monospace',
        tabSize: 2,
        wordWrap: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });

      const disposable = editor.onDidChangeModelContent(() => {
        if (remoteChangeRef.current || readOnly) return;

        const newContent = editor.getValue();
        setContent(newContent);
        onDirty?.(file.id);

        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          handleSave(newContent);
        }, 2000);
      });

      const cursorDisposable = editor.onDidChangeCursorSelection((e: any) => {
        const sel = e.selection;
        const position = {
          lineNumber: sel.positionLineNumber,
          column: sel.positionColumn,
        };
        onCursorChange?.(position);

        if (socket && isConnected && !readOnly) {
          const isEmpty =
            sel.startLineNumber === sel.endLineNumber &&
            sel.startColumn === sel.endColumn;

          socket.emit('cursor_move', {
            projectId,
            fileId: file.id,
            cursor: position,
            selection: isEmpty
              ? null
              : {
                  startLineNumber: sel.startLineNumber,
                  startColumn: sel.startColumn,
                  endLineNumber: sel.endLineNumber,
                  endColumn: sel.endColumn,
                },
          });
        }
      });

      return () => {
        disposable?.dispose?.();
        cursorDisposable?.dispose?.();
      };
    },

    [
      file,
      onDirty,
      socket,
      isConnected,
      projectId,
      handleSave,
      readOnly,
      onCursorChange,
    ],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      remoteCursorWidgets.current.forEach(({ widget }) => {
        try {
          editor.removeContentWidget(widget);
        } catch {}
      });
    }
    remoteCaretDecorations.current.clear();
    remoteCursorWidgets.current.clear();
  }, [file.id]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isLoading || !yjsReady || !ytext) return;

    bindingCleanupRef.current = createYjsBinding(
      ytext,
      editor,
      file.id,
      () => setRemoteEdits((prev) => prev + 1),
      contentRef.current,
      remoteChangeRef,
    );

    return () => {
      bindingCleanupRef.current?.();
      bindingCleanupRef.current = null;
    };
  }, [isLoading, yjsReady, ytext, file.id]);

  useEffect(() => {
    if (!socket) return;

    const removeRemoteCursor = (key: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const prevDecorations = remoteCaretDecorations.current.get(key);
      if (prevDecorations) {
        editor.deltaDecorations(prevDecorations, []);
        remoteCaretDecorations.current.delete(key);
      }

      const prevSelDecorations = remoteSelectionDecorations.current.get(key);
      if (prevSelDecorations) {
        editor.deltaDecorations(prevSelDecorations, []);
        remoteSelectionDecorations.current.delete(key);
      }

      const entry = remoteCursorWidgets.current.get(key);
      if (entry) {
        try {
          editor.removeContentWidget(entry.widget);
        } catch {}
        remoteCursorWidgets.current.delete(key);
      }
    };

    const handleCursorUpdate = (payload: {
      fileId: string;
      user: User | null;
      cursor: { lineNumber: number; column: number };
      selection?: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
      } | null;
      role?: 'edit' | 'view';
      socketId?: string;
    }) => {
      if (payload.fileId !== file.id) return;

      const key = payload.socketId || payload.user?.id || 'unknown';

      const editor = editorRef.current;
      const monacoNs = monacoRef.current;
      if (!editor || !monacoNs) return;

      const name =
        (payload.user && (payload.user as any).name) ||
        (payload.user && (payload.user as any).username) ||
        'Guest';
      const roleTag = payload.role === 'view' ? ' (viewing)' : '';
      const label = `${name}${roleTag}`;
      const colorClass = getUserColorClass(key);
      const { lineNumber, column } = payload.cursor;

      if (
        typeof lineNumber !== 'number' ||
        typeof column !== 'number' ||
        lineNumber < 1 ||
        column < 1
      ) {
        return;
      }

      const prevDecorations = remoteCaretDecorations.current.get(key) || [];
      const newDecorations = editor.deltaDecorations(prevDecorations, [
        {
          range: new monacoNs.Range(lineNumber, column, lineNumber, column),
          options: {
            className: `remote-caret ${colorClass}`,
            beforeContentClassName: `remote-caret-flag ${colorClass}`,
            stickiness:
              monacoNs.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        },
      ]);
      remoteCaretDecorations.current.set(key, newDecorations);

      const prevSelDecorations =
        remoteSelectionDecorations.current.get(key) || [];
      if (payload.selection) {
        const { startLineNumber, startColumn, endLineNumber, endColumn } =
          payload.selection;
        const newSelDecorations = editor.deltaDecorations(prevSelDecorations, [
          {
            range: new monacoNs.Range(
              startLineNumber,
              startColumn,
              endLineNumber,
              endColumn,
            ),
            options: {
              className: `remote-selection ${colorClass}`,
              stickiness:
                monacoNs.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          },
        ]);
        remoteSelectionDecorations.current.set(key, newSelDecorations);
      } else if (prevSelDecorations.length) {
        editor.deltaDecorations(prevSelDecorations, []);
        remoteSelectionDecorations.current.delete(key);
      }

      let entry = remoteCursorWidgets.current.get(key);
      if (!entry) {
        const domNode = document.createElement('div');
        domNode.className = `remote-cursor-label ${colorClass}`;
        domNode.textContent = label;
        const positionRef = { lineNumber, column };

        const widget = {
          getId: () => `remote-cursor-widget-${key}`,
          getDomNode: () => domNode,
          getPosition: () => ({
            position: {
              lineNumber: positionRef.lineNumber,
              column: positionRef.column,
            },
            preference: [
              monacoNs.editor.ContentWidgetPositionPreference.ABOVE,
              monacoNs.editor.ContentWidgetPositionPreference.BELOW,
            ],
          }),
          _positionRef: positionRef,
        };
        editor.addContentWidget(widget);
        entry = { widget, domNode };
        remoteCursorWidgets.current.set(key, entry);
      } else {
        entry.domNode.textContent = label;
        entry.domNode.className = `remote-cursor-label ${colorClass}`;
        if (entry.widget._positionRef) {
          entry.widget._positionRef.lineNumber = lineNumber;
          entry.widget._positionRef.column = column;
        }
        editor.layoutContentWidget(entry.widget);
      }
    };

    const handleCursorLeave = (payload: {
      fileId: string;
      userId: string;
      socketId?: string;
    }) => {
      if (payload.fileId !== file.id) return;
      removeRemoteCursor(payload.socketId || payload.userId);
    };

    const handleFileSaved = (payload: {
      fileId: string;
      user: User | null;
    }) => {
      if (payload.fileId !== file.id) return;
      if (!payload.user) return;
      if (user && payload.user.id === user.id) return;
      const userName = payload.user?.name || 'Someone';
    };

    const handleEditDenied = (payload: { fileId: string; reason: string }) => {
      if (payload.fileId !== file.id) return;
      toast.error(
        payload.reason || "You don't have permission to edit this file.",
      );
    };

    socket.on('cursor_update', handleCursorUpdate);
    socket.on('cursor_leave', handleCursorLeave);
    socket.on('file_saved_notification', handleFileSaved);
    socket.on('edit_denied', handleEditDenied);

    return () => {
      socket.off('cursor_update', handleCursorUpdate);
      socket.off('cursor_leave', handleCursorLeave);
      socket.off('file_saved_notification', handleFileSaved);
      socket.off('edit_denied', handleEditDenied);
    };
  }, [socket, file.id, user, readOnly]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (bindingCleanupRef.current) {
        bindingCleanupRef.current();
      }
      const editor = editorRef.current;
      if (editor) {
        remoteCursorWidgets.current.forEach(({ widget }) => {
          try {
            editor.removeContentWidget(widget);
          } catch {}
        });
      }
    };
  }, []);

  const language = getFileLanguage(file.name);

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* Tabs */}
      <div className="flex items-center bg-card/50 border-b border-border h-10 shrink-0">
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar min-w-0">
          {openFiles.map((f) => {
            const isFileDirty = dirtyFiles.has(f.id);
            const isActive = file.id === f.id;

            return (
              <div
                key={f.id}
                onClick={() => setActiveFile(f)}
                className={cn(
                  'group flex items-center gap-2 px-3 h-full border-r border-border cursor-pointer transition-all shrink-0 max-w-45',
                  isActive
                    ? 'bg-background text-primary'
                    : 'text-muted-foreground hover:bg-accent/40',
                )}
              >
                <FileCode size={14} className="shrink-0" />
                <span className="text-[11px] truncate">{f.name}</span>

                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  {isFileDirty && (
                    <Circle
                      size={8}
                      className="fill-primary text-primary group-hover:hidden"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(f);
                    }}
                    className={cn(
                      'p-0.5 rounded hover:bg-muted transition-all',
                      isFileDirty
                        ? 'hidden group-hover:block'
                        : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={onNewFile}
            className="p-2 h-full flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-primary transition-colors border-r border-border shrink-0"
            title="New File"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center h-full shrink-0">
          <div
            className={cn(
              'flex items-center gap-2 h-full overflow-hidden transition-all duration-300 ease-in-out',
              isMinimized
                ? 'max-w-0 opacity-0 px-0'
                : 'max-w-105 opacity-100 px-3',
            )}
          >
            {syncState === 'syncing' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[11px] font-medium whitespace-nowrap">
                <Users size={11} />
                Syncing...
              </div>
            )}

            {syncState === 'error' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[11px] font-medium whitespace-nowrap">
                <AlertCircle size={11} />
                Sync Error
              </div>
            )}

            {remoteEdits > 0 && (
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                +{remoteEdits} remote
              </div>
            )}

            {language && (
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                {language}
              </span>
            )}

            {lastSavedTime && !isDirty && (
              <span className="text-[11px] text-green-600 flex items-center gap-1 whitespace-nowrap">
                <Check size={12} />
                Saved
              </span>
            )}
            {isDirty && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-[11px] font-medium whitespace-nowrap">
                <Clock size={11} />
                Unsaved
              </div>
            )}

            <button
              onClick={() => handleSave()}
              disabled={!isDirty || readOnly || isSaving}
              className="px-3 py-1 text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <Tooltip
            content={isMinimized ? 'Expand actions' : 'Minimize actions'}
          >
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={cn(
                'p-2 h-full flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-primary transition-all border-l border-border',
                isMinimized && 'rotate-180',
              )}
            >
              <ChevronRight size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center h-full bg-background z-10">
            <div className="text-sm text-muted-foreground">
              Loading editor...
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language={language}
          defaultValue={content}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            fontFamily: 'Fira Code, monospace',
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
}
