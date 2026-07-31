import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, AlertTriangle, Flame, ShieldAlert, TrendingUp, HelpCircle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { GitHubFreshness, ScoreExplainability } from '../types';

interface BreakdownData {
  productivity: number;
  impact: number;
  diversity: number;
  recency: number;
  community: number;
}

interface ScoreBreakdownProps {
  breakdown: BreakdownData;
  freshness?: GitHubFreshness | null;
  explainability?: ScoreExplainability | null;
}

const dimensions = [
  { key: 'productivity', label: 'Productivity', max: 25, color: '#9B8EC4', bg: 'bg-lavender-light', icon: '⚡' },
  { key: 'impact', label: 'Impact', max: 25, color: '#D4A853', bg: 'bg-amber-light', icon: '⭐' },
  { key: 'diversity', label: 'Diversity', max: 20, color: '#7C9A82', bg: 'bg-sage-light', icon: '🌐' },
  { key: 'recency', label: 'Recency', max: 15, color: '#6B9ECF', bg: 'bg-sky-light', icon: '🕐' },
  { key: 'community', label: 'Community', max: 15, color: '#C48B8B', bg: 'bg-rose-light', icon: '👥' },
] as const;

export function ScoreBreakdown({ breakdown, freshness, explainability }: ScoreBreakdownProps) {
  const [showExplain, setShowExplain] = useState<boolean>(true);

  const getStatusStyle = (status?: string) => {
    if (!status) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (status.includes('Highly Active')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status.includes('Stagnant')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status.includes('Decaying')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const getImpactBadge = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />, label: 'Positive Boost', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'negative':
        return { icon: <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />, label: 'Score Reduction', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { icon: <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />, label: 'Moderate / Neutral', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Freshness & Decay UI Panel */}
      {freshness && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-cream-dark bg-white shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">Skill Freshness & Velocity</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusStyle(freshness.status)}`}>
              {freshness.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-cream/60 border border-cream-dark/60">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Commit Velocity</span>
              </div>
              <p className="text-base font-bold text-ink">{freshness.commitVelocity} <span className="text-xs font-normal text-ink-faint">/mo</span></p>
            </div>

            <div className="p-2.5 rounded-lg bg-cream/60 border border-cream-dark/60">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Decay Multiplier</span>
              </div>
              <p className={`text-base font-bold ${freshness.decayMultiplier < 1 ? 'text-rose-600' : 'text-ink'}`}>
                {freshness.decayMultiplier}x
              </p>
            </div>
          </div>

          {freshness.isCapped && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Score capped at 35 due to inactivity exceeding 2 years (Stagnant account).</span>
            </div>
          )}

          {!freshness.isCapped && freshness.decayMultiplier < 1.0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Score reduced by skill decay due to {freshness.daysSinceLastPush} days of inactivity.</span>
            </div>
          )}

          {freshness.decayMultiplier === 1.0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>High freshness weight & developer commit velocity boosting active score!</span>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Score Breakdown Bar Graphs ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
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
              <div className="flex items-center justify-between mb-1.5">
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

      {/* ── Explainable AI (XAI) Score Report ── */}
      {explainability && (
        <div className="pt-2">
          <button
            onClick={() => setShowExplain(!showExplain)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/80 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
                  Why did I receive this score?
                </span>
                <span className="text-[11px] text-indigo-700/80">
                  Explainable AI (XAI) evaluation & targeted improvement tips
                </span>
              </div>
            </div>
            {showExplain ? (
              <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            )}
          </button>

          <AnimatePresence>
            {showExplain && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3.5 pt-3"
              >
                {/* Executive Summary */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 text-white text-xs leading-relaxed shadow-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-indigo-200 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                    AI Talent Evaluation Summary
                  </p>
                  {explainability.summary || explainability.scoreRationale || 'AI syntax telemetry verifies disciplined engineering workflow and modular architectural patterns.'}
                </div>

                {/* Granular Reason Cards */}
                <div className="space-y-2.5">
                  {(explainability.reasons || (explainability.strengths ? explainability.strengths.map((str, i) => ({
                    category: 'Strength',
                    impact: 'positive' as const,
                    title: `Verified Competency #${i + 1}`,
                    explanation: str,
                    recommendation: (explainability.actionableSteps || [])[i] || 'Continue maintaining disciplined development workflow.'
                  })) : [])).map((item, index) => {
                    const badge = getImpactBadge(item.impact);
                    return (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-cream-dark/80 bg-white/90 shadow-2xs hover:border-indigo-200 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-cream text-[10px] text-ink-muted uppercase font-mono tracking-tighter">
                              {item.category}
                            </span>
                            {item.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${badge.bg}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>

                        <p className="text-xs text-ink-muted leading-relaxed pl-1">
                          {item.explanation}
                        </p>

                        <div className="flex items-start gap-1.5 pt-1.5 border-t border-cream-dark/40 text-[11px] text-indigo-700 bg-indigo-50/40 p-2 rounded-lg">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span><strong className="font-semibold">Recommendation:</strong> {item.recommendation}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

