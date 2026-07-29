'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/UI/Primitives';
import { HelpCircle, ArrowUpRight, TrendingUp, Layers, Activity } from 'lucide-react';

interface InnovationGaugeProps {
  score: number; // 0 - 100 (0 means not evaluated yet)
  status?: string;
  onValidateIdea?: () => void;
  isLoading?: boolean;
  recommendations?: { title: string; detail: string; impact: string }[];
}

export const InnovationGauge: React.FC<InnovationGaugeProps> = ({
  score = 0,
  status = 'UNEVALUATED',
  onValidateIdea,
  isLoading = false,
  recommendations = [],
}) => {
  // SVG Radial Gauge Mathematics
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const displayScore = score > 0 ? score : 0;
  const offset = circumference - (displayScore / 100) * (circumference * 0.75); // 270 deg arc

  const getScoreColor = (s: number) => {
    if (s === 0) return '#64748b'; // Slate/Gray for non-evaluated
    if (s >= 80) return '#34d399'; // Emerald
    if (s >= 65) return '#60a5fa'; // Blue
    return '#f87171'; // Red/Orange for low or brief
  };

  const scoreColor = getScoreColor(displayScore);
  const scoreLabel =
    displayScore === 0
      ? 'Awaiting AI Evaluation'
      : displayScore >= 80
      ? 'High Architectural Novelty'
      : displayScore >= 65
      ? 'Solid Academic Engineering'
      : 'Requires Technical Rigor';

  return (
    <Card className="flex flex-col justify-between h-full bg-slate-900 border-slate-800 text-slate-100">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">AI Architectural Appraisal</h3>
          </div>
          <Badge variant={displayScore >= 80 ? 'success' : displayScore === 0 ? 'slate' : 'blue'}>
            {displayScore === 0 ? 'UNAPPRAISED' : status}
          </Badge>
        </div>

        {/* Gauge & Metrics Centerpiece */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-[135deg]" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={scoreColor}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center mt-3">
              <span className="text-4xl font-extrabold tracking-tight font-mono" style={{ color: scoreColor }}>
                {displayScore > 0 ? displayScore : '--'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Originality Score</span>
            </div>
          </div>

          <div className="space-y-3 flex-1 max-w-xs text-left">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Appraisal Status</h4>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">{scoreLabel}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {displayScore === 0
                ? 'Submit your customized problem statement and technology stack below to compute algorithmic novelty and architecture recommendations.'
                : 'Evaluation derived from semantic term density, architecture patterns, and domain complexity analysis.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onValidateIdea}
              isLoading={isLoading}
              className="w-full text-xs"
            >
              {displayScore === 0 ? 'Run AI Evaluation Now' : 'Re-Appraise Project Architecture'}
            </Button>
          </div>
        </div>

        {/* Tailored AI Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-400" /> Actionable Architectural Advice ({recommendations.length})
            </h4>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-left text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{rec.title}</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800 shrink-0">
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
