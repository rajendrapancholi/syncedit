'use client';

import { Project } from '@/features/project/projectType';
import Projects from './Projects';
import { useQuery } from '@tanstack/react-query';
import ProjectCartSkeleton from '@/components/ProjectCartSkeleton';
import { RefreshCcw, AlertCircle } from 'lucide-react';

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch('/api/project/get-projects', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Cloud sync failed');
  const data = await res.json();
  return data.projects;
};

export default function ProjectPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCartSkeleton key={i} />
        ))}
      </div>
    );

  if (isError)
    return (
      <div className="flex-col-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-bold">Failed to load workspaces</h2>
        <p className="text-muted-foreground">{(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="flex-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary-hover transition-all cursor-pointer"
        >
          <RefreshCcw size={16} /> Try Again
        </button>
      </div>
    );

  return <Projects projects={data ?? []} />;
}
