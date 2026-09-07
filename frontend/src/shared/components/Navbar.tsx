'use client';

import {
  Code2,
  Zap,
  ZapOff,
  Cpu,
  ChevronRight,
  Lock,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from '../../components/UserMenu';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '@/features/auth/authStore';
import NotificationBell from '../../services/notifications/components/NotificationBell';
import { useState } from 'react';
import InviteModal from '../../components/InviteModal';

interface NavbarProps {
  projectTitle?: string;
  status?: 'online' | 'syncing' | 'offline';
  accessLevel?: 'view' | 'edit' | 'admin' | 'owner';
}

export default function Navbar({
  projectTitle,
  status,
  accessLevel,
}: NavbarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isEditor = pathname.startsWith('/editor/');
  const canEdit = accessLevel && accessLevel !== 'view';
  const [inviteOpen, setInviteOpen] = useState(false);

  const navItemStyle = (path: string) =>
    `text-[11px] uppercase tracking-widest font-bold transition-colors hover:text-primary ${
      pathname === path ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/50 backdrop-blur-md">
      <nav className="px-6 h-14 flex-between gap-4">
        {/* LEFT: Brand or Project Breadcrumb */}
        <div className="flex-left gap-4">
          <Link href="/" className="flex-left gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Code2 size={18} />
            </div>
            {!isEditor && (
              <span className="text-lg font-black tracking-tighter text-foreground">
                RAJE<span className="text-primary">++</span>
              </span>
            )}
          </Link>

          {isEditor && projectTitle && (
            <div className="flex-left gap-3 animate-in slide-in-from-left-2 duration-300">
              <ChevronRight size={14} className="text-muted-foreground" />
              <div className="flex flex-col -space-y-0.5">
                <span className="text-xs font-bold truncate max-w-37.5">
                  {projectTitle}
                </span>

                {!canEdit && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[9px] font-black uppercase">
                    <Lock size={8} /> View Only
                  </span>
                )}

                <div className="flex-left gap-1">
                  {status === 'online' ? (
                    <div className="flex-left gap-1 text-[9px] font-bold text-success uppercase tracking-tighter">
                      <Zap size={10} className="fill-success" /> Syncing
                    </div>
                  ) : (
                    <div className="flex-left gap-1 text-[9px] font-bold text-warning uppercase tracking-tighter animate-pulse">
                      <ZapOff size={10} /> Connecting
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Navigation Links (Hidden in Editor to focus on code) */}

        {!isEditor && (
          <ul className="hidden lg:flex gap-8 items-center bg-muted/30 px-6 py-1.5 rounded-full border border-border/50">
            <li>
              <Link href="/" className={navItemStyle('/')}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/projects" className={navItemStyle('/projects')}>
                Workspaces
              </Link>
            </li>
            <li>
              <Link href="/about" className={navItemStyle('/about')}>
                About
              </Link>
            </li>
            <li>
              <Link
                href="/subscription-plan"
                className={navItemStyle('/subscription-plan')}
              >
                Plans
              </Link>
            </li>
          </ul>
        )}

        {/* RIGHT SIDE: System Actions */}
        <div className="flex-right gap-3">
          {isEditor && canEdit && (
            <>
              <button
                onClick={() => setInviteOpen(true)}
                className="hidden md:flex-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <UserPlus size={12} /> Invite
              </button>
              <button className="hidden md:flex-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Cpu size={12} /> Optimize
              </button>
            </>
          )}
          <div className="flex-right gap-1.5">
            {isEditor && <NotificationBell />}
            <ThemeToggle position='bottom'/>
            <div className="h-4 w-px bg-border mx-1" />
            {!isAuthenticated && !user ? (
              <Link
                href="/login"
                className="text-xs font-bold text-primary hover:underline px-2"
              >
                Login
              </Link>
            ) : (
              <UserMenu user={user} />
            )}
          </div>
        </div>
      {isEditor && projectTitle && (
        <InviteModal
          isOpen={inviteOpen}
          onClose={() => setInviteOpen(false)}
          projectId={pathname.split('/')[2] || ''}
          projectName={projectTitle}
        />
      )}
      </nav>
    </header>
  );
}
