import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FolderGit2, FileText, Settings, LogOut, Menu, X, ChevronRight,
  Home, Users, Briefcase, ArrowLeft, ArrowRight, Award, Building2, Sparkles, Zap, Search, Command
} from 'lucide-react';
import { auth } from '../services/firebase';
import { NotificationsBell } from './NotificationsBell';
import type { Profile, GitHubResult, Notification, UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  desc: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const studentNavGroups: NavGroup[] = [
  {
    title: '🎯 Recruitment & Career AI',
    items: [
      { to: '/home', label: 'Recruitment Home', icon: Home, desc: 'Overview of AI recruitment pipeline and opportunities' },
      { to: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard, desc: 'Your comprehensive GitHub and application analytics' },
      { to: '/career', label: 'Career AI Advisor', icon: Sparkles, desc: 'Real-time tech market guidance and personalized roadmaps' },
      { to: '/interview', label: 'AI Mock Interviewer', icon: Zap, desc: 'Interactive voice and code AI interviewer simulator' },
      { to: '/hackathons', label: 'Hackathons & Contests', icon: Award, desc: 'Submit projects for verified Git code complexity scoring & direct hiring' },
    ],
  },
  {
    title: '📁 Talent & Credentials',
    items: [
      { to: '/profile', label: 'Profile & Evaluation', icon: User, desc: 'GitHub talent scoring and verified LinkedIn analysis' },
      { to: '/portfolio', label: 'Talent Portfolio', icon: Award, desc: 'Showcase achievements, hackathons, and certifications' },
      { to: '/projects', label: 'Code & Projects', icon: FolderGit2, desc: 'AI-analyzed repository metrics and code hygiene' },
      { to: '/resume', label: 'AI Resume Builder', icon: FileText, desc: 'Generate recruiter-ready verified resumes automatically' },
    ],
  },
  {
    title: '⚙️ Account',
    items: [
      { to: '/settings', label: 'Settings & Integrations', icon: Settings, desc: 'Manage profile links and account preferences' },
    ],
  },
];

const companyNavGroups: NavGroup[] = [
  {
    title: '🏢 Enterprise Core',
    items: [
      { to: '/company/dashboard', label: 'Recruitment Dashboard', icon: LayoutDashboard, desc: 'Enterprise overview of candidate pipelines' },
      { to: '/company/profile', label: 'Company Profile', icon: User, desc: 'Manage your employer branding and job listings' },
      { to: '/company/portfolio', label: 'Employer Tech Hub', icon: Building2, desc: 'Engineering stack and culture portfolio' },
    ],
  },
  {
    title: '🤖 AI Intelligence Suite',
    items: [
      { to: '/company/copilot', label: 'Candidate Discovery AI', icon: Users, desc: 'Semantic discovery and talent match engine' },
      { to: '/company/interviews', label: 'AI Interview Agent', icon: Briefcase, desc: 'Automated technical screening and interview bots' },
      { to: '/company/ppt-analyser', label: 'AI PPT Analyser', icon: FileText, desc: 'Audit student presentation decks and proposals' },
      { to: '/company/hackathons', label: 'Hackathon Talent Hub', icon: Award, desc: 'Real-time project leaderboard with dynamic complexity & freshness sliders' },
    ],
  },
  {
    title: '⚙️ Account',
    items: [
      { to: '/company/settings', label: 'Enterprise Settings', icon: Settings, desc: 'Account configuration and security' },
    ],
  },
];

interface AppShellProps {
  profile: Profile;
  githubResult: GitHubResult | null;
  role: UserRole;
  notifications: Notification[];
  onRefreshNotifications: () => void;
  onPrefetch?: (routePath: string) => void;
  children: React.ReactNode;
}

export const AppShell = React.memo(function AppShell({
  profile,
  githubResult,
  role,
  notifications,
  onRefreshNotifications,
  onPrefetch,
  children
}: AppShellProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  const navGroups = role === 'company' ? companyNavGroups : studentNavGroups;
  const allNavItems = useMemo(() => navGroups.flatMap(g => g.items), [navGroups]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = useCallback(async () => {
    localStorage.removeItem('demo_role_override');
    localStorage.removeItem('codeprint_active_role');
    await auth.signOut();
    navigate('/');
  }, [navigate]);

  const filteredCmdItems = useMemo(() => {
    if (!cmdQuery.trim()) return allNavItems;
    const q = cmdQuery.toLowerCase();
    return allNavItems.filter(item => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
  }, [allNavItems, cmdQuery]);

  const handleCmdSelect = (to: string) => {
    setCmdOpen(false);
    setCmdQuery('');
    navigate(to);
  };

  return (
    <div className="min-h-screen bg-cream grain font-sans text-ink-light flex">
      {/* Quick AI Command Palette Modal */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border-soft overflow-hidden z-50"
            >
              <div className="flex items-center px-4 py-3 border-b border-border-soft bg-cream-dark/50">
                <Search className="w-5 h-5 text-ink-faint mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Type to search AI engines, features, or tools..."
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  className="w-full bg-transparent text-ink text-base focus:outline-none placeholder:text-ink-faint font-medium"
                  autoFocus
                />
                <button onClick={() => setCmdOpen(false)} className="text-xs px-2 py-1 bg-white border border-border-soft rounded-md text-ink-light font-semibold hover:bg-cream">
                  ESC
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border-soft/40">
                {filteredCmdItems.length === 0 ? (
                  <p className="text-center py-8 text-ink-faint text-sm">No tools matching "{cmdQuery}"</p>
                ) : (
                  filteredCmdItems.map((item) => (
                    <button
                      key={item.to}
                      onMouseEnter={() => onPrefetch?.(item.to)}
                      onClick={() => handleCmdSelect(item.to)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream transition-colors text-left group"
                    >
                      <div className="p-2 rounded-lg bg-cream-dark text-ink group-hover:bg-ink group-hover:text-cream transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink group-hover:text-ink transition-colors">{item.label}</p>
                        <p className="text-xs text-ink-faint truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-ink group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 bg-cream border-t border-border-soft text-xs text-ink-faint flex items-center justify-between">
                <span>⚡ Tip: Hovering items prefetches AI analysis automatically</span>
                <span className="font-semibold text-ink-light">Codeprint AI OS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 left-0 h-full w-[270px] bg-white/90 backdrop-blur-xl
          border-r border-border-soft z-50 flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:relative lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-border-soft/60">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center shadow-md">
              <span className="text-cream text-xs font-bold tracking-tight">CP</span>
            </div>
            <span className="font-bold text-ink text-[16px] tracking-tight">Codeprint</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-faint hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-border-soft/30 bg-cream/40">
          <div className="flex items-center gap-3">
            {githubResult?.avatarUrl ? (
              <img src={githubResult.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-border-soft shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center border border-border-soft">
                <User className="w-5 h-5 text-ink-faint" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink truncate">
                {role === 'company' ? (profile.company_name || profile.full_name) : (profile.full_name || 'Student')}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sage-light text-sage-dark font-semibold uppercase tracking-wider text-ink-light">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {role} OS
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3.5 py-3 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint/80 mb-1.5">
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => onPrefetch?.(item.to)}
                  onFocus={() => onPrefetch?.(item.to)}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      isActive ? 'bg-ink text-cream shadow-md shadow-ink/10 scale-[1.01]' : 'text-ink-light hover:bg-cream-dark hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cream' : 'text-ink-faint group-hover:text-ink'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && (
                        <motion.div layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
                          <ChevronRight className="w-4 h-4 text-cream/70" />
                        </motion.div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3.5 border-t border-border-soft/60 bg-cream/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-ink-faint hover:bg-rose-light hover:text-rose transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
        <header className="h-14 px-4 flex items-center justify-between border-b border-border-soft bg-white/75 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-ink-light hover:text-ink">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-ink text-base lg:hidden">Codeprint</span>
            
            <div className="hidden lg:flex items-center gap-1 border border-border-soft rounded-xl p-0.5 bg-cream">
              <button onClick={() => navigate(-1)} className="p-1.5 text-ink-faint hover:text-ink hover:bg-cream-dark rounded-lg transition-colors" aria-label="Go back" title="Previous Page">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(1)} className="p-1.5 text-ink-faint hover:text-ink hover:bg-cream-dark rounded-lg transition-colors" aria-label="Go forward" title="Next Page">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick AI Command Button */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-cream border border-border-soft hover:border-ink/30 rounded-xl text-xs font-semibold text-ink-light hover:text-ink hover:bg-white shadow-xs transition-all"
            >
              <Command className="w-3.5 h-3.5 text-ink-faint" />
              <span className="hidden sm:inline">Quick AI Launcher</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-border-soft rounded text-[10px] font-mono text-ink-faint">⌘K / Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {role === 'student' && (
              <NotificationsBell
                userId={profile.id}
                notifications={notifications}
                onRefresh={onRefreshNotifications}
              />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

