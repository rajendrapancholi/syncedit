'use client';

import { HiMiniUserGroup } from 'react-icons/hi2';
import { MdWork, MdAnalytics, MdPeople } from 'react-icons/md';
import { FolderKanban, LayoutDashboard } from 'lucide-react';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { useAuthStore } from '@/features/auth/authStore';

export default function AdminLayout({
  children,
  modal,
  projects,
  activity,
  stats,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  projects: React.ReactNode;
  activity: React.ReactNode;
  stats: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <div className="p-6 text-sm font-medium">Unauthorized</div>;

  const menuItems = [
    {
      title: 'Pages',
      list: [
        { title: 'Dashboard', path: user.role === 'admin' ? '/admin/dashboard' : '/dashboard', icon: <LayoutDashboard size={18} /> },
        { title: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> },
        { title: 'Groups', path: '/groups', icon: <HiMiniUserGroup size={18} /> },
      ],
    },
    {
      title: 'Analytics',
      list: [
        { title: 'Revenue', path: '/revenue', icon: <MdWork size={18} /> },
        { title: 'Reports', path: '/reports', icon: <MdAnalytics size={18} /> },
        { title: 'Teams', path: '/teams', icon: <MdPeople size={18} /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background">
      <UserSidebar menuItems={menuItems} />
      <main className="flex-1 overflow-y-auto px-6">
        {children}
        {stats}
        {projects}
        {activity}
      </main>
      {modal}
    </div>
  );
}