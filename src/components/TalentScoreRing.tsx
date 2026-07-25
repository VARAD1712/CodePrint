import { motion } from 'framer-motion';

interface TalentScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  compact?: boolean;
}

export function TalentScoreRing({ score, size = 180, strokeWidth = 10, label = 'Talent Score', compact = false }: TalentScoreRingProps) {
  const actualSize = compact ? 120 : size;
  const actualStroke = compact ? 8 : strokeWidth;
  const radius = (actualSize - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 71) return { start: '#7C9A82', end: '#A8C5AE', text: 'text-sage' };
    if (s >= 41) return { start: '#D4A853', end: '#E8C87A', text: 'text-amber' };
    return { start: '#C48B8B', end: '#D4A8A8', text: 'text-rose' };
  };

  const colors = getScoreColor(score);
  const gradientId = `score-gradient-${label.replace(/\s/g, '')}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: actualSize, height: actualSize }}>
        <svg width={actualSize} height={actualSize} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>

          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            stroke="#E8E6E1"
            strokeWidth={actualStroke}
          />

          <motion.circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={actualStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 40, damping: 15, delay: 0.3 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.6 }}
          >
            {score}
          </motion.span>
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-ink-faint font-medium tracking-wider uppercase`}>/100</span>
        </div>
      </div>
      {!compact && (
        <span className="text-sm font-semibold text-ink tracking-tight">{label}</span>
      )}
    </div>
  );
}
