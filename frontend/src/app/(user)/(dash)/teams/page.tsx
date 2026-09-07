"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  GitBranch,
  LayoutPanelLeft,
  ArrowUpRight,
  Search,
  PlusCircle,
} from "lucide-react";

const TEAMS = [
  {
    id: 1,
    name: "Alpha Squad",
    role: "Design Systems",
    velocity: "98%",
    status: "online",
    color: "user-1",
  },
  {
    id: 2,
    name: "Beta Logic",
    role: "Backend / API",
    velocity: "82%",
    status: "busy",
    color: "user-2",
  },
  {
    id: 3,
    name: "Gamma Ops",
    role: "Cloud / Infra",
    velocity: "94%",
    status: "online",
    color: "user-3",
  },
  {
    id: 4,
    name: "Delta Web",
    role: "React Architect",
    velocity: "89%",
    status: "away",
    color: "user-4",
  },
];

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 max-w-400 mx-auto">
      {/* MINIMAL NAV HEADER */}
      <div className="flex-between mb-10 border-b border-border/40 pb-6">
        <div className="flex-left gap-4">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <ShieldCheck className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Organization / <span className="text-muted-foreground">Teams</span>
          </h1>
        </div>

        <div className="flex-left gap-3">
          <div className="hidden md:flex items-center bg-input/50 border border-border px-3 py-1.5 rounded-lg">
            <Search size={16} className="text-muted-foreground mr-2" />
            <input
              placeholder="Find a team..."
              className="bg-transparent outline-none text-sm w-40"
            />
          </div>
          <button className="bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
            Request Access
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Active Nodes", val: "12", icon: <Zap size={14} /> },
          { label: "Open PRs", val: "48", icon: <GitBranch size={14} /> },
          {
            label: "Deployments",
            val: "1.2k",
            icon: <ArrowUpRight size={14} />,
          },
          { label: "Projects", val: "09", icon: <LayoutPanelLeft size={14} /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border p-4 rounded-2xl flex-between"
          >
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {stat.label}
            </span>
            <div className="flex-left gap-2 text-primary font-black">
              {stat.icon} {stat.val}
            </div>
          </div>
        ))}
      </div>

      {/* TEAMS TABLE/GRID */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
          Verified Teams
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {TEAMS.map((team) => (
            <div
              key={team.id}
              className="group bg-card/40 hover:bg-card border border-border/60 hover:border-primary/40 p-4 rounded-2xl transition-all flex-between cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex-left gap-5">
                {/* Status Ring */}
                <div
                  className={`relative w-12 h-12 rounded-full bg-muted flex-center border-2 border-border group-hover:border-${team.color}/50 transition-colors`}
                >
                  <span className={`font-black text-${team.color}`}>
                    {team.name.charAt(0)}
                  </span>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${team.status === "online" ? "bg-success" : "bg-warning"}`}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-base leading-none mb-1 group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {team.role}
                  </p>
                </div>
              </div>

              <div className="flex-right gap-12">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Weekly Velocity
                  </p>
                  <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${team.color}`}
                      style={{ width: team.velocity }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg border border-border bg-background group-hover:border-primary/20 transition-all opacity-0 group-hover:opacity-100">
                  <ArrowUpRight
                    size={18}
                    className="text-muted-foreground group-hover:text-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMPTY STATE / CTA */}
      <div className="mt-8 border-2 border-dashed border-border rounded-3xl p-10 flex-col-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex-center">
          <PlusCircle className="text-muted-foreground" size={24} />
        </div>
        <div>
          <h4 className="font-bold">Missing a Squad?</h4>
          <p className="text-sm text-muted-foreground">
            Register a new verified team for your department.
          </p>
        </div>
        <button className="text-xs font-black uppercase text-primary hover:underline">
          Start Onboarding →
        </button>
      </div>
    </div>
  );
}
