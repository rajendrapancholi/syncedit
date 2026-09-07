'use client';

import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/services/notifications/hooks/useNotifications';

export default function ActivityFeed() {
  const { notifications } = useNotificationStore();

  return (
    <aside className="bg-card/20 border border-border rounded-2xl p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={14} className="text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Recent Activity</span>
      </div>
      {notifications.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing yet — activity will show up here live.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.slice(0, 8).map((n) => (
            <li key={n.id} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}