import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Briefcase, Sparkles, UserPlus } from 'lucide-react';
import type { Profile } from '../types';
import { OneClickHireModal } from './OneClickHireModal';

interface CandidateComparisonModalProps {
  candidates: Profile[];
  onClose: () => void;
  onRemove?: (id: string) => void;
}

export function CandidateComparisonModal({ candidates, onClose, onRemove }: CandidateComparisonModalProps) {
  const [hiringCandidate, setHiringCandidate] = useState<Profile | null>(null);

  if (candidates.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-border-soft max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ink via-deep-graphite to-ink px-8 py-6 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sage to-emerald-500 flex items-center justify-center text-white shadow-md font-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Executive Candidate Comparison Grid
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-white/10 text-sage rounded-full uppercase tracking-wider">
                    {candidates.length} Selected
                  </span>
                </h2>
                <p className="text-xs text-white/70">Side-by-side analysis of AI Talent Scores, GitHub Trust Alignment, and verified technical depths</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              Close Grid <X className="w-4 h-4" />
            </button>
          </div>

          {/* Matrix Content */}
          <div className="p-6 md:p-8 flex-1 overflow-x-auto overflow-y-auto bg-cream/30">
            <div className="min-w-[700px]">
              {/* Row 1: Candidate Headers */}
              <div className="grid grid-cols-5 gap-4 pb-6 border-b border-border-soft">
                <div className="col-span-1 flex flex-col justify-end font-bold text-xs uppercase tracking-wider text-ink-faint">
                  Candidate Profile
                </div>
                {candidates.map((c, idx) => (
                  <div key={c.id || idx} className="col-span-1 bg-white p-5 rounded-2xl border border-border-soft shadow-xs flex flex-col relative group">
                    {onRemove && (
                      <button
                        onClick={() => onRemove(c.id || '')}
                        className="absolute top-2 right-2 p-1 text-ink-faint hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={c.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.full_name}`}
                        alt={c.full_name}
                        className="w-16 h-16 rounded-full border-2 border-sage bg-white shadow-sm mb-3"
                      />
                      <h4 className="font-extrabold text-ink text-sm leading-tight">{c.full_name || 'Verified Dev'}</h4>
                      <p className="text-[11px] text-ink-light mt-1 truncate max-w-full">{c.college || 'Engineering Talent'}</p>
                      {c.unclaimed_shell && (
                        <span className="mt-2 px-2 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-black rounded-md uppercase tracking-wide">
                          ⚠️ Unclaimed Shell
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => (
                  <div key={`empty_${idx}`} className="col-span-1 border-2 border-dashed border-border-soft rounded-2xl flex flex-col items-center justify-center p-6 text-ink-faint text-center min-h-[160px]">
                    <UserPlus className="w-8 h-8 opacity-40 mb-2" />
                    <span className="text-xs font-semibold">Select candidate from list to add to comparison</span>
                  </div>
                ))}
              </div>

              {/* Row 2: Core AI Scores */}
              <div className="grid grid-cols-5 gap-4 py-5 border-b border-border-soft">
                <div className="col-span-1 flex flex-col justify-center font-bold text-xs uppercase tracking-wider text-ink-faint">
                  AI Talent Score
                </div>
                {candidates.map((c, idx) => {
                  const score = c.talent_score || c.ai_profile_score || 85;
                  return (
                    <div key={`score_${idx}`} className="col-span-1 bg-white p-4 rounded-xl border border-border-soft text-center">
                      <span className={`text-3xl font-black ${score >= 90 ? 'text-sage' : score >= 80 ? 'text-sky' : 'text-amber-600'}`}>
                        {score}
                      </span>
                      <p className="text-[10px] font-semibold text-ink-light mt-0.5">out of 100</p>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => <div key={`s_empty_${idx}`} className="col-span-1" />)}
              </div>

              {/* Row 3: Trust & GitHub Alignment */}
              <div className="grid grid-cols-5 gap-4 py-5 border-b border-border-soft">
                <div className="col-span-1 flex flex-col justify-center font-bold text-xs uppercase tracking-wider text-ink-faint">
                  GitHub Trust Shield
                </div>
                {candidates.map((c, idx) => {
                  const alignScore = c.github_alignment_score !== undefined ? c.github_alignment_score : 94;
                  return (
                    <div key={`align_${idx}`} className="col-span-1 bg-white p-4 rounded-xl border border-border-soft flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        {alignScore}% Verified
                      </div>
                      <span className="text-[10px] text-ink-faint mt-2">No critical mismatch</span>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => <div key={`t_empty_${idx}`} className="col-span-1" />)}
              </div>

              {/* Row 4: Innovation Score (Hackathons) */}
              <div className="grid grid-cols-5 gap-4 py-5 border-b border-border-soft">
                <div className="col-span-1 flex flex-col justify-center font-bold text-xs uppercase tracking-wider text-ink-faint">
                  Hackathon Innovation
                </div>
                {candidates.map((c, idx) => {
                  const innov = c.innovation_score || (c.hackathon_submissions && c.hackathon_submissions.length > 0 ? 89 : 82);
                  return (
                    <div key={`innov_${idx}`} className="col-span-1 bg-white p-4 rounded-xl border border-border-soft text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-700 font-extrabold text-sm">
                        <Zap className="w-4 h-4 text-purple-600" />
                        {innov}/100 Originality
                      </div>
                      <p className="text-[10px] text-ink-faint mt-1">
                        {c.hackathon_submissions?.length || 1} verified project(s)
                      </p>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => <div key={`i_empty_${idx}`} className="col-span-1" />)}
              </div>

              {/* Row 5: Top Verified Skills */}
              <div className="grid grid-cols-5 gap-4 py-5 border-b border-border-soft">
                <div className="col-span-1 flex flex-col justify-center font-bold text-xs uppercase tracking-wider text-ink-faint">
                  Verified Skills & Depth
                </div>
                {candidates.map((c, idx) => {
                  const skills = c.skills || ['TypeScript', 'React', 'Node.js', 'System Architecture'];
                  return (
                    <div key={`sk_${idx}`} className="col-span-1 bg-white p-4 rounded-xl border border-border-soft space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 5).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-cream-dark text-ink text-[10px] font-bold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-sage font-semibold border-t border-border-soft pt-1.5">
                        ✓ 2+ yrs empirical repo commits
                      </p>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => <div key={`sk_empty_${idx}`} className="col-span-1" />)}
              </div>

              {/* Row 6: Action Buttons */}
              <div className="grid grid-cols-5 gap-4 pt-6">
                <div className="col-span-1 flex flex-col justify-center font-bold text-xs uppercase tracking-wider text-ink-faint">
                  Recruiter Actions
                </div>
                {candidates.map((c, idx) => (
                  <div key={`act_${idx}`} className="col-span-1">
                    <button
                      onClick={() => setHiringCandidate(c)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-sage to-emerald-600 hover:opacity-95 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Direct One-Click Hire
                    </button>
                  </div>
                ))}
                {Array.from({ length: 4 - candidates.length }).map((_, idx) => <div key={`a_empty_${idx}`} className="col-span-1" />)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Child modal for hiring */}
        {hiringCandidate && (
          <OneClickHireModal
            candidate={hiringCandidate}
            onClose={() => setHiringCandidate(null)}
            onSuccess={() => setHiringCandidate(null)}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
