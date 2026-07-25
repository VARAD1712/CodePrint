import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface Breakdown {
  productivity: number;
  impact: number;
  diversity: number;
  recency: number;
  community: number;
}

interface SuggestionItem {
  dimension: string;
  score: number;
  max: number;
  percentage: number;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  color: string;
  bgColor: string;
  tip: string;
}

function getSuggestions(breakdown: Breakdown): SuggestionItem[] {
  const dims = [
    {
      dimension: 'Productivity', score: breakdown.productivity, max: 25,
      icon: '⚡', color: 'text-lavender', bgColor: 'bg-lavender-light',
      tips: [
        'Create more repositories — even small side projects count!',
        'Commit more frequently to show consistent activity.',
        'Try contributing to open-source projects to boost commit counts.',
      ]
    },
    {
      dimension: 'Impact', score: breakdown.impact, max: 25,
      icon: '⭐', color: 'text-amber', bgColor: 'bg-amber-light',
      tips: [
        'Add detailed READMEs to attract more stars on your repos.',
        'Share your projects on social media and dev communities.',
        'Build tools that solve real problems — they get starred more.',
      ]
    },
    {
      dimension: 'Diversity', score: breakdown.diversity, max: 20,
      icon: '🌐', color: 'text-sage', bgColor: 'bg-sage-light',
      tips: [
        'Explore new languages — try Python, Go, or Rust for a project.',
        'Add topics/tags to your repos for better discoverability.',
        'Build projects across different domains (web, CLI, mobile, AI).',
      ]
    },
    {
      dimension: 'Recency', score: breakdown.recency, max: 15,
      icon: '🕐', color: 'text-sky', bgColor: 'bg-sky-light',
      tips: [
        'Push code regularly — even small updates keep you active.',
        'Set a goal of at least one commit per week.',
        'Update your existing projects to show ongoing maintenance.',
      ]
    },
    {
      dimension: 'Community', score: breakdown.community, max: 15,
      icon: '👥', color: 'text-rose', bgColor: 'bg-rose-light',
      tips: [
        'Engage with other developers — follow, star, and contribute.',
        'Open issues and PRs on repos you use.',
        'Share your knowledge by writing documentation or blog posts.',
      ]
    },
  ];

  return dims
    .map(d => {
      const percentage = (d.score / d.max) * 100;
      const priority = percentage < 40 ? 'high' : percentage < 70 ? 'medium' : 'low';
      const tipIndex = Math.min(Math.floor((1 - percentage / 100) * d.tips.length), d.tips.length - 1);
      return {
        ...d,
        percentage,
        priority,
        tip: d.tips[Math.max(0, tipIndex)],
      } as SuggestionItem;
    })
    .sort((a, b) => a.percentage - b.percentage);
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    high: 'bg-rose-light text-rose',
    medium: 'bg-amber-light text-amber',
    low: 'bg-sage-light text-sage',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[priority as keyof typeof styles]}`}>
      {priority}
    </span>
  );
}

export function ImprovementSuggestions({ breakdown }: { breakdown: Breakdown }) {
  const suggestions = getSuggestions(breakdown);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber" />
        <h3 className="text-sm font-semibold text-ink tracking-wide uppercase">
          Improvement Suggestions
        </h3>
      </div>

      {suggestions.map((s, i) => (
        <motion.div
          key={s.dimension}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.08 }}
          className="soft-card rounded-xl p-4 flex items-start gap-3.5 group hover:shadow-md transition-shadow duration-300"
        >
          <div className={`w-9 h-9 rounded-lg ${s.bgColor} flex items-center justify-center flex-shrink-0 text-base`}>
            {s.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-ink">{s.dimension}</span>
              <span className="text-xs text-ink-faint">{s.score}/{s.max}</span>
              <PriorityBadge priority={s.priority} />
            </div>
            <p className="text-[13px] text-ink-light leading-relaxed">{s.tip}</p>
          </div>
          {s.priority === 'high' ? (
            <AlertCircle className="w-4 h-4 text-rose flex-shrink-0 mt-0.5" />
          ) : s.priority === 'low' ? (
            <CheckCircle className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
          ) : (
            <TrendingUp className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
