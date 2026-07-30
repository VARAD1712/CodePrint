import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STUDENT_PAGES = [
  { path: '/home', label: 'Open Opportunities & Pipeline' },
  { path: '/dashboard', label: 'Candidate Performance Console' },
  { path: '/career', label: 'Competence Benchmark Advisory' },
  { path: '/interview', label: 'Structured Technical Evaluation' },
  { path: '/hackathons', label: 'Competitive Achievements & Certifications' },
  { path: '/profile', label: 'Developer Assessment Profile' },
  { path: '/ppt-analyser', label: 'Presentation Deck Analysis' },
  { path: '/portfolio', label: 'Verified Engineering Portfolio' },
  { path: '/projects', label: 'Repository & Telemetry Index' },
  { path: '/resume', label: 'Professional CV Synthesis' },
  { path: '/settings', label: 'Account Preferences' },
];

const COMPANY_PAGES = [
  { path: '/company/dashboard', label: 'Hiring Command Console' },
  { path: '/company/profile', label: 'Employer Organization Profile' },
  { path: '/company/portfolio', label: 'Employer Culture Repository' },
  { path: '/company/copilot', label: 'Talent Discovery & ATS Search' },
  { path: '/company/interviews', label: 'Interview Assessment Console' },
  { path: '/company/ppt-analyser', label: 'Presentation Deck Analysis' },
  { path: '/company/hackathons', label: 'Candidate Leaderboard & Assessments' },
  { path: '/company/settings', label: 'System Security & Settings' },
];

interface PageNavigationProps {
  role?: 'student' | 'company';
  onPrefetch?: (routePath: string) => void;
}

export const PageNavigation = React.memo(function PageNavigation({ role = 'student', onPrefetch }: PageNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const pages = role === 'student' ? STUDENT_PAGES : COMPANY_PAGES;

  const currentIndex = pages.findIndex(p => location.pathname === p.path || location.pathname.startsWith(p.path + '/'));
  const prev = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center justify-between gap-3 mb-6 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-border-soft/80 shadow-sm">
      {prev ? (
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => onPrefetch?.(prev.path)}
          onFocus={() => onPrefetch?.(prev.path)}
          onClick={() => navigate(prev.path)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-soft bg-white text-xs md:text-sm font-semibold text-ink hover:bg-cream-dark transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 text-ink-faint" />
          <span>{prev.label}</span>
        </motion.button>
      ) : (
        <div />
      )}

      <span className="text-xs text-ink-faint font-bold tracking-wide uppercase hidden sm:block">
        Step {currentIndex + 1} of {pages.length} — <span className="text-ink font-semibold">{pages[currentIndex].label}</span>
      </span>

      {next ? (
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => onPrefetch?.(next.path)}
          onFocus={() => onPrefetch?.(next.path)}
          onClick={() => navigate(next.path)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink text-cream text-xs md:text-sm font-semibold hover:bg-ink/90 transition-colors shadow-sm ml-auto"
        >
          <span>{next.label}</span>
          <ChevronRight className="w-4 h-4 text-cream/70" />
        </motion.button>
      ) : (
        <div />
      )}
    </div>
  );
});

