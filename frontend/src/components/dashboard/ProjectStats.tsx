import { Activity, Clock, Database } from "lucide-react";

export default function ProjectStats({ projects }: { projects: any[] }) {
  const stats = [
    {
      label: "Active Nodes",
      val: projects.length,
      icon: Database,
      color: "text-blue-500",
    },
    {
      label: "Uptime",
      val: "99.9%",
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      label: "Recent Commits",
      val: "142",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-card/20 border border-border p-4 rounded-2xl flex items-center gap-4"
        >
          <div
            className={`p-2 rounded-xl bg-background border border-border ${s.color}`}
          >
            <s.icon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-xl font-black">{s.val}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
