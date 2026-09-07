"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCart";
import { Search, LayoutGrid, List } from "lucide-react";

export default function DashboardClient({ initialProjects }: { initialProjects: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialProjects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-card/30 p-2 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="Filter projects..."
            className="w-full bg-transparent border-none focus:ring-0 pl-12 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 pr-2">
          <button className="p-2 bg-secondary rounded-lg"><LayoutGrid size={16} /></button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><List size={16} /></button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-50">
          <Search size={40} className="mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">No matching units found</p>
        </div>
      )}
    </div>
  );
}
