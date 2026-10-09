import { Code, Globe, Shield, Heart } from 'lucide-react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | SyncEdit',
  description: 'Real-time collaborative code editor for teams',
};

export default async function AboutPage() {
  'use cache';
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* HERO SECTION */}
      <section className="py-20 md:py-28 border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Building the future of <br />
            <span className="text-primary italic">collaborative development.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Raje was born out of a simple need: to make remote pair programming feel like 
            sitting in the same room. We're building tools that empower developers to 
            create, mentor, and ship without boundaries.
          </p>
        </div>
      </section>

      {/* MISSION BENTO GRID */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Card */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-card border border-border flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe size={24} />
              </div>
              <h2 className="text-3xl font-bold">A Global Studio</h2>
              <p className="text-muted-foreground text-lg">
                Whether you're in San Francisco or Tokyo, Raje ensures your code syncs in real-time. 
                Our infrastructure is distributed globally to provide sub-50ms latency.
              </p>
            </div>
            <div className="mt-8 flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold">
                  U{i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                +1k
              </div>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="p-8 rounded-3xl bg-card border border-border hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-user-1/10 flex items-center justify-center text-user-1 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              End-to-end encryption for every room. Your intellectual property stays yours.
            </p>
          </div>

          {/* Small Card 2 */}
          <div className="p-8 rounded-3xl bg-card border border-border hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-user-2/10 flex items-center justify-center text-user-2 mb-6">
              <Code size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Open Standards</h3>
            <p className="text-sm text-muted-foreground">
              Built on CRDTs and WebRTC. We believe in the future of the decentralized web.
            </p>
          </div>

          {/* Large Card 2 */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-primary text-primary-foreground overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-bold">Driven by the Community</h2>
              <p className="opacity-90 text-lg max-w-md">
                Raje is built for developers, by developers. We iterate fast based 
                on your feedback to make the best editor on earth.
              </p>
              <button className="px-6 py-2 bg-white text-primary rounded-full font-bold text-sm hover:scale-105 transition-transform">
                Join our Discord
              </button>
            </div>
            {/* Abstract Background Icon */}
            <Heart size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-muted/20 py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">10M+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Lines Synced</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">50k+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Uptime</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Live Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
