"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Users, MessageCircle, Info } from "lucide-react";
import { useNotificationStore } from "../hooks/useNotifications";

export default function NotificationBell() {
  const { notifications, markAllRead, clear } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const icon = (type: string) =>
    type === "presence" ? <Users size={12} /> : type === "chat" ? <MessageCircle size={12} /> : <Info size={12} />;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto scrollbar bg-popover border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border flex-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clear} className="text-[9px] text-muted-foreground hover:text-primary">
                Clear all
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
              You're all caught up
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 border-b border-border/50 last:border-0 flex gap-2 items-start hover:bg-accent/40">
                <div className="mt-0.5 text-primary">{icon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug break-words">{n.message}</p>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}