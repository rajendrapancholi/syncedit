'use client';

import { useGetUserQuery, useLoginMutation } from '@/features/auth/authApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const LoginForm: React.FC = () => {
  const router = useRouter();

  const { mutate: login, isPending: isLoggingIn } = useLoginMutation();
  const { isLoading: isFetchingUser } = useGetUserQuery();

  const [formData, setFormData] = useState({
    email: '',
    pass: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Verifying identity...');

    login(formData, {
      onSuccess: (result) => {
        toast.success(`Welcome back, ${result.user.name || 'Developer'}!`, {
          id: toastId,
        });
        router.push('/dashboard');
      },
      onError: (error: any) => {
        toast.error(
          error?.message || 'Invalid credentials. Please try again.',
          { id: toastId },
        );
      },
    });
  };

  return (
    <div className="flex-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        {/* Header with Brand Accent */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 shadow-lg mb-4">
            <span className="text-3xl font-bold text-primary italic">C</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Continue your collaborative session
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border p-8 rounded-xl shadowwhite flex flex-col gap-6 relative"
        >
          {/* Input Groups */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="developer@studio.com"
                required
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                name="pass"
                placeholder="••••••••"
                required
                onChange={handleChange}
                className="w-full bg-input border border-border rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={isLoggingIn || isFetchingUser}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground py-3.5 rounded-md font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isLoggingIn ? 'Syncing Workspace...' : 'Authorize & Enter'}
            </button>

            <button
              type="reset"
              className="w-full bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground py-2 rounded-md font-medium text-xs transition-all cursor-pointer uppercase tracking-widest"
            >
              Clear Input
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground mt-2">
            New to 2026++?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary-hover font-bold transition-colors"
            >
              Create Account
            </Link>
          </p>
        </form>

        {/* Security Badge */}
        <div className="flex-center gap-2 mt-8 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Encrypted End-to-End
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
