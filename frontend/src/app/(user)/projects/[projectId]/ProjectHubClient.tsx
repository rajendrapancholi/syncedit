'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Video,
  Settings,
  Users,
  Trash2,
  UserPlus,
  Shield,
  Copy,
  Check,
  MoreVertical,
  Crown,
  Eye,
  Pencil,
} from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { useProjectSession } from './_session/ProjectSessionProvider';
import ProjectCartSkeleton from '@/components/ProjectCartSkeleton';
import Navbar from '@/shared/components/Navbar';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  isOnline?: boolean;
};

export default function ProjectHubClient({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProject(projectId);
  const { user, webrtc, isConnected } = useProjectSession();

  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

  if (isLoading) return <ProjectCartSkeleton />;
  
  const { project, accessLevel } = data ?? {};

  const members: Member[] = [
    {
      id: '1',
      name: user?.name || 'You',
      email: user?.email || 'you@example.com',
      role: 'owner',
      joinedAt: project?.created_at || new Date().toISOString(),
      isOnline: true,
    },
  ];

  const copyProjectId = () => {
    navigator.clipboard.writeText(projectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    console.log('Invite:', inviteEmail, inviteRole);
    setInviteEmail('');
  };

  const roleIcon = (role: Member['role']) => {
    if (role === 'owner') return <Crown size={14} className="text-warning" />;
    if (role === 'editor') return <Pencil size={14} className="text-primary" />;
    return <Eye size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar
        projectTitle={project?.name || 'Untitled Project'}
        status={isConnected ? 'online' : 'syncing'}
        accessLevel={accessLevel}
        // projectId={projectId}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {project?.name}
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                {project?.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/projects/${projectId}/workspace`}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary-hover transition"
              >
                <Code2 size={16} />
                Open Workspace
              </Link>

              <button
                onClick={
                  webrtc.inHuddle ? webrtc.leaveHuddle : webrtc.joinHuddle
                }
                disabled={webrtc.joining || !isConnected}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary-hover transition disabled:opacity-50"
              >
                <Video size={16} />
                {webrtc.inHuddle
                  ? `Leave Call · ${webrtc.totalUsers}`
                  : 'Start Video Call'}
              </button>
            </div>
          </div>

          {/* PROJECT INFO */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-muted-foreground" />
              <h2 className="text-base font-semibold text-card-foreground">
                Project Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created At</p>
                <p className="font-medium text-foreground">
                  {project?.created_at
                    ? new Date(project.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        hour12: false,
                      })
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium text-foreground">
                  {project?.updated_at
                    ? new Date(project.updated_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        hour12: false,
                      })
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Your Access</p>
                <p className="font-medium text-foreground capitalize">
                  {accessLevel || '—'}
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground mb-1">Project ID</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs bg-muted px-2.5 py-1.5 rounded-md text-muted-foreground break-all">
                    {projectId}
                  </code>
                  <button
                    onClick={copyProjectId}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Copy Project ID"
                  >
                    {copied ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* MEMBERS */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-card-foreground">
                  Members
                </h2>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {members.length}
                </span>
              </div>
            </div>

            {/* Invite form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as 'editor' | 'viewer')
                }
                className="px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInvite}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary-hover transition"
              >
                <UserPlus size={16} />
                Invite
              </button>
            </div>

            {/* Members list */}
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-background hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium capitalize text-muted-foreground">
                      {roleIcon(member.role)}
                      {member.role}
                    </div>

                    {member.role !== 'owner' && accessLevel === 'owner' && (
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition">
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ACCESS & PERMISSIONS */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-muted-foreground" />
              <h2 className="text-base font-semibold text-card-foreground">
                Access & Permissions
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="font-medium text-foreground">Public Link</p>
                  <p className="text-muted-foreground mt-0.5">
                    Anyone with the link can view this project (read-only).
                  </p>
                </div>
                <button className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition">
                  Enable
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="font-medium text-foreground">
                    Allow Guests to Join Workspace
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Guests can open the editor but cannot save or invite others.
                  </p>
                </div>
                <button className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition">
                  Enable
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="font-medium text-foreground">
                    Require Approval for New Members
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Owner must approve before someone can join.
                  </p>
                </div>
                <button className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition">
                  Enable
                </button>
              </div>
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="rounded-xl border border-destructive/40 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-destructive" />
              <h2 className="text-base font-semibold text-destructive">
                Danger Zone
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Leave Project
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You will lose access to this project.
                  </p>
                </div>
                <button className="shrink-0 px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition">
                  Leave
                </button>
              </div>

              {accessLevel === 'owner' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-background">
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Delete Project
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete this project and all its data. This
                      cannot be undone.
                    </p>
                  </div>
                  <button className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:opacity-90 transition">
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
