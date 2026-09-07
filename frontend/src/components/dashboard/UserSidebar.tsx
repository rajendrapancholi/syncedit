'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar, SidebarBody, SidebarLink } from '@/shared/components/Sidebar';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { cn } from '@/lib/utils/cn';
import UserMenu from '../UserMenu';
import { Logo } from "../ui/Logo";

type MenuItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
};

type MenuGroup = {
  title: string;
  list: MenuItem[];
};

export default function UserSidebar({ menuItems }: { menuItems: MenuGroup[] }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => !pinned && setOpen(true);
  const handleMouseLeave = () => !pinned && setOpen(false);
  const togglePinned = () => {
    setPinned(!pinned);
    setOpen(!pinned);
  };

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      {!pinned && <div className="md:w-20" />}
      <SidebarBody
        className={cn(
          'z-50 rounded-r-2xl justify-between min-h-screen md:gap-10 transition-colors duration-300',
          'bg-background/90 backdrop-blur-lg border-r border-border shadowwhite', // Using your theme variables
          pinned ? 'relative' : 'md:fixed',
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* PIN TOGGLE BUTTON */}
        <button
          onClick={togglePinned}
          className="absolute -right-3 top-1/2 md:top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-popover shadow-md hover:scale-110 transition-all hover:border-primary"
        >
          <ChevronLeft
            size={14}
            className={cn(
              'transition-transform duration-300 text-primary',
              pinned ? 'rotate-180' : '',
            )}
          />
        </button>

        <div className="flex flex-col overflow-x-hidden">
          <Logo />
          <div
            className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden mt-8 flex flex-col gap-6',
              open ? 'scrollbar' : 'hide-scrollbar',
            )}
          >
            {menuItems.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <AnimatePresence mode="wait">
                  {open && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="px-4 text-[10px] tracking-widest font-bold uppercase text-muted-foreground"
                    >
                      {group.title}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-1">
                  {group.list.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <div key={item.path} className="px-2">
                        <SidebarLink
                          link={{
                            label: item.title,
                            href: item.path,
                            icon: (
                              <div
                                className={cn(
                                  'shrink-0 flex items-center justify-center transition-colors',
                                  isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {item.icon}
                              </div>
                            ),
                          }}
                          className={cn(
                            'rounded-md px-2 transition-all duration-200', // rounded-md from your --radius-md
                            isActive
                              ? 'bg-accent text-foreground font-semibold'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t w-full flex-between border-border md:pt-4 pb-2 px-2">
          {/* MANAGE USER */}
          <UserMenu user={user} menuPos="top-right" isNavbar={false} />
          {open && (
            <div className="w-full flex-right">
              <ThemeToggle position="top" />
            </div>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
