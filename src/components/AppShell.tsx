import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FolderGit2, FileText, Settings, LogOut, Menu, X, ChevronRight,
  Home, Users, Briefcase, ArrowLeft, ArrowRight, Award, Building2
} from 'lucide-react';
import { auth } from '../services/firebase';
import { NotificationsBell } from './NotificationsBell';
import type { Profile, GitHubResult, Notification, UserRole } from '../types';

const studentNav = [
  { to: '/home', label: 'Recruitment', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/portfolio', label: 'Talent Portfolio', icon: Award },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/resume', label: 'Resume Builder', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const companyNav = [
  { to: '/company/dashboard', label: 'Recruitment Dashboard', icon: LayoutDashboard },
  { to: '/company/profile', label: 'Company Profile', icon: User },
  { to: '/company/portfolio', label: 'Employer Tech Hub', icon: Building2 },
  { to: '/company/copilot', label: 'Recruitment AI Copilot', icon: Users },
  { to: '/company/interviews', label: 'AI Interview Agent', icon: Briefcase },
  { to: '/company/ppt-analyser', label: 'AI PPT Analyser', icon: FileText },
  { to: '/company/settings', label: 'Settings', icon: Settings },
];

interface AppShellProps {
  profile: Profile;
  githubResult: GitHubResult | null;
  role: UserRole;
  notifications: Notification[];
  onRefreshNotifications: () => void;
  children: React.ReactNode;
}

export function AppShell({ profile, githubResult, role, notifications, onRefreshNotifications, children }: AppShellProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = role === 'company' ? companyNav : studentNav;

  const handleSignOut = async () => {
    localStorage.removeItem('demo_role_override');
    localStorage.removeItem('codeprint_active_role');
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream grain font-sans text-ink-light flex">
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
          fixed top-0 left-0 h-full w-[260px] bg-white/80 backdrop-blur-xl
          border-r border-border-soft z-50 flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:relative lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-border-soft/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
              <span className="text-cream text-xs font-bold tracking-tight">CP</span>
            </div>
            <span className="font-semibold text-ink text-[15px] tracking-tight">Codeprint</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-faint hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            {githubResult?.avatarUrl ? (
              <img src={githubResult.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-border-soft" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center">
                <User className="w-5 h-5 text-ink-faint" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">
                {role === 'company' ? (profile.company_name || profile.full_name) : (profile.full_name || 'Student')}
              </p>
              <p className="text-xs text-ink-faint truncate capitalize">{role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive ? 'bg-ink text-cream shadow-sm' : 'text-ink-light hover:bg-cream-dark hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-cream' : 'text-ink-faint group-hover:text-ink-light'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
                      <ChevronRight className="w-3.5 h-3.5 text-cream/60" />
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-ink-faint hover:bg-rose-light hover:text-rose transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
        <header className="h-14 px-4 flex items-center justify-between border-b border-border-soft bg-white/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-ink-light hover:text-ink">
              <Menu className="w-5 h-5" />
            </button>
            <span className="ml-3 lg:ml-0 font-semibold text-ink text-sm lg:hidden">Codeprint</span>
            
            <div className="hidden lg:flex items-center gap-1 ml-4 border border-border-soft rounded-lg p-0.5 bg-cream">
              <button onClick={() => navigate(-1)} className="p-1.5 text-ink-faint hover:text-ink hover:bg-cream-dark rounded-md transition-colors" aria-label="Go back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(1)} className="p-1.5 text-ink-faint hover:text-ink hover:bg-cream-dark rounded-md transition-colors" aria-label="Go forward">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {role === 'student' && (
            <NotificationsBell
              userId={profile.id}
              notifications={notifications}
              onRefresh={onRefreshNotifications}
            />
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
