import ProjectStats from '@/components/dashboard/ProjectStats';
import { cookies } from 'next/headers';

async function getStats() {
  const token = (await cookies()).get('token')?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/project/stats`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export default async function StatsSlot() {
  const stats = await getStats();
  // return <ProjectStats stats={stats} />;
  return <ProjectStats projects={stats} />;
}