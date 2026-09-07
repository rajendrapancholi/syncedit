"use client";
import { X } from "lucide-react";
import React from "react";
import toast, { resolveValue, Toast, Toaster } from "react-hot-toast";

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "14px",
          padding: "12px 16px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        success: {
          iconTheme: {
            primary: "var(--color-success)",
            secondary: "var(--color-primary-foreground)",
          },
          style: {
            borderLeft: "4px solid var(--color-success)",
            background: "var(--color-card)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-destructive)",
            secondary: "var(--color-primary-foreground)",
          },
          style: {
            borderLeft: "4px solid var(--color-destructive)",
            background: "var(--color-card)",
          },
        },
        loading: {
          style: {
            borderLeft: "4px solid var(--color-info)",
            background: "var(--color-card)",
          },
        },
      }}
      >
       {(t: Toast) => (
        <div
          style={{
            ...t.style,
            opacity: t.visible ? 1 : 0,
            animation: t.visible
              ? "enter 0.3s ease-out"
              : "leave 0.3s ease-in forwards",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
          className="group relative"
        >
          {resolveValue(t.icon, t)}
          
          <div className="flex-1">{resolveValue(t.message, t)}</div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      )}
     </Toaster> 
  );
};

export default ToastProvider;
