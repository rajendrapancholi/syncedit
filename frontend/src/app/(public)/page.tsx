"use client";

import Link from "next/link";
import { Code2, Users, Zap, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-user-1/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now in Public Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
            Code Together, <br />
            <span className="text-primary">Anywhere in the World.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
            A lightning-fast live code collaborator. Pair program, mentor, or build 
            complex systems in real-time with zero latency and high-fidelity sync.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center gap-2 transition-all hover:bg-primary-hover hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              Get Started for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/editor/demo" 
              className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold border border-border hover:bg-secondary-hover transition-colors"
            >
              Try Demo Editor
            </Link>
          </div>
        </div>
      </section>

      {/* --- CODE PREVIEW (INTERACTIVE LOOK) --- */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative mx-auto max-w-5xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden group">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-warning/50" />
              <div className="w-3 h-3 rounded-full bg-success/50" />
            </div>
            <div className="text-xs font-mono text-muted-foreground">main.ts — Raje Editor</div>
            <div className="w-12" />
          </div>
          
          {/* Code Body Mockup */}
          <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
            <div className="flex gap-4">
              <span className="text-muted-foreground/40 select-none">1</span>
              <p><span className="text-user-4">import</span> {'{ createCollaborator }'} <span className="text-user-4">from</span> <span className="text-primary">"raje"</span>;</p>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground/40 select-none">2</span>
              <p>&nbsp;</p>
            </div>
            <div className="flex gap-4 bg-primary/5 -mx-6 px-6 border-l-2 border-primary">
              <span className="text-muted-foreground/40 select-none">3</span>
              <p>
                <span className="text-user-1">const</span> session = <span className="text-user-3">await</span> createCollaborator();
                <span className="inline-block w-0.5 h-5 bg-user-1 animate-pulse ml-1 translate-y-1" /> 
                <span className="absolute bg-user-1 text-white text-[10px] px-1 rounded-sm -mt-4 ml-1">Raje</span>
              </p>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground/40 select-none">4</span>
              <p>session.<span className="text-user-2">sync</span>();</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="container mx-auto px-6 py-24 border-t border-border">
        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Zap className="text-primary" />} 
            title="Zero Latency" 
            desc="Built on WebRTC and CRDTs to ensure every keystroke is synced in under 20ms."
          />
          <FeatureCard 
            icon={<Users className="text-user-1" />} 
            title="Multi-Cursor" 
            desc="See exactly what your team is looking at with named remote cursors and selection highlighting."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-success" />} 
            title="Secure by Default" 
            desc="End-to-end encrypted rooms. Your code never stays on our servers."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
