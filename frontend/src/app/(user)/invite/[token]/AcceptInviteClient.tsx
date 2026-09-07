'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAcceptInviteMutation } from '@/features/project/projectApi';
import { useAuthStore } from '@/features/auth/authStore';

export default function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { mutate: accept, isPending } = useAcceptInviteMutation();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    accept(
      { token },
      {
        onSuccess: (data) => {
          setStatus('success');
          setMessage(data.message || 'You joined the project!');
          setProjectId(data.projectId);
          toast.success('Welcome to the workspace!');
          setTimeout(() => {
            router.push(`/editor/${data.projectId}`);
          }, 1500);
        },
        onError: (err: Error) => {
          setStatus('error');
          setMessage(err.message || 'Could not accept invite');
          toast.error(err.message || 'Invite failed');
        },
      },
    );
  }, [isAuthenticated, user, token]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-xl border border-border bg-card">
          <LogIn size={40} className="mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Sign in to join</h1>
          <p className="text-sm text-muted-foreground">
            You need an account to accept this project invite.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/login?redirect=/invite/${token}`}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-hover transition-all"
            >
              Log in
            </Link>
            <Link
              href={`/register?redirect=/invite/${token}`}
              className="w-full py-2.5 rounded-md border border-border font-bold text-sm hover:bg-accent transition-all"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-xl border border-border bg-card">
        {isPending || status === 'idle' ? (
          <>
            <Loader2 size={40} className="mx-auto text-primary animate-spin" />
            <h1 className="text-xl font-bold">Joining project…</h1>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 size={40} className="mx-auto text-success" />
            <h1 className="text-xl font-bold">You’re in!</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            {projectId && (
              <Link
                href={`/editor/${projectId}`}
                className="inline-block mt-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-sm"
              >
                Open editor
              </Link>
            )}
          </>
        ) : (
          <>
            <XCircle size={40} className="mx-auto text-destructive" />
            <h1 className="text-xl font-bold">Invite failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link
              href="/projects"
              className="inline-block mt-2 px-6 py-2.5 rounded-md border border-border font-bold text-sm hover:bg-accent"
            >
              Go to workspaces
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
