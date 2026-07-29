'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthSideGraphic } from '@/components/Auth/AuthSideGraphic';
import { Button, Input } from '@/components/UI/Primitives';
import { useAuthStore } from '@/lib/store';
import { Mail, Lock, User as UserIcon, Shield, CheckCircle, ShieldAlert, ArrowRight, FolderGit2, Globe } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { fetchUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time password strength algorithm ($0-100$)
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 30;
    if (password.length >= 12) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    return Math.min(100, score);
  }, [password]);

  const strengthColor = useMemo(() => {
    if (strength <= 30) return 'bg-red-500';
    if (strength <= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }, [strength]);

  const strengthLabel = useMemo(() => {
    if (!password) return 'None';
    if (strength <= 30) return 'Weak';
    if (strength <= 70) return 'Moderate';
    return 'Production Grade (Strong)';
  }, [password, strength]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 30) {
      setError('Please select a stronger password (minimum 8 characters required)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      await fetchUser();
      router.push('/dashboard');
    } catch {
      setError('Network exception during registration protocol');
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null);
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: provider === 'github' ? 'alex.rivera.git@university.edu' : 'alex.rivera.google@university.edu',
          name: provider === 'github' ? 'Alex Rivera (GitHub OAuth)' : 'Alex Rivera (Google OAuth)',
          role,
        }),
      });

      if (!res.ok) throw new Error('OAuth synchronization failed');

      await fetchUser();
      router.push('/dashboard');
    } catch {
      setError('OAuth simulation error. Please execute manual credential sign up.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Left Panel */}
      <AuthSideGraphic
        title="Institutional Supervision & Defense Vault"
        subtitle="Onboard into our dual-token architecture with Role-Based Access Control (RBAC) separating Student scholars, Faculty Mentors, and Administrators."
      />

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-14 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left space-y-1.5">
            <Link href="/login" className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider mb-2 transition-colors">
              Already possess credentials? Login Vault <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Create Scholar Vault</h2>
            <p className="text-xs sm:text-sm text-slate-400">Initialize your institutional profile and claim your vector workspace.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs (RBAC Spec) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">Select Primary Role (RBAC)</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-lg border border-slate-800">
              {(['STUDENT', 'FACULTY', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-xs font-bold rounded-md transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === r ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {r === 'FACULTY' ? 'Mentor / Faculty' : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* OAuth Rapid Onboarding */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOAuth('github')}
              className="text-xs font-medium py-2 bg-slate-900 border-slate-800 hover:border-slate-700"
            >
              <FolderGit2 className="h-4 w-4 mr-1.5" />
              Sync via GitHub
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOAuth('google')}
              className="text-xs font-medium py-2 bg-slate-900 border-slate-800 hover:border-slate-700"
            >
              <Globe className="h-4 w-4 mr-1.5 text-blue-400" />
              Sync via Google
            </Button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800/80 w-full" />
            <span className="bg-slate-950 px-2 text-xs uppercase tracking-wider text-slate-500 font-semibold absolute">or register with email</span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name / Scholar Title"
              type="text"
              placeholder="Dr. Jordan Rivera or Alex Rivera"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="h-4 w-4" />}
            />

            <Input
              label="Academic or Corporate Email"
              type="email"
              placeholder="j.rivera@mit.edu or a.vance@stanford.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />

            <div className="space-y-2">
              <Input
                label="Create Master Password"
                type="password"
                placeholder="Must be at least 8 chars with symbols"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
              />

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-400">Strength Meter:</span>
                    <span className={strength <= 30 ? 'text-red-400 font-bold' : strength <= 70 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {strengthLabel} ({strength}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }} />
                  </div>
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className={`h-3 w-3 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-600'}`} /> 8+ Chars
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className={`h-3 w-3 ${/[A-Z0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-600'}`} /> Alphanumeric
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-600'}`} /> Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm shadow-md mt-2" isLoading={loading}>
              Initialize Role & Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
