"use client";

import CreateProjectModal from "@/components/CreateProjectModel";
import ProjectCart from "@/components/ProjectCart";
import { Project } from "@/features/project/projectType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderPlus, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Projects = ({ projects }: { projects: Project[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  
  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      const res = await fetch('/api/project/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name, projectDesc: description }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create");
      }
      return res.json();
    },
    onMutate: () => {
      return toast.loading("Provisioning workspace...");
    },
    onSuccess: (_data, _variables, context) => {
      toast.success("Workspace initialized!", { id: context });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsModalOpen(false);
    },
    onError: (error, _variables, context) => {
      toast.error(error.message || "Orchestration failed.", { id: context });
    },
  });
  const handleCreateProject = (name: string, description: string) => {
    createProject({ name, description });
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Dashboard Header */}
      <div className="flex-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">
            Manage your collaborative coding sessions
          </p>
        </div>

        <div className="flex-right gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-input border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => setIsModalOpen(true)}
          className="group border-2 border-dashed border-border rounded-xl flex-col-center gap-3 p-8 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-50"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <FolderPlus size={24} />
          </div>
          <span className="font-bold text-muted-foreground group-hover:text-primary">
            Create New Workspace
          </span>
        </div>

        {filteredProjects.map((project: Project, idx: number) => (
          <ProjectCart key={project.id || idx} project={project} />
        ))}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        isPending={isPending}
      />
    </div>
  );
};

export default Projects;
