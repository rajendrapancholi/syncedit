"use client";

import {
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from "lucide-react";

const REVENUE_METRICS = [
  {
    id: 1,
    label: "Total Revenue",
    value: "$124,592.00",
    change: "+12.5%",
    trending: "up",
    color: "text-primary",
  },
  {
    id: 2,
    label: "Active Subscriptions",
    value: "1,240",
    change: "+3.2%",
    trending: "up",
    color: "text-user-1",
  },
  {
    id: 3,
    label: "Average API Usage",
    value: "85.2%",
    change: "-1.1%",
    trending: "down",
    color: "text-user-2",
  },
  {
    id: 4,
    label: "Pending Payouts",
    value: "$12,400.00",
    change: "+0.0%",
    trending: "flat",
    color: "text-user-3",
  },
];

export default function RevenuePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 max-w-400 mx-auto space-y-10">
      {/* HEADER SECTION */}
      <div className="flex-between flex-wrap gap-6 border-b border-border/40 pb-8">
        <div>
          <div className="flex-left gap-2 mb-1">
            <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)]" />
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Financial /{" "}
              <span className="text-muted-foreground">Analytics</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Real-time revenue stream and usage billing.
          </p>
        </div>

        <div className="flex-left gap-3">
          <button className="flex-center gap-2 bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold hover:bg-muted transition-colors">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button className="flex-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REVENUE_METRICS.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group"
          >
            {/* Subtle Gradient Glow */}
            <div
              className={`absolute -top-12 -right-12 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/20 transition-all`}
            />

            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              {item.label}
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">
                {item.value}
              </h2>
              <div className="flex-left gap-1">
                {item.trending === "up" ? (
                  <ArrowUpRight className="text-success" size={14} />
                ) : (
                  <ArrowDownRight className="text-destructive" size={14} />
                )}
                <span
                  className={`text-xs font-bold ${item.trending === "up" ? "text-success" : "text-destructive"}`}
                >
                  {item.change}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN ANALYTICS VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART PLACEHOLDER (Real-time Flow) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-4xl p-8 space-y-6 relative overflow-hidden">
          <div className="flex-between">
            <div className="flex-left gap-3">
              <div className="p-2 bg-success/10 rounded-lg text-success">
                <Activity size={20} />
              </div>
              <h3 className="font-bold">Usage vs Revenue Flow</h3>
            </div>
            <div className="flex-left gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex-left gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Revenue
              </span>
              <span className="flex-left gap-1">
                <span className="w-2 h-2 rounded-full bg-user-1" /> API Calls
              </span>
            </div>
          </div>

          {/* Visual Placeholder for a Chart */}
          <div className="h-64 w-full bg-linear-to-t from-background/50 to-transparent rounded-2xl border border-dashed border-border/50 flex-center">
            <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-widest">
              [ Real-time SVG Graph Interface ]
            </p>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="bg-card border border-border rounded-4xl p-8">
          <h3 className="font-bold mb-6 flex-left gap-2">
            <CreditCard size={18} className="text-primary" /> Recent Billing
          </h3>
          <div className="space-y-6">
            {[
              {
                name: "Nexus-Frontend",
                date: "Oct 12",
                amt: "+$420.00",
                icon: "user-1",
              },
              {
                name: "Beta-Logic",
                date: "Oct 11",
                amt: "+$89.00",
                icon: "user-2",
              },
              {
                name: "Compiler-Devs",
                date: "Oct 10",
                amt: "+$1,200.00",
                icon: "user-4",
              },
              {
                name: "Web-Socket-Lab",
                date: "Oct 10",
                amt: "+$24.50",
                icon: "user-3",
              },
            ].map((t, i) => (
              <div key={i} className="flex-between group cursor-pointer">
                <div className="flex-left gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-${t.icon}/10 flex-center text-${t.icon} font-black text-[10px]`}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold group-hover:text-primary transition-colors">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.date}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-foreground">
                  {t.amt}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors">
            View All Ledgers
          </button>
        </div>
      </div>
    </div>
  );
}
