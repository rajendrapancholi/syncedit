import type { AuthRequest } from '../types/express';
import {
  createFile,
  deleteFile,
  getProjectTree,
  renameFileOrFolder,
  updateFileContent,
} from '../services/file.service';
import type { Response } from 'express';
import { projectTreeService } from '../services/ProjectTreeService';
import { getIO } from '../sockets/socket';

export const getTree = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId)
      return res.status(404).json({ message: 'Project not found!' });
    const tree = await getProjectTree(projectId);
    res.json({ tree });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project tree' });
  }
};

export const handleCreate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, parentId, projectId } = req.body;
    const node = await createFile(projectId, name, type, parentId);
    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ message: 'Creation failed' });
  }
};

export const handleRename = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, name } = req.body;
    if (!id)
      return res.status(404).json({ message: 'All fields are required!' });

    const node = await renameFileOrFolder(id, type, name);
    res.json(node);
  } catch (err) {
    res.status(500).json({ message: 'Rename failed' });
  }
};

export const handleUpdateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(404).json({ message: 'All fields are required!' });
    const node = await updateFileContent(id, req.body.content);

    // BUG FIX: this used to just return `node` here. The UPDATE writes the
    // new content to Postgres fine, but fileTree.socket.ts's `file_tree:join`
    // caches each project's tree in projectTreeService the *first* time
    // anyone opens it after the server starts, and only ever refreshes that
    // cache on rename/create/delete — never on a content save. So every
    // refresh (which reconnects the socket and re-emits file_tree:join)
    // handed back that frozen-in-time tree, silently reverting the editor to
    // whatever content the file had before the very first save. We now
    // refresh the cache and broadcast it here too, exactly like rename does.
    if (!node) {
      return res.status(404).json({ message: 'File not found' });
    }
    if (node.project_id) {
      const refreshedTree = await getProjectTree(node.project_id);
      projectTreeService.setTree(node.project_id, refreshedTree);
      getIO().to(node.project_id).emit('file_tree:update', refreshedTree);
    }

    res.json(node);
  } catch (err) {
    res.status(500).json({ message: 'Content update failed' });
  }
};

export const handleRemove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    if (!id || !type)
      return res.status(404).json({ message: 'All fields are required!' });
    const success = await deleteFile(id, type as 'file' | 'folder');
    success
      ? res.sendStatus(204)
      : res.status(404).json({ message: 'Node not found' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed' });
  }
};
