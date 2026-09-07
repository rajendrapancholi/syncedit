'use client';

import { useState } from 'react';
import { FileNode } from '@/types/file';
import { User } from '@/types';
import Tabs from '@/services/editor/conponents/Tabs';
import EditorTab from '@/services/editor/conponents/EditorTab';
import { saveFile } from '../lib/fileApi';

interface EditorGroupProps {
  projectId: string;
  user: User;
  canEdit: boolean;
}

export default function EditorGroup({
  projectId,
  user,
  canEdit,
}: EditorGroupProps) {
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  const closeFile = (file: FileNode) => {
    const next = openFiles.filter((f) => f.id !== file.id);
    setOpenFiles(next);
    if (activeFile?.id === file.id)
      setActiveFile(next[next.length - 1] || null);
  };

  const handleDirty = (fileId: string) => {
    setDirtyFiles((prev) => new Set(prev).add(fileId));
  };
  const handleSave = async (fileId: string, content: string) => {
    await saveFile(fileId, content);
    setDirtyFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        openFiles={openFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        closeFile={closeFile}
        dirtyFiles={dirtyFiles}
        onNewFile={() => {}}
      />
      <div className="flex-1 relative overflow-hidden">
        {activeFile ? (
          <EditorTab
            key={activeFile.id}
            file={activeFile}
            projectId={projectId}
            user={user}
            readOnly={!canEdit}
            isDirty={dirtyFiles.has(activeFile.id)}
            onDirty={handleDirty}
            onSave={handleSave}
          />
        ) : (
          <div className="flex-col-center h-full text-muted-foreground text-sm">
            Select a file from the explorer
          </div>
        )}
      </div>
    </div>
  );
}
