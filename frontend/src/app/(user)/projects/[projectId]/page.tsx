import { Metadata } from 'next';
import ProjectHubClient from './ProjectHubClient';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type PageProps = { params: Promise<{ projectId: string }> };
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

const getProjectDataMemoized = cache(async (projectId: string, token?: string) => {
  const res = await fetch(`${BASE_API}/project/get-project/${projectId}`, {
    headers: token ? { Cookie: `token=${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to load project details');
  return res.json();
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  try {
    const data = await getProjectDataMemoized(projectId, token);
    return { title: `${data?.project?.name || projectId} | LC-Collab` };
  } catch {
    return { title: `${projectId} | LC-Collab` };
  }
}

export default async function ProjectHubPage({ params }: PageProps) {
  const { projectId } = await params;
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await queryClient.prefetchQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectDataMemoized(projectId, token),
  });

  const dehydratedState = dehydrate(queryClient);
  if (!dehydratedState.queries.length) return notFound();

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProjectHubClient projectId={projectId} />
    </HydrationBoundary>
  );
}