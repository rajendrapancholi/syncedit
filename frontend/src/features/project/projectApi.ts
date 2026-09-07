import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const BASE = '/api/project';

export type InviteRole = 'view' | 'edit';

export interface InvitePayload {
  projectId: string;
  email: string;
  role?: InviteRole;
}

export interface InviteResponse {
  message: string;
  inviteId?: string;
  token?: string;
}

export interface AcceptInvitePayload {
  token: string;
}

export interface AcceptInviteResponse {
  message: string;
  projectId: string;
  projectName?: string;
  accessLevel?: 'owner' | 'edit' | 'view';
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'edit' | 'view';
  joinedAt?: string;
}

/** Send an email invite to join a project */
export function useInviteToProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InvitePayload): Promise<InviteResponse> => {
      const res = await fetch(`${BASE}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: payload.projectId,
          email: payload.email.trim().toLowerCase(),
          role: payload.role || 'edit',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to send invite');
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
    },
  });
}

/** Accept an invite via token (from email link) */
export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: AcceptInvitePayload,
    ): Promise<AcceptInviteResponse> => {
      const res = await fetch(`${BASE}/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: payload.token }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || 'Failed to accept invite',
        );
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (data.projectId) {
        queryClient.invalidateQueries({
          queryKey: ['project', data.projectId],
        });
      }
    },
  });
}

export function useProjectMembersQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async (): Promise<ProjectMember[]> => {
      const res = await fetch(`${BASE}/members/${projectId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 404) return [];
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load members');
      }
      const data = await res.json();
      return data.members || data || [];
    },
    enabled: !!projectId && enabled,
    staleTime: 60_000,
  });
}
