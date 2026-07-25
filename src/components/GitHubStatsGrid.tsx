import { motion } from 'framer-motion';
import { GitBranch, Star, GitFork, Code2, Users, Clock } from 'lucide-react';

interface GitHubStats {
  repos: number;
  stars: number;
  forks: number;
  languages: string[];
  followers: number;
  accountAgeDays: number;
  recentCommits: number;
}

interface GitHubStatsGridProps {
  stats: GitHubStats;
}

const statCards = [
  { key: 'repos', label: 'Repositories', icon: GitBranch, color: '#9B8EC4', bg: 'bg-lavender-light' },
  { key: 'stars', label: 'Stars Earned', icon: Star, color: '#D4A853', bg: 'bg-amber-light' },
  { key: 'forks', label: 'Forks', icon: GitFork, color: '#7C9A82', bg: 'bg-sage-light' },
  { key: 'recentCommits', label: 'Recent Commits', icon: Code2, color: '#6B9ECF', bg: 'bg-sky-light' },
  { key: 'followers', label: 'Followers', icon: Users, color: '#C48B8B', bg: 'bg-rose-light' },
  { key: 'accountAgeDays', label: 'Account Age', icon: Clock, color: '#9B8EC4', bg: 'bg-lavender-light', format: (v: number) => {
    const years = Math.floor(v / 365);
    const months = Math.floor((v % 365) / 30);
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  }},
] as const;

export function GitHubStatsGrid({ stats }: GitHubStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const rawValue = stats[card.key as keyof GitHubStats];
        const displayValue = 'format' in card && card.format 
          ? card.format(rawValue as number) 
          : typeof rawValue === 'number' ? rawValue.toLocaleString() : rawValue;

        return (
          <motion.div
            key={card.key}
            className="soft-card rounded-xl p-4 flex flex-col gap-2.5 group hover:shadow-md transition-shadow duration-300"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 + index * 0.06 }}
          >
            <div
              className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
            >
              <Icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-ink leading-tight">
                {displayValue}
              </div>
              <div className="text-[11px] text-ink-faint font-medium mt-0.5 uppercase tracking-wider">
                {card.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
