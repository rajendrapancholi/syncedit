import { FolderCode, Users, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ProjectCard({ project }: any) {
  return (
    <div className="group relative bg-card/40 border border-border rounded-3xl p-6 hover:border-primary/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
          <FolderCode className="text-primary" size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-muted rounded-md opacity-60">
          {project.access_level || 'owner'}
        </span>
      </div>

      <h3 className="text-lg font-bold truncate mb-1">{project.name}</h3>
      <p className="text-muted-foreground text-xs line-clamp-2 mb-6 min-h-10">
        {project.description || "No description provided for this orchestration."}
      </p>

      <div className="flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-zinc-800" />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
            +4
          </div>
        </div>

        <Link 
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2 transition-all"
        >
          Open IDE <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
