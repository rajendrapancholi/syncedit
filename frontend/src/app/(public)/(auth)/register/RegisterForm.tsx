"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", pass: "" });

  // Define the Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const res = await fetch('/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Account created successfully!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Try a different email.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="flex-center min-h-[80vh] px-4">
      <div className="w-full max-w-lg">
        {/* Brand Identity */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-block p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 mb-2">
            <span className="text-2xl font-bold text-primary italic">C++</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Join the <span className="text-primary">Future</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            The only live collaborator powered by Agentic AI.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border p-8 rounded-xl shadowwhite relative overflow-hidden"
        >
          {/* Decorative Gradient Flare */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />

          <div className="mb-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                required
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </label>
              <input
                type="password"
                name="pass"
                placeholder="••••••••"
                required
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground py-3.5 rounded-md font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
               {isPending ? "Creating Account..." : "Get Started Free"}
            </button>

            <div className="flex-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase">
                Or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="reset"
              className="w-full bg-secondary/50 hover:bg-secondary text-secondary-foreground py-2.5 rounded-md font-medium text-sm transition-all cursor-pointer"
            >
              Reset Fields
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Ready to code?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-hover font-bold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mt-10">
          Secure 256-bit Encrypted Session
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
