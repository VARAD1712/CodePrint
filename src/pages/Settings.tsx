import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, Check } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';

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
        <div className="space-y-4">
          {/* GitHub */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-ink-light mb-1.5">
              <GithubIcon className="w-3.5 h-3.5" /> GitHub Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ghUser}
                onChange={e => setGhUser(e.target.value)}
                placeholder="e.g. torvalds"
                className="flex-1 px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
              />
              <button
                onClick={() => handleSave('github')}
                className="px-4 py-2.5 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors flex-shrink-0"
              >
                {saved === 'github' ? <Check className="w-4 h-4" /> : 'Save'}
              </button>
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
