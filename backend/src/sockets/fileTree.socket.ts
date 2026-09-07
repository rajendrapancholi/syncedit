import { Server, Socket } from 'socket.io';
import {
  createFile,
  deleteFile,
  getProjectTree,
  renameFileOrFolder,
} from '../services/file.service';
import { projectTreeService } from '../services/ProjectTreeService';
import { canEditProject } from '../utils/permissions';

export function registerFileTreeSocket(io: Server, socket: Socket) {
  socket.on('file_tree:join', async ({ projectId }: { projectId: string }) => {
    socket.join(projectId);
    let tree = projectTreeService.getTree(projectId);
    if (!tree) {
      tree = await getProjectTree(projectId);
      projectTreeService.setTree(projectId, tree);
    }
    socket.emit('file_tree:init', tree);
  });

  socket.on(
    'file:create',
    async ({
      projectId,
      name,
      type,
      parentId,
    }: {
      projectId: string;
      name: string;
      type: 'file' | 'folder';
      parentId?: string;
    }) => {
      console.log('projectId crated: ', projectId);
      console.log("waht is the error in file:create");
      if (
        !canEditProject(
          socket.data.accessLevel,
          socket.data.user?.role === 'admin',
        )
      ) {
        return socket.emit('edit_denied', {
          reason: 'You have view-only access to this project.',
        });
      }
      const newNode = await createFile(projectId, name, type, parentId);

      projectTreeService.insertNode(projectId, newNode, parentId);
      io.to(projectId).emit(
        'file_tree:update',
        projectTreeService.getTree(projectId),
      );
    },
  );

  socket.on(
    'file:rename',
    async ({
      projectId,
      id,
      type,
      name,
    }: {
      projectId: string;
      id: string;
      type: 'file' | 'folder';
      name: string;
    }) => {
      if (
        !canEditProject(
          socket.data.accessLevel,
          socket.data.user?.role === 'admin',
        )
      ) {
        return socket.emit('edit_denied', {
          reason: 'You have view-only access to this project.',
        });
      }
      await renameFileOrFolder(id, type, name);
      const updatedTree = await getProjectTree(projectId);
      projectTreeService.setTree(projectId, updatedTree);
      io.to(projectId).emit('file_tree:update', updatedTree);
    },
  );

  socket.on(
    'file:delete',
    async ({
      projectId,
      id,
      type,
    }: {
      projectId: string;
      id: string;
      type: 'file' | 'folder';
    }) => {
      if (
        !canEditProject(
          socket.data.accessLevel,
          socket.data.user?.role === 'admin',
        )
      ) {
        return socket.emit('edit_denied', {
          reason: 'You have view-only access to this project.',
        });
      }
      await deleteFile(id, type);
      const updatedTree = await getProjectTree(projectId);
      projectTreeService.setTree(projectId, updatedTree);
      io.to(projectId).emit('file_tree:update', updatedTree);
    },
  );

  socket.on('file_tree:leave', ({ projectId }: { projectId: string }) => {
    if (projectId) socket.leave(projectId);
  });
}
