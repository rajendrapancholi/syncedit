"use client";

import React from "react";
import {
  BarChart3,
  FileText,
  Share2,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

const REPORT_CARDS = [
  {
    title: "Code Velocity",
    value: "84.2%",
    trend: "+5.4%",
    color: "user-1",
    status: "Optimal",
  },
  {
    title: "Active Sessions",
    value: "1,204",
    trend: "+12%",
    color: "user-2",
    status: "High Load",
  },
  {
    title: "Review Turnaround",
    value: "4.2h",
    trend: "-1.1h",
    color: "user-3",
    status: "Improving",
  },
  {
    title: "System Uptime",
    value: "99.9%",
    trend: "Stable",
    color: "user-4",
    status: "Live",
  },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 max-w-7xl mx-auto space-y-10">
      {/* MINIMALIST HEADER */}
      <div className="flex-between border-b border-border/50 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Analytics / <span className="text-muted-foreground">Reports</span>
          </h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex-left gap-2">
            <Clock size={12} className="text-primary" /> Generated: April 3,
            2026
          </p>
        </div>

        <div className="flex-left gap-3">
          <button className="flex-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold hover:bg-muted transition-all">
            <Filter size={14} /> Filters
          </button>
          <button className="flex-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-tight hover:opacity-90 transition-all">
            <Share2 size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* QUICK METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors relative group"
          >
            <div
              className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-${card.color} shadow-[0_0_8px_var(--color-${card.color})]`}
            />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              {card.title}
            </p>
            <div className="flex-between items-end">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {card.value}
                </h2>
                <p className={`text-[10px] font-bold text-${card.color}`}>
                  {card.trend}
                </p>
              </div>
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                {card.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED LOGS & CHART VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* MAJOR REPORT PREVIEW */}
        <div className="lg:col-span-3 bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
          <div className="flex-between">
            <h3 className="font-bold flex-left gap-2">
              <BarChart3 size={18} className="text-primary" /> Performance
              Distribution
            </h3>
            <button className="text-[10px] font-black uppercase text-muted-foreground flex-left gap-1 hover:text-foreground">
              This Quarter <ChevronDown size={12} />
            </button>
          </div>

          <div className="space-y-6">
            {[
              { label: "Frontend Architecture", percent: 85, color: "user-1" },
              { label: "State Management", percent: 62, color: "user-2" },
              { label: "API Integration", percent: 94, color: "user-3" },
              { label: "Unit Test Coverage", percent: 45, color: "user-4" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex-between text-[10px] font-black uppercase tracking-widest">
                  <span>{item.label}</span>
                  <span className={`text-${item.color}`}>{item.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT GENERATED DOCUMENTS */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold px-2 flex-left gap-2 text-sm uppercase tracking-widest">
            <FileText size={16} className="text-primary" /> Recent Documents
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Monthly_Sprint_Summary.pdf",
                size: "2.4MB",
                date: "2h ago",
                icon: <CheckCircle2 size={14} className="text-success" />,
              },
              {
                name: "Team_Velocity_Q1.csv",
                size: "840KB",
                date: "5h ago",
                icon: <CheckCircle2 size={14} className="text-success" />,
              },
              {
                name: "Error_Logs_Critical.json",
                size: "12KB",
                date: "1d ago",
                icon: <AlertCircle size={14} className="text-destructive" />,
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex-between p-4 bg-card/60 border border-border rounded-2xl hover:bg-card hover:translate-x-1 transition-all cursor-pointer group"
              >
                <div className="flex-left gap-3">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <FileText
                      size={16}
                      className="text-muted-foreground group-hover:text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-35">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                {doc.icon}
              </div>
            ))}
          </div>
          <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            + Schedule New Auto-Report
          </button>
        </div>
      </div>
    </div>
  );
}
