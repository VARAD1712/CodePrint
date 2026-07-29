'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthSideGraphic } from '@/components/Auth/AuthSideGraphic';
import { Button, Input, Card } from '@/components/UI/Primitives';
import { Mail, ArrowLeft, CheckCircle, ExternalLink, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [simulatedUrl, setSimulatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to trigger reset protocol');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      if (data.simulatedUrl) {
        setSimulatedUrl(data.simulatedUrl);
      }
    } catch {
      setError('Network communication failure during request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100">
      <AuthSideGraphic
        title="Secure Credential Recovery"
        subtitle="Request a tokenized link via our email dispatcher (SendGrid/Resend architecture) to reset your student or faculty vault passkeys without compromising existing RAG vector indexes."
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md space-y-7">
          <div className="text-left space-y-2">
            <Link href="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-blue-400 font-semibold uppercase tracking-wider mb-2 transition-colors">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Login Vault
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Reset Workspace Passkey</h2>
            <p className="text-sm text-slate-400">Enter your registered email address to receive a 256-bit secure reset token.</p>
          </div>

          {error && <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium">{error}</div>}

          {submitted ? (
            <Card className="space-y-4 border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-slate-200">Verification Link Transmitted</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an active scholar or faculty account is associated with <span className="font-mono text-blue-400 font-bold">{email}</span>, a tokenized verification link has been dispatched.
              </p>

              {simulatedUrl && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2 mt-3 text-left">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    ⚡ QA Dev Simulation Option (SendGrid Mock)
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    For local testing, click below to test the tokenized link verification loop directly:
                  </p>
                  <Link
                    href={simulatedUrl}
                    className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 px-3 py-1.5 rounded border border-blue-500/30 w-full justify-center transition-colors"
                  >
                    Launch Tokenized Verification View <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Scholar Email"
                type="email"
                placeholder="alex.rivera@cs.university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
              />

              <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm shadow-md mt-2" isLoading={loading}>
                Transmit Secure Token <KeyRound className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
            Tokens expire in 15 minutes as per dual-token JWT security specifications.
          </div>
        </div>
      </div>
    </div>
  );
}
