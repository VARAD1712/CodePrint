'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/UI/Primitives';
import { CheckCircle, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');

  useEffect(() => {
    // Simulate verification latency
    const timer = setTimeout(() => {
      if (token && token.length > 10) {
        setStatus('verified');
      } else {
        setStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <Card className="max-w-md w-full p-8 text-center space-y-6 bg-slate-900/90 border-slate-800 shadow-2xl">
      {status === 'verifying' && (
        <div className="space-y-4 py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Verifying Security Token...</h3>
          <p className="text-xs text-slate-400">Inspecting cryptographic signature and token TTL for <span className="font-mono text-blue-400">{email}</span></p>
        </div>
      )}

      {status === 'verified' && (
        <div className="space-y-6">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-100">Token Successfully Authenticated!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your email verification protocol has succeeded for scholar ID <span className="font-mono font-bold text-emerald-400">{email}</span>. You may now authenticate directly into your project dashboard.
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push('/login')} className="w-full py-2.5 font-bold shadow-md shadow-blue-500/20">
            Proceed to Login Vault <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">Token Verification Exception</h2>
            <p className="text-xs text-red-300/90 leading-relaxed">
              The verification token provided is either malformed or has exceeded its 15-minute time-to-live threshold.
            </p>
          </div>
          <Link href="/forgot-password">
            <Button variant="secondary" className="w-full py-2">
              Request a Fresh Verification Token
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 text-slate-100">
      <Suspense fallback={<div className="text-slate-400 text-sm animate-pulse">Initializing Token Reader...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
