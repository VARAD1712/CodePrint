import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, Check, Link2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import { auth, githubProvider } from '../services/firebase';
import { linkWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { supabase } from '../services/supabase';

interface SettingsProps {
  profile: any;
  githubUsername: string;
  linkedinUrl: string;
  onUpdateGithub: (username: string) => void;
  onUpdateLinkedin: (url: string) => void;
  onUpdateProfile: (name: string, email: string) => void;
}

export function Settings({ profile, githubUsername, linkedinUrl, onUpdateGithub, onUpdateLinkedin, onUpdateProfile }: SettingsProps) {
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [ghUser, setGhUser] = useState(
    githubUsername || profile?.github_username || localStorage.getItem(`codeprint_gh_username_${profile?.id}`) || ''
  );
  const [liUrl, setLiUrl] = useState(
    linkedinUrl || profile?.linkedin_url || localStorage.getItem(`codeprint_linkedin_url_${profile?.id}`) || ''
  );
  const [saved, setSaved] = useState('');
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [linkError, setLinkError] = useState('');
  const [, setProviderRefresh] = useState(0);

  const providerData = auth.currentUser?.providerData || [];
  const isGoogleLinked = providerData.some(p => p.providerId === 'google.com');
  const isGithubLinked = providerData.some(p => p.providerId === 'github.com');

  const handleLinkProvider = async (providerName: 'google' | 'github') => {
    if (!auth.currentUser) return;
    setLinkingProvider(providerName);
    setLinkError('');
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : githubProvider;
      const res = await linkWithPopup(auth.currentUser, provider);
      if (providerName === 'github') {
        const additionalInfo = (res as any).additionalUserInfo || (res as any)._tokenResponse;
        const extractedUsername = additionalInfo?.username || res.user.providerData.find(p => p.providerId === 'github.com')?.displayName;
        if (extractedUsername) {
          setGhUser(extractedUsername);
          onUpdateGithub(extractedUsername);
          if (profile?.id) {
            await supabase.from('profiles').update({ github_username: extractedUsername }).eq('id', profile.id);
            localStorage.setItem(`codeprint_gh_username_${profile.id}`, extractedUsername);
          }
        }
      }
      setProviderRefresh(prev => prev + 1);
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setLinkError(`This ${providerName === 'google' ? 'Google' : 'GitHub'} account is already linked to another user.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setLinkError(`${providerName === 'google' ? 'Google' : 'GitHub'} sign-in is not enabled in Firebase Console (Authentication > Sign-in method).`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setLinkError(err.message || 'Failed to link account.');
      }
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleSave = async (section: string) => {
    if (section === 'profile') await onUpdateProfile(name, email);
    if (section === 'github') await onUpdateGithub(ghUser);
    if (section === 'linkedin') await onUpdateLinkedin(liUrl);
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-2xl font-bold text-ink tracking-tight">Settings</h1>
        <p className="text-ink-light text-sm mt-1">Manage your profile and connected accounts.</p>
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.05 }}
        className="soft-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-ink-faint" />
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Profile Information</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-light mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-light mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
            />
          </div>
          <button
            onClick={() => handleSave('profile')}
            className="flex items-center gap-2 bg-ink text-cream px-4 py-2 rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors mt-2"
          >
            {saved === 'profile' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved === 'profile' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* Connected Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
        className="soft-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-ink-faint" />
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Connected Accounts</h3>
        </div>
        <div className="space-y-6">
          {/* OAuth Providers */}
          <div className={`space-y-3 ${profile?.role !== 'company' ? 'pb-4 border-b border-border-soft' : ''}`}>
            <p className="text-xs text-ink-faint font-medium">
              {profile?.role === 'company'
                ? 'Connect your Enterprise Google Account for required single sign-on (SSO) authentication.'
                : 'Connect external sign-in accounts for easy one-click authentication across Google and GitHub.'}
            </p>
            
            <div className="flex items-center justify-between p-3 bg-cream rounded-xl border border-border-soft">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-ink">Google Account</p>
                  <p className="text-xs text-ink-faint">{isGoogleLinked ? 'Connected as sign-in method' : 'Required enterprise authentication'}</p>
                </div>
              </div>
              {isGoogleLinked ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                </span>
              ) : (
                <button
                  onClick={() => handleLinkProvider('google')}
                  disabled={!!linkingProvider}
                  className="px-3.5 py-1.5 bg-ink text-white rounded-lg text-xs font-semibold hover:bg-ink/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {linkingProvider === 'google' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                  Connect
                </button>
              )}
            </div>

            {profile?.role !== 'company' && (
              <div className="flex items-center justify-between p-3 bg-cream rounded-xl border border-border-soft">
                <div className="flex items-center gap-3">
                  <GithubIcon className="w-5 h-5 text-ink flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-ink">GitHub Account</p>
                    <p className="text-xs text-ink-faint">{isGithubLinked ? 'Connected as sign-in & analysis source' : 'Not linked via OAuth'}</p>
                  </div>
                </div>
                {isGithubLinked ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                  </span>
                ) : (
                  <button
                    onClick={() => handleLinkProvider('github')}
                    disabled={!!linkingProvider}
                    className="px-3.5 py-1.5 bg-[#24292F] text-white rounded-lg text-xs font-semibold hover:bg-[#1B1F23] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {linkingProvider === 'github' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                    Connect
                  </button>
                )}
              </div>
            )}

            {linkError && (
              <p className="text-xs text-rose bg-rose-light p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {linkError}
              </p>
            )}
          </div>

          {profile?.role !== 'company' && (
            <div className="space-y-4">
              {/* GitHub */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-ink-light mb-1.5">
                  <GithubIcon className="w-3.5 h-3.5" /> GitHub Account
                </label>
                <div className="p-3 bg-cream-dark/50 border border-border-soft rounded-xl flex items-center justify-between text-sm">
                  <span className={ghUser ? 'text-ink font-semibold' : 'text-ink-faint italic'}>
                    {ghUser ? `@${ghUser} (Synchronized via GitHub OAuth)` : 'Not connected — Connect GitHub account above'}
                  </span>
                  {ghUser && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                      Verified Identity
                    </span>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-ink-light mb-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn Profile URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={liUrl}
                    onChange={e => setLiUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="flex-1 px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
                  />
                  <button
                    onClick={() => handleSave('linkedin')}
                    className="px-4 py-2.5 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors flex-shrink-0"
                  >
                    {saved === 'linkedin' ? <Check className="w-4 h-4" /> : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
        className="soft-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-ink-faint" />
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Preferences</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Score update notifications', desc: 'Get notified when your talent score changes' },
            { label: 'Weekly progress reports', desc: 'Receive weekly summaries of your GitHub activity' },
            { label: 'Resume tips', desc: 'Get personalized tips to improve your resume' },
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                defaultChecked={i === 0}
                className="mt-0.5 w-4 h-4 rounded border-border-soft text-sage focus:ring-sage/20 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-sage transition-colors">{item.label}</p>
                <p className="text-xs text-ink-faint">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
