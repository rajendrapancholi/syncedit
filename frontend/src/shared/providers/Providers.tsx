"use client";
import React from "react";
import ToastProvider from "./ToastProvider";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "next-themes";
import AuthInit from "@/features/auth/authInit";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider />
      <QueryProvider>
        <AuthInit />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
