import {
  Scale,
  Gavel,
  AlertCircle,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

export default async function TermsOfService() {
  'use cache';
  const summaries = [
    {
      title: 'Ownership',
      text: 'You own your code. We just host the session.',
    },
    {
      title: 'Conduct',
      text: "Don't use Raje for illegal activities or malware.",
    },
    {
      title: 'Termination',
      text: 'You can delete your account and data anytime.',
    },
    {
      title: 'Liability',
      text: "We provide the tool 'as is'. Use it responsibly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* HEADER */}
      <section className="py-20 border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center gap-3 text-primary mb-4">
            <Scale size={32} />
            <span className="font-mono text-sm tracking-widest uppercase">
              Legal Framework
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Terms of <span className="text-primary">Service.</span>
          </h1>
          <p className="text-muted-foreground italic">
            Effective Date: March 30, 2026
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* CONTENT AREA */}
          <main className="flex-1 space-y-12">
            <section className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Gavel className="text-primary" size={24} /> 1. Acceptance of
                Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Raje Collaborative Editor, you agree
                to be bound by these terms. If you are using Raje on behalf of
                an organization, you are agreeing to these terms for that
                organization and promising that you have the authority to bind
                that organization to these terms.
              </p>
            </section>

            <section className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Terminal className="text-primary" size={24} /> 2. User Accounts
                & Security
              </h2>
              <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the confidentiality of
                  your account credentials. Any activity that happens under your
                  account is your responsibility.
                </p>
                <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20 text-destructive text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>
                    Accounts found sharing credentials or automating "Bot"
                    collaborators without API tokens will be suspended.
                  </p>
                </div>
              </div>
            </section>

            <section className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <CheckCircle2 className="text-primary" size={24} /> 3.
                Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We claim <strong>no ownership</strong> over the code, text, or
                data you transmit via our real-time synchronization service. You
                grant Raje a limited, non-exclusive license to transmit and
                process your data solely for the purpose of providing the
                collaboration service.
              </p>
            </section>

            <section className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
              <ul className="space-y-3">
                {[
                  'No reverse engineering the synchronization engine.',
                  'No using the service for mining or heavy compute workloads.',
                  'No harassment of other users in shared collaborative rooms.',
                  "No distribution of copyrighted materials you don't own.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-muted-foreground text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </main>

          {/* SIDEBAR SUMMARY */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-24 p-8 rounded-3xl bg-muted/50 border border-border">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <span className="text-primary">TL;DR</span> Summary
              </h3>
              <div className="space-y-6">
                {summaries.map((s, i) => (
                  <div key={i}>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                      {s.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 text-xs font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity">
                Download PDF
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
