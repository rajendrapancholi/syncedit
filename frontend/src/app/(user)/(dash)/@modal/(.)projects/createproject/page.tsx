'use client';

import CreateProjectModal from '@/components/dashboard/NewProjectModel';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InterceptedCreateProject() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: createProject, isPending } = useMutation({
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create');
      }
      return res.json();
    },
    onMutate: () => {
      return toast.loading('Provisioning workspace...');
    },
    onSuccess: (_data, _variables, context) => {
      toast.success('Workspace initialized!', { id: context });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error, _variables, context) => {
      toast.error(error.message || 'Orchestration failed.', { id: context });
    },
  });
  const handleCreateProject = (name: string, description: string) => {
    createProject({ name, description });
  };

  return (
    <CreateProjectModal
      isOpen
      onClose={() => router.back()}
      onCreate={handleCreateProject}
      isPending={isPending}
    />
  );
}
