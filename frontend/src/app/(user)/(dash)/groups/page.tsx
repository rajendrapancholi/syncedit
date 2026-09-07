"use client";

import React from "react";
import { Plus, Search, Users, Terminal, Code2, Globe, Cpu } from "lucide-react";

const LIVE_GROUPS = [
  {
    id: 1,
    name: "Nexus-Frontend",
    status: "Active",
    members: ["JS", "AD", "RK"],
    color: "user-1",
    icon: <Code2 size={20} />,
  },
  {
    id: 2,
    name: "Kernel-Core",
    status: "Idle",
    members: ["MT", "SL"],
    color: "user-2",
    icon: <Cpu size={20} />,
  },
  {
    id: 3,
    name: "Web-Socket-Lab",
    status: "Active",
    members: ["JD", "PK", "AL", "BK"],
    color: "user-3",
    icon: <Globe size={20} />,
  },
  {
    id: 4,
    name: "Compiler-Devs",
    status: "Active",
    members: ["SY", "OW"],
    color: "user-4",
    icon: <Terminal size={20} />,
  },
];

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 transition-all">
      {/* GLOWING HEADER */}
      <header className="flex-between mb-12 relative">
        <div className="space-y-1">
          <div className="flex-left gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Workspaces
            </h1>
          </div>
          <p className="text-muted-foreground font-medium tracking-tight opacity-70">
            Real-time collaborative environments.
          </p>
        </div>

        <button className="group flex-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
          <Plus size={18} strokeWidth={3} />
          Initialize New
        </button>
      </header>

      {/* SEARCH BAR (Glassmorphism) */}
      <div className="max-w-2xl mb-10">
        <div className="relative flex-left bg-card/50 backdrop-blur-md border border-border rounded-2xl px-4 py-1 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
          <Search size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by environment or user..."
            className="w-full p-3 bg-transparent outline-none font-medium placeholder:text-muted-foreground/50"
          />
          <kbd className="hidden sm:block px-2 py-1 bg-muted border border-border rounded text-[10px] font-bold text-muted-foreground">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {LIVE_GROUPS.map((group) => (
          <div
            key={group.id}
            className="group relative bg-card border border-border rounded-3xl p-6 overflow-hidden hover:border-transparent transition-all duration-500 cursor-pointer"
          >
            {/* HOVER GLOW EFFECT */}
            <div
              className={`absolute -inset-px bg-linear-to-br from-${group.color}/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <div className="relative z-10 space-y-6">
              <div className="flex-between">
                <div
                  className={`p-3 rounded-2xl bg-${group.color}/10 text-${group.color} border border-${group.color}/20`}
                >
                  {group.icon}
                </div>
                {group.status === "Active" && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-full bg-success/10 text-success border border-success/20`}
                  >
                    Live
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:translate-x-1 transition-transform">
                  {group.name}
                </h3>
                <div className="flex -space-x-2">
                  {group.members.map((m, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-card bg-muted flex-center text-[10px] font-bold shadow-sm hover:-translate-y-1 transition-transform`}
                    >
                      {m}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-primary/10 text-primary flex-center text-[10px] font-bold">
                    +
                  </div>
                </div>
              </div>

              <div className="flex-between pt-4 border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Instance-0{group.id}
                </span>
                <button
                  className={`text-${group.color} text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  Join Session →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
