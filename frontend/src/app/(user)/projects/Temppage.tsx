"use client";
import {
  Code2,
  Plus,
  Clock,
  GitFork,
  Terminal,
  Monitor,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const RECENT_PROJECTS = [
  {
    id: "nexus-v4",
    name: "Nexus UI System",
    lang: "TypeScript",
    users: 3,
    color: "user-1",
    updated: "2m ago",
  },
  {
    id: "api-gateway",
    name: "Core API Gateway",
    lang: "Go",
    users: 5,
    color: "user-2",
    updated: "1h ago",
  },
  {
    id: "compiler-lab",
    name: "Custom Compiler",
    lang: "Rust",
    users: 1,
    color: "user-4",
    updated: "3d ago",
  },
];

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      {/* ACTION HEADER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Monitor size={12} /> Live Environment v1.114
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            Start <span className="text-primary italic">Coding.</span>
            <br />
            Together.
          </h1>
          <p className="text-muted-foreground text-sm max-w-md font-medium">
            Launch a collaborative workspace, import from GitHub, or jump back
            into your recent instances.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 group bg-primary text-primary-foreground p-6 rounded-3xl flex-col-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20">
            <Plus
              size={32}
              strokeWidth={3}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span className="font-black uppercase tracking-tighter">
              New Sandbox
            </span>
          </button>
          <button className="flex-1 bg-card border border-border p-6 rounded-3xl flex-col-center gap-3 hover:bg-muted transition-all">
            <GitFork size={32} className="text-muted-foreground" />
            <span className="font-black uppercase tracking-tighter text-muted-foreground">
              Clone Repo
            </span>
          </button>
        </div>
      </section>

      {/* PROJECT BENTO GRID */}
      <div className="space-y-6">
        <div className="flex-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex-left gap-2">
            <Clock size={14} /> Recent Workspaces
          </h2>
          <button className="text-[10px] font-bold text-primary hover:underline">
            View All Projects
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECENT_PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={`/editor/${project.id}`}
              className="group relative bg-card border border-border rounded-2xl p-6 overflow-hidden transition-all hover:border-primary/50"
            >
              {/* Subtle Glowing Corner */}
              <div
                className={`absolute -top-6 -right-6 w-12 h-12 bg-${project.color}/20 blur-2xl group-hover:bg-${project.color}/40 transition-all`}
              />

              <div className="space-y-4">
                <div className="flex-between">
                  <div
                    className={`p-2 rounded-lg bg-${project.color}/10 text-${project.color}`}
                  >
                    <Code2 size={20} />
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    {project.lang}
                  </p>
                </div>

                <div className="flex-between pt-4 border-t border-border/50">
                  <div className="flex -space-x-1">
                    {[...Array(project.users)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-card bg-muted text-[8px] font-bold flex-center"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground italic font-medium">
                    {project.updated}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* QUICK COMMANDS PANEL */}
      <div className="bg-card/30 backdrop-blur-xl border border-dashed border-border rounded-3xl p-8 flex-between flex-wrap gap-6">
        <div className="flex-left gap-4">
          <div className="w-10 h-10 bg-background rounded-xl border border-border flex-center shadow-sm">
            <Terminal size={18} className="text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Command Palette</h4>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              Instant access to tools & settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <kbd className="px-3 py-1.5 bg-background border border-border rounded-md text-[10px] font-black">
            CTRL
          </kbd>
          <kbd className="px-3 py-1.5 bg-background border border-border rounded-md text-[10px] font-black">
            SHIFT
          </kbd>
          <kbd className="px-3 py-1.5 bg-background border border-border rounded-md text-[10px] font-black text-primary">
            P
          </kbd>
        </div>
      </div>
    </div>
  );
}
