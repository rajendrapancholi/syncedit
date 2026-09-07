"use client";

import { X, Sparkles } from "lucide-react";
import { useState } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
  isPending: boolean;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
  isPending=false,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, description);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex-center bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-card border border-border p-8 shadowwhite animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex-left gap-2 mb-6">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            New Workspace
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
            >
              Project Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. quantum-compiler"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="What are we building today?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full bg-input border border-border rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:text-muted-foreground/30"
            ></textarea>
          </div>

          <div className="flex-right gap-3 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2.5 rounded-md font-bold text-sm shadow-lg shadow-primary/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isPending ? 'Initializing Project...': 'Initialize Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
