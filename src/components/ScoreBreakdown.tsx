import { motion } from 'framer-motion';

interface BreakdownData {
  productivity: number;
  impact: number;
  diversity: number;
  recency: number;
  community: number;
}

interface ScoreBreakdownProps {
  breakdown: BreakdownData;
}

const dimensions = [
  { key: 'productivity', label: 'Productivity', max: 25, color: '#9B8EC4', bg: 'bg-lavender-light', icon: '⚡' },
  { key: 'impact', label: 'Impact', max: 25, color: '#D4A853', bg: 'bg-amber-light', icon: '⭐' },
  { key: 'diversity', label: 'Diversity', max: 20, color: '#7C9A82', bg: 'bg-sage-light', icon: '🌐' },
  { key: 'recency', label: 'Recency', max: 15, color: '#6B9ECF', bg: 'bg-sky-light', icon: '🕐' },
  { key: 'community', label: 'Community', max: 15, color: '#C48B8B', bg: 'bg-rose-light', icon: '👥' },
] as const;

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-5">
        Score Breakdown
      </h3>
      {dimensions.map((dim, index) => {
        const value = breakdown[dim.key] || 0;
        const percentage = (value / dim.max) * 100;

        return (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.15 + index * 0.08 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{dim.icon}</span>
                <span className="text-[13px] font-medium text-ink">{dim.label}</span>
              </div>
              <span className="text-[13px] font-semibold text-ink">
                {value}<span className="text-ink-faint font-normal">/{dim.max}</span>
              </span>
            </div>
            <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: dim.color }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.3 + index * 0.08 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
