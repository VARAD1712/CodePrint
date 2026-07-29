'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthSideGraphic } from '@/components/Auth/AuthSideGraphic';
import { Button, Input, Card } from '@/components/UI/Primitives';
import { useAuthStore } from '@/lib/store';
import { Mail, Lock, FolderGit2, Globe, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { fetchUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid authentication credentials');
        setLoading(false);
        return;
      }

      await fetchUser();
      router.push('/dashboard');
    } catch {
      setError('Network connection failure during authentication');
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);
    setError(null);

    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: provider === 'github' ? 'scholar@github.io' : 'research.fellow@gmail.com',
          name: provider === 'github' ? 'Alex Rivera (GitHub Scholar)' : 'Jordan Vance (Google Scholar)',
          role: 'STUDENT',
        }),
      });

      if (res.ok) {
        await fetchUser();
        router.push('/dashboard');
      } else {
        setError(`Failed to complete ${provider} authentication`);
      }
    } catch {
      setError(`Network error connecting to ${provider} authentication provider`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Left: Glowing Graphic Panel */}
      <AuthSideGraphic
        title="Welcome Back to Your Workspace"
        subtitle="Authenticate via your student OAuth ID or encrypted credentials to access deep research engines, milestone timelines, and real-time Git evaluations."
      />

      {/* Right: Clean Formal Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Sign in to your account</h2>
            <p className="text-sm text-slate-400">
              New student or faculty member?{' '}
              <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-500/30 underline-offset-4">
                Create a project workspace
              </Link>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-sm">
              <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center text-xs sm:text-sm font-medium py-2.5 bg-slate-900 border-slate-800 hover:border-slate-700"
              onClick={() => handleOAuth('github')}
              isLoading={oauthLoading === 'github'}
            >
              <Github className="h-4 w-4 mr-2 text-slate-200" />
              Continue with GitHub
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center text-xs sm:text-sm font-medium py-2.5 bg-slate-900 border-slate-800 hover:border-slate-700"
              onClick={() => handleOAuth('google')}
              isLoading={oauthLoading === 'google'}
            >
              <Chrome className="h-4 w-4 mr-2 text-blue-400" />
              Continue with Google
            </Button>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-800/80 w-full" />
            <span className="bg-slate-950 px-3 text-xs uppercase tracking-wider text-slate-500 font-semibold absolute">or continue with email</span>
          </div>

          {/* Credentials Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Student / Faculty Email"
              type="email"
              placeholder="alex.rivera@cs.university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm shadow-md mt-2" isLoading={loading}>
              Authenticate & Launch Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
            Protected by ProjectPilot Dual-Token architecture with HttpOnly SameSite cookies.
          </div>
        </div>
      </div>
    </div>
  );
}
