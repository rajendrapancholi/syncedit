import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../types/express';
import {
  getProjectAccess,
  getProjectIdByFileId,
} from '../services/project.service';
import { canEditProject } from "../utils/permissions";

export const injectProjectAccess = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let projectId = req.params.projectId || req.body.projectId;
    const userId = req.user?.id;
    const fileId = req.params.id;

    if (!projectId && fileId) {
      projectId = await getProjectIdByFileId(fileId);
    }

    if (!projectId || !userId) return next();

    const access = await getProjectAccess(userId, projectId);

    if (req.user) {
      req.user.projectAccess = access === 'none' ? null : access;
    }

    next();
  } catch (error) {
    console.error('Access Injection Error:', error);
    next();
  }
};

export const canEdit = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (
    !canEditProject(req.user?.projectAccess as any, req.user?.role === 'admin')
  ) {
    return res
      .status(403)
      .json({ message: 'Read-only access. Modification denied.' });
  }
  next();
};
