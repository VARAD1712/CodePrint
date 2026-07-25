import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STUDENT_PAGES = [
  { path: '/home', label: 'Recruitment' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/profile', label: 'Profile' },
  { path: '/projects', label: 'Projects' },
  { path: '/resume', label: 'Resume' },
  { path: '/career', label: 'Career AI' },
  { path: '/interview', label: 'AI Interview' },
  { path: '/settings', label: 'Settings' },
];

interface PageNavigationProps {
  role?: 'student' | 'company';
}

export function PageNavigation({ role = 'student' }: PageNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const pages = role === 'student' ? STUDENT_PAGES : [
    { path: '/company/dashboard', label: 'Recruitment Dashboard' },
    { path: '/company/profile', label: 'Company Profile' },
    { path: '/company/copilot', label: 'Recruitment AI Copilot' },
    { path: '/company/interviews', label: 'AI Interview Agent' },
    { path: '/company/ppt-analyser', label: 'AI PPT Analyser' },
    { path: '/company/settings', label: 'Settings' },
  ];

  const currentIndex = pages.findIndex(p => location.pathname === p.path || location.pathname.startsWith(p.path + '/'));
  const prev = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      {prev ? (
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(prev.path)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-soft bg-white text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {prev.label}
        </motion.button>
      ) : (
        <div />
      )}

      <span className="text-xs text-ink-faint font-medium hidden sm:block">
        {currentIndex + 1} / {pages.length}
      </span>

      {next ? (
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(next.path)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-cream text-sm font-medium hover:bg-ink/90 transition-colors ml-auto"
        >
          {next.label}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      ) : (
        <div />
      )}
    </div>
  );
}
