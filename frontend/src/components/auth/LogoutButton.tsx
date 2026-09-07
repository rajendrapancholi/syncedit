'use client';

import { useLogoutMutation } from '@/features/auth/authApi';
import toast from 'react-hot-toast';

export default function LogoutButton() {
  const { mutate: logout, isPending } = useLogoutMutation();

  const handleLogout = () => {
    toast.loading('Signing out...');
    logout();
  };

  return (
    <button
      disabled={isPending}
      onClick={handleLogout}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase tracking-tight text-destructive border border-border rounded-lg transition-all duration-300 hover:bg-destructive/15 hover:text-destructive-foreground hover:border-destructive hover:shadow-lg hover:shadow-destructive/10 active:scale-95 cursor-pointer dark:bg-card dark:border-border"
    >
      {isPending ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
}
