'use client';

import { Project } from '@/features/project/projectType';
import {
  ArrowUpRightIcon,
  LayoutDashboard,
  MoreVertical,
  Settings,
  Share2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const ProjectCard = ({ project }: { project: Project }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    });

  return (
    <>
      <div className="relative flex h-full w-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        {/* Menu */}
        <div className="absolute right-3 top-3" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open menu"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              <ul className="py-1 text-sm text-popover-foreground">
                <li>
                  <button className="block w-full px-4 py-2 text-left hover:bg-muted">
                    Edit
                  </button>
                </li>
                <li>
                  <button className="block w-full px-4 py-2 text-left hover:bg-muted">
                    Export Data
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 pr-8">
          <h3 className="line-clamp-1 text-lg font-semibold text-card-foreground">
            {project.name}
          </h3>

          <p className="line-clamp-3 text-sm text-muted-foreground">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Dates + Actions */}
        <div className="mt-5 space-y-4">
          <div className="flex justify-between gap-2 text-xs text-muted-foreground">
            <span>Created: {formatDate(project.created_at)}</span>
            <span>
              Updated:{' '}
              {project.created_at !== project.updated_at
                ? formatDate(project.updated_at)
                : '—'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Settings size={15} />
              Configure
              <ArrowUpRightIcon size={14} />
            </Link>

            <Link
              href={`/projects/${project.id}/workspace`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <LayoutDashboard size={15} />
              Open in workspace
            </Link>

            <Link
              href={`/projects/${project.id}/invite`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Share2Icon size={15} />
              Share
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectCard;
