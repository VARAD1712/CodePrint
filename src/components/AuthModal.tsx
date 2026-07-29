import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { X, Loader2, GraduationCap, Building2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { authService } from '../services/apiClient';
import type { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
  initialAccountType?: UserRole;
}

export function AuthModal({ isOpen, onClose, onSuccess, initialAccountType = 'student' }: AuthModalProps) {
  const [accountType, setAccountType] = useState<UserRole>(initialAccountType);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opened with a new initial type
  useEffect(() => {
    if (isOpen) {
      setAccountType(initialAccountType);
    }
  }, [isOpen, initialAccountType]);

  if (!isOpen) return null;

  const upsertProfile = async (uid: string, userEmail: string | null, name: string) => {
    const payload: Record<string, unknown> = {
      id: uid,
      email: userEmail,
      full_name: name,
      role: accountType,
      created_at: new Date().toISOString(),
    };
    if (accountType === 'company') {
      payload.company_name = companyName.trim() || name;
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' });

    if (dbError) console.error('Supabase Profile Error:', dbError);
    await authService.negotiateToken(uid, userEmail, accountType, name, payload.company_name as string);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    localStorage.setItem('codeprint_active_role', accountType);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await upsertProfile(userCredential.user.uid, userCredential.user.email, fullName);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Force update the role to the selected tab for easier testing/switching
        const { error: updateError } = await supabase.from('profiles').update({ role: accountType }).eq('id', userCredential.user.uid);
        if (updateError) {
          console.error("Failed to update role in Supabase. Check if the 'role' column exists or if RLS is blocking it:", updateError);
        }
        await authService.negotiateToken(userCredential.user.uid, userCredential.user.email, accountType, userCredential.user.displayName || 'User');
      }

      onSuccess(accountType);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    localStorage.setItem('codeprint_active_role', accountType);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await upsertProfile(user.uid, user.email, user.displayName || 'Google User');
      onSuccess(accountType);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-graphite/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-gray hover:text-deep-graphite transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-deep-graphite mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-slate-gray text-sm mb-5">
            {isSignUp ? 'Choose how you want to use Codeprint.' : 'Sign in to continue.'}
          </p>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                accountType === 'student'
                  ? 'border-charcoal bg-charcoal/5'
                  : 'border-stone-border hover:border-slate-gray/40'
              }`}
            >
              <GraduationCap className={`w-6 h-6 mb-2 ${accountType === 'student' ? 'text-charcoal' : 'text-slate-gray'}`} />
              <p className="font-semibold text-sm text-deep-graphite">Student</p>
              <p className="text-xs text-slate-gray mt-0.5">Build profile & apply to jobs</p>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('company')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                accountType === 'company'
                  ? 'border-charcoal bg-charcoal/5'
                  : 'border-stone-border hover:border-slate-gray/40'
              }`}
            >
              <Building2 className={`w-6 h-6 mb-2 ${accountType === 'company' ? 'text-charcoal' : 'text-slate-gray'}`} />
              <p className="font-semibold text-sm text-deep-graphite">Company</p>
              <p className="text-xs text-slate-gray mt-0.5">Recruit verified developers</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-deep-graphite mb-1">
                    {accountType === 'company' ? 'Contact Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-border rounded-md focus:outline-none focus:ring-1 focus:ring-charcoal"
                    placeholder={accountType === 'company' ? 'HR Manager' : 'Jane Doe'}
                    required
                  />
                </div>
                {accountType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-deep-graphite mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-border rounded-md focus:outline-none focus:ring-1 focus:ring-charcoal"
                      placeholder="Acme Corp"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-deep-graphite mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-border rounded-md focus:outline-none focus:ring-1 focus:ring-charcoal"
                placeholder="jane@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-graphite mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-border rounded-md focus:outline-none focus:ring-1 focus:ring-charcoal"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-white py-2.5 rounded-md font-medium hover:bg-deep-graphite transition-colors flex justify-center items-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                `Sign up as ${accountType === 'student' ? 'Student' : 'Company'}`
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <hr className="flex-1 border-stone-border" />
            <span className="text-xs text-slate-gray font-medium uppercase tracking-wider">Or</span>
            <hr className="flex-1 border-stone-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full bg-white text-deep-graphite border border-stone-border py-2.5 rounded-md font-medium hover:bg-warm-white transition-colors flex justify-center items-center gap-2"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm text-slate-gray">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-deep-graphite font-semibold hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
