'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardClient from '@/components/dashboard/DashboardClient';
import NewProjectModal from '@/components/dashboard/NewProjectModel';
import ProjectStats from '@/components/dashboard/ProjectStats';
import ProjectCartSkeleton from '@/components/ProjectCartSkeleton';
import { Project } from '@/features/project/projectType';

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch('/api/project/get-projects', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Cloud sync failed');
  const data = await res.json();
  return data.projects;
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Projects
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Create Project Mutation
  const createMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      const res = await fetch('/api/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: name, projectDesc: description }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Provisioning failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Unit successfully provisioned');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create project');
    },
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-destructive" />
        <h2 className="text-xl font-bold">Failed to load workspaces</h2>
        <p className="text-muted-foreground">{(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-2 bg-secondary rounded-md"
        >
          <RefreshCcw size={16} /> Try Again
        </button>
      </div>
    );

  return (
    <>
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">WORKSPACE</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
              Manage your agentic orchestration units
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> New Project
          </button>
        </header>

        <ProjectStats projects={data ?? []} />
        <DashboardClient initialProjects={data ?? []} />
      </main>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(formData: any) => createMutation.mutate(formData)}
        isLoading={createMutation.isPending}
      />
    </>
  );
};

export default Dashboard;
