'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { FileNode } from '@/types/file';
import { useProject } from '../../../hooks/useProject';

export const useFileTree = (projectId: string) => {
  const { data } = useProject(projectId);
  const initialTree = data?.tree || [];

  const [tree, setTree] = useState<FileNode[]>(initialTree);

  useEffect(() => {
    if (initialTree.length > 0 && tree.length === 0) {
      setTree(initialTree);
    }
  }, [initialTree]);

  useEffect(() => {
    if (!projectId || !socket) return;

    const joinTreeRoom = () => {
      socket.emit('file_tree:join', { projectId });
    };

    joinTreeRoom();
    socket.on('connect', joinTreeRoom);

    const handleUpdate = (updatedTree: FileNode[]) => {
      console.log('Received tree update:', updatedTree);
      setTree(updatedTree);
    };

    socket.on('file_tree:init', handleUpdate);
    socket.on('file_tree:update', handleUpdate);

    return () => {
      socket.off('connect', joinTreeRoom);
      socket.off('file_tree:init', handleUpdate);
      socket.off('file_tree:update', handleUpdate);
      socket.emit('file_tree:leave', { projectId });
    };
  }, [projectId]);

  const updateContent = (fileId: string, content: string) => {
    // Emit via socket so others see it instantly
    socket.emit('file:update_content', { projectId, fileId, content });
  };

  const create = (
    parentId: string | null,
    name: string,
    type: 'file' | 'folder',
  ) => {
    socket.emit('file:create', { projectId, name, type, parentId });
  };

  const remove = (id: string, type: 'file' | 'folder') => {
    socket.emit('file:delete', { projectId, id, type });
  };

  const rename = (id: string, type: 'file' | 'folder', name: string) => {
    socket.emit('file:rename', { projectId, id, type, name });
  };

  return { tree, create, remove, rename, updateContent };
};
