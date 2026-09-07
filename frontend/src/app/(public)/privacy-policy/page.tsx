"use client";

import { Shield, Lock, Eye, Globe, FileText, ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    { id: "collection", title: "Data Collection", icon: <Eye size={18} /> },
    { id: "usage", title: "How we use Data", icon: <FileText size={18} /> },
    { id: "security", title: "Security Protocols", icon: <Lock size={18} /> },
    { id: "sharing", title: "Third Party Sharing", icon: <Globe size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* HEADER */}
      <section className="py-20 border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center gap-3 text-primary mb-4">
            <Shield size={32} />
            <span className="font-mono text-sm tracking-widest uppercase">Security & Trust</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy <span className="text-primary">Policy.</span>
          </h1>
          <p className="text-muted-foreground">Last updated: March 30, 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* STICKY SIDEBAR NAVIGATION */}
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">Sections</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-all group"
                >
                  <span className="opacity-50 group-hover:opacity-100 transition-opacity">{section.icon}</span>
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          {/* CONTENT AREA */}
          <main className="flex-1 prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-16">
              
              <section id="collection" className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-primary">01.</span> Data Collection
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                  <p className="text-muted-foreground leading-relaxed">
                    At Raje, we minimize data footprint. When you use our live collaborator, we collect:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3 text-sm font-medium">
                    <li className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                      <ChevronRight size={14} className="text-primary" /> Account Information (Email/GitHub)
                    </li>
                    <li className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                      <ChevronRight size={14} className="text-primary" /> Ephemeral Sync Data (CRDT state)
                    </li>
                    <li className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                      <ChevronRight size={14} className="text-primary" /> Technical Logs (Browser/IP)
                    </li>
                    <li className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                      <ChevronRight size={14} className="text-primary" /> Payment Metadata (Pro Users)
                    </li>
                  </ul>
                </div>
              </section>

              <section id="usage" className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-primary">02.</span> How we use Data
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use your data strictly to facilitate the real-time experience. 
                  <strong> We do not sell your code or personal information to third parties.</strong>
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/20 border border-border rounded-xl">
                    <h4 className="font-bold text-sm mb-1">Collaboration</h4>
                    <p className="text-xs text-muted-foreground">To sync cursors and code edits instantly across your team.</p>
                  </div>
                  <div className="p-4 bg-muted/20 border border-border rounded-xl">
                    <h4 className="font-bold text-sm mb-1">Security</h4>
                    <p className="text-xs text-muted-foreground">To monitor for unauthorized access or bot activity in your rooms.</p>
                  </div>
                  <div className="p-4 bg-muted/20 border border-border rounded-xl">
                    <h4 className="font-bold text-sm mb-1">Performance</h4>
                    <p className="text-xs text-muted-foreground">To debug latency spikes and optimize our WebRTC relay servers.</p>
                  </div>
                </div>
              </section>

              <section id="security" className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-primary">03.</span> Security Protocols
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your code is sensitive. We treat it with enterprise-grade protection:
                </p>
                <div className="mt-6 border-l-4 border-primary bg-primary/5 p-6 rounded-r-2xl italic">
                  "Raje utilizes end-to-end encryption (E2EE) for room signaling. We 
                  cannot read your code snippets while they are in transit between collaborators."
                </div>
              </section>

              <section id="sharing" className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-primary">04.</span> Third Party Sharing
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We only share data with essential infrastructure providers:
                </p>
                <table className="w-full mt-6 text-sm border-collapse rounded-xl overflow-hidden border border-border">
                  <thead className="bg-muted text-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Partner</th>
                      <th className="px-4 py-3 text-left">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><td className="px-4 py-3 font-medium">Stripe</td><td className="px-4 py-3 text-muted-foreground">Payment Processing</td></tr>
                    <tr><td className="px-4 py-3 font-medium">AWS</td><td className="px-4 py-3 text-muted-foreground">Cloud Infrastructure</td></tr>
                    <tr><td className="px-4 py-3 font-medium">PostHog</td><td className="px-4 py-3 text-muted-foreground">Product Analytics (Anonymous)</td></tr>
                  </tbody>
                </table>
              </section>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
