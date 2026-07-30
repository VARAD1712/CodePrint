import { useState, useEffect } from 'react';
import { auth, githubProvider } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { X, Loader2, GraduationCap, Building2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { authService } from '../services/apiClient';
import { GithubIcon } from './BrandIcons';
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

  const upsertProfile = async (
    uid: string,
    userEmail: string | null,
    name: string,
    githubUsername?: string,
    avatarUrl?: string | null,
    githubAccessToken?: string | null
  ) => {
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
    if (githubUsername) {
      payload.github_username = githubUsername;
    }
    if (avatarUrl) {
      payload.avatar_url = avatarUrl;
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' });

    if (dbError) console.error('Supabase Profile Error:', dbError);

    // Store GitHub access token in localStorage (not in Supabase for security)
    if (githubAccessToken && uid) {
      localStorage.setItem(`codeprint_gh_access_token_${uid}`, githubAccessToken);
    }
    if (githubUsername && uid) {
      localStorage.setItem(`codeprint_gh_username_${uid}`, githubUsername);
    }

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

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError('');
    localStorage.setItem('codeprint_active_role', accountType);

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      // Extract GitHub username from additionalUserInfo
      const additionalInfo = (result as any).additionalUserInfo || (result as any)._tokenResponse;
      const githubUsername =
        additionalInfo?.username ||
        additionalInfo?.screenName ||
        user.providerData.find(p => p.providerId === 'github.com')?.displayName ||
        '';

      // Extract GitHub OAuth access token
      const credential = GithubAuthProvider.credentialFromResult(result);
      const githubAccessToken = credential?.accessToken || null;

      // Extract avatar from GitHub profile
      const avatarUrl = user.photoURL || null;

      await upsertProfile(
        user.uid,
        user.email,
        user.displayName || githubUsername || 'GitHub User',
        githubUsername,
        avatarUrl,
        githubAccessToken
      );

      onSuccess(accountType);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const code = (err as any).code || '';
        if (code === 'auth/operation-not-allowed') {
          setError(
            'GitHub OAuth is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method > GitHub.'
          );
        } else if (err.message.includes('account-exists-with-different-credential') || code === 'auth/account-exists-with-different-credential') {
          setError(
            'An account already exists with the same email. Please sign in with Google or email first, then connect GitHub from your Profile page.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('GitHub Authentication failed');
      }
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
            <span className="text-xs text-slate-gray font-medium uppercase tracking-wider">Or continue with</span>
            <hr className="flex-1 border-stone-border" />
          </div>

          {/* Social OAuth Buttons */}
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-deep-graphite border border-stone-border py-2.5 rounded-md font-medium hover:bg-warm-white transition-colors flex justify-center items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full bg-[#24292F] text-white border border-[#24292F] py-2.5 rounded-md font-medium hover:bg-[#1B1F23] transition-colors flex justify-center items-center gap-2"
            >
              <GithubIcon className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

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
