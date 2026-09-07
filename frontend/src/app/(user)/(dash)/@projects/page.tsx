import { Project } from '@/features/project/projectType';
import Projects from '../projects/Projects';
import { cookies } from 'next/headers';

async function getProjects(): Promise<Project[]> {
  const token = (await cookies()).get('token')?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/project`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to load projects');
  return res.json() as Promise<Project[]>;
}

export default async function ProjectsSlot() {
  const projects = await getProjects();

  return <Projects projects={projects} />;
}
