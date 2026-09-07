'use client';

import { useState } from 'react';
import { X, Mail, UserPlus, Shield, Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useInviteToProjectMutation,
  InviteRole,
} from '@/features/project/projectApi';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  projectId,
  projectName,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('edit');
  const { mutate: invite, isPending } = useInviteToProjectMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const toastId = toast.loading(`Sending invite to ${trimmed}...`);

    invite(
      { projectId, email: trimmed, role },
      {
        onSuccess: (data) => {
          toast.success(data.message || `Invite sent to ${trimmed}`, {
            id: toastId,
          });
          setEmail('');
          setRole('edit');
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to send invite', { id: toastId });
        },
      },
    );
  };

  return (
    <div className="fixed left-0 right-0 top-52 z-50 flex-center bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-card border border-border p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex-left gap-2 mb-6">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <UserPlus size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Invite collaborator
            </h2>
            {projectName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-65">
                {projectName}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="invite-email"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Access level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('edit')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-left text-sm transition-all ${
                  role === 'edit'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-input/50 text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Pencil size={14} />
                <div>
                  <div className="font-bold text-xs">Can edit</div>
                  <div className="text-[10px] opacity-70">
                    Write code & files
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('view')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-left text-sm transition-all ${
                  role === 'view'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-input/50 text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Eye size={14} />
                <div>
                  <div className="font-bold text-xs">View only</div>
                  <div className="text-[10px] opacity-70">Read & observe</div>
                </div>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Shield size={12} className="mt-0.5 shrink-0" />
            They will receive an email with a link to join this workspace. If
            they already have an account, they can accept immediately.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-border text-sm font-bold text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !email.trim()}
              className="flex-1 flex-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover disabled:opacity-50 transition-all"
            >
              <Mail size={14} />
              {isPending ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
