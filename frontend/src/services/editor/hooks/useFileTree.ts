'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/features/auth/authStore';
import { FileNode } from '@/types/file';
import { useProject } from '@/hooks/useProject';

export const useFileTree = (projectId: string) => {
  const { data } = useProject(projectId);
  const initialTree = data?.tree || [];

  const [tree, setTree] = useState<FileNode[]>(initialTree);
  const user = useAuthStore((s) => s.user);
  const { socket, isConnected } = useSocket(projectId, user);

  useEffect(() => {
    if (initialTree.length > 0 && tree.length === 0) {
      setTree(initialTree);
    }
  }, [initialTree]);

  useEffect(() => {
    if (!projectId || !socket || !isConnected) return;

    socket.emit('file_tree:join', { projectId });

    const handleUpdate = (updatedTree: FileNode[]) => {
      console.log('Received tree update:', updatedTree);
      setTree(updatedTree);
    };

    const handleEditDenied = (payload: { reason: string }) => {
      console.warn('File tree edit denied:', payload?.reason);
    };

    socket.on('file_tree:init', handleUpdate);
    socket.on('file_tree:update', handleUpdate);
    socket.on('edit_denied', handleEditDenied);

    return () => {
      socket.off('file_tree:init', handleUpdate);
      socket.off('file_tree:update', handleUpdate);
      socket.off('edit_denied', handleEditDenied);
      socket.emit('file_tree:leave', { projectId });
    };
  }, [projectId, socket, isConnected]);

  const updateContent = (fileId: string, content: string) => {
    if (!socket || !isConnected) return;
    socket.emit('file:update_content', { projectId, fileId, content });
  };

  const create = (
    parentId: string | null,
    name: string,
    type: 'file' | 'folder',
  ) => {
    if (!socket || !isConnected) {
      console.warn('Cannot create file/folder: socket not connected yet.');
      return;
    }
    socket.emit('file:create', { projectId, name, type, parentId });
  };

  const remove = (id: string, type: 'file' | 'folder') => {
    if (!socket || !isConnected) return;
    socket.emit('file:delete', { projectId, id, type });
  };

  const rename = (id: string, type: 'file' | 'folder', name: string) => {
    if (!socket || !isConnected) return;
    socket.emit('file:rename', { projectId, id, type, name });
  };

  return { tree, create, remove, rename, updateContent, isConnected };
};
