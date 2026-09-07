"use client";

import { motion, AnimatePresence, Variants } from "motion/react";
import { X, Type, AlignLeft } from "lucide-react";
import { useState } from "react";

export default function NewProjectModal({ isOpen, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({ name: "", description: "" });

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: -40 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 } 
    },
    exit: { opacity: 0, scale: 0.8, y: 40 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tighter">INITIATE UNIT</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onCreate(formData); }}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Project Name</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      autoFocus
                      required
                      className="w-full bg-secondary/50 border-none rounded-2xl pl-12 py-3 focus:ring-2 focus:ring-primary/20"
                      placeholder="Orchestration Delta..."
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 text-muted-foreground" size={16} />
                    <textarea 
                      className="w-full bg-secondary/50 border-none rounded-2xl pl-12 py-3 h-32 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Objective and parameters..."
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm Provisioning
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
