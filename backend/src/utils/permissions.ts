export type AccessLevel = 'none' | 'view' | 'edit' | 'admin' | 'owner';

const RANK: Record<AccessLevel, number> = {
  none: 0,
  view: 1,
  edit: 2,
  admin: 3,
  owner: 4,
};

export const hasAtLeast = (
  level: AccessLevel | null | undefined,
  required: AccessLevel,
) => RANK[level || 'none'] >= RANK[required];

export const canEditProject = (
  level: AccessLevel | null | undefined,
  isGlobalAdmin = false,
) => hasAtLeast(level, 'edit') || isGlobalAdmin;

export const canManageMembers = (
  level: AccessLevel | null | undefined,
  isGlobalAdmin = false,
) => hasAtLeast(level, 'admin') || isGlobalAdmin;

export const canDeleteProject = (
  level: AccessLevel | null | undefined,
  isGlobalAdmin = false,
) => level === 'owner' || isGlobalAdmin;
