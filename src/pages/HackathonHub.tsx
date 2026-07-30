import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Rocket, Code, Clock, ExternalLink, Send, Sparkles, ShieldCheck, Loader2, Award } from 'lucide-react';
import { supabase } from '../services/supabase';
import axios from 'axios';
import type { Profile, HackathonSubmission } from '../types';
import { GithubIcon } from '../components/BrandIcons';
import { OneClickHireModal } from '../components/OneClickHireModal';

interface HackathonItem {
  id: string;
  title: string;
  sponsor: string;
  prize_pool: string;
  deadline: string;
  status: 'active' | 'upcoming' | 'completed';
  tags: string[];
}

const SAMPLE_HACKATHONS: HackathonItem[] = [
  {
    id: 'hack_ai_agents',
    title: 'Codeprint Global Autonomous Agents Buildathon',
    sponsor: 'Google Cloud & Codeprint Enterprise',
    prize_pool: '$25,000 + Direct Executive Interviews',
    deadline: '2026-08-15',
    status: 'active',
    tags: ['AI Agents', 'LLMs', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 'hack_web_systems',
    title: 'High-Velocity Distributed Systems Challenge',
    sponsor: 'Enterprise FinTech Foundation',
    prize_pool: '$15,000 + VIP Hiring Track',
    deadline: '2026-09-01',
    status: 'active',
    tags: ['Microservices', 'Node.js', 'Distributed DBs']
  }
];

interface LeaderboardEntry extends HackathonSubmission {
  student?: Profile;
  computed_rank_score?: number;
}

export function HackathonHub() {
  const [activeHackathon, setActiveHackathon] = useState<HackathonItem>(SAMPLE_HACKATHONS[0]);
  const [submissions, setSubmissions] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  // Dynamic Weighting Sliders (for Recruiter Leaderboard)
  const [weightInnovation, setWeightInnovation] = useState<number>(40);
  const [weightComplexity, setWeightComplexity] = useState<number>(35);
  const [weightFreshness, setWeightFreshness] = useState<number>(25);

  // Submission Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/developer/ai-agent-project');
  const [demoUrl, setDemoUrl] = useState('https://codeprint.dev/demo/ai-agent');
  const [description, setDescription] = useState('An autonomous multi-agent engineering workflow powered by verified Git commits.');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  // One-Click Hire State
  const [hiringCandidate, setHiringCandidate] = useState<Profile | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadLeaderboard();
  }, [activeHackathon]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setUserProfile(data as Profile);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hackathons/${activeHackathon.id}/leaderboard`);
      if (res.data?.leaderboard) {
        setSubmissions(res.data.leaderboard);
      }
    } catch {
      // Fallback sample verified leaderboard if endpoint offline or empty
      setSubmissions([
        {
          id: 'sub_1',
          hackathon_id: activeHackathon.id,
          student_id: 'stud_1',
          project_title: 'Agentic SQL Profiler & Shield',
          repository_url: 'https://github.com/varad/sql-profiler',
          demo_url: 'https://demo.codeprint.dev',
          innovation_score: 95,
          complexity_score: 91,
          freshness_score: 98,
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          student: {
            id: 'stud_1',
            email: 'varad@codeprint.dev',
            full_name: 'Varad Chaudhari',
            college: 'IIT Bombay',
            talent_score: 96,
            github_username: 'VARAD1712',
            role: 'student'
          }
        },
        {
          id: 'sub_2',
          hackathon_id: activeHackathon.id,
          student_id: 'stud_2',
          project_title: 'Distributed State Machine ATS',
          repository_url: 'https://github.com/alex/ats-engine',
          innovation_score: 88,
          complexity_score: 94,
          freshness_score: 89,
          submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          student: {
            id: 'stud_2',
            email: 'alex@codeprint.dev',
            full_name: 'Alex Rivera',
            college: 'BITS Pilani',
            talent_score: 91,
            github_username: 'alex-dev',
            role: 'student'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic ranking calculation based on interactive recruiter sliders
  const rankedLeaderboard = useMemo(() => {
    const totalWeight = weightInnovation + weightComplexity + weightFreshness || 100;
    return [...submissions].map(sub => {
      const inn = sub.innovation_score || 85;
      const cmp = sub.complexity_score || 85;
      const frs = sub.freshness_score || 85;
      const compScore = (inn * (weightInnovation / totalWeight)) +
                        (cmp * (weightComplexity / totalWeight)) +
                        (frs * (weightFreshness / totalWeight));
      return { ...sub, computed_rank_score: Math.round(compScore * 10) / 10 };
    }).sort((a, b) => (b.computed_rank_score || 0) - (a.computed_rank_score || 0));
  }, [submissions, weightInnovation, weightComplexity, weightFreshness]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !repoUrl.trim()) return;
    setSubmitting(true);
    setSubmitMsg(null);

    try {
      await axios.post('/api/hackathons/submit', {
        hackathon_id: activeHackathon.id,
        student_id: userProfile?.id || 'stud_demo_user',
        project_title: projectTitle,
        repository_url: repoUrl,
        demo_url: demoUrl,
        description
      });
      setSubmitMsg('🚀 Project submitted successfully! Real-time AI complexity and freshness validation updated your central Candidate Object score.');
      setShowSubmitModal(false);
      loadLeaderboard();
    } catch (err: any) {
      setSubmitMsg('⚠️ ' + (err?.response?.data?.error || 'Submission failed. Please check repository URL validity.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 relative animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-ink via-deep-graphite to-ink rounded-3xl p-8 shadow-2xl text-white border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-sage/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage/20 border border-sage/40 text-sage text-xs font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" /> Hackathon-to-Hiring Authority
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Build Projects. Verify Git Cadence. Get Directly Hired.
          </h1>
          <p className="text-sm text-white/75 leading-relaxed font-medium">
            Codeprint connects active developer contributions directly to recruiter AI discovery engines. Submit your repository for automated complexity grading and climb the dynamic leaderboard.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sage to-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sage/30 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" /> Submit Your Project Repo
            </button>
            <span className="text-xs font-bold text-sage-light flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated AI Code Complexity Scoring Enabled
            </span>
          </div>
        </div>
      </div>

      {submitMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> {submitMsg}</span>
          <button onClick={() => setSubmitMsg(null)} className="font-bold text-emerald-800">✕</button>
        </div>
      )}

      {/* Active Hackathons Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAMPLE_HACKATHONS.map((h) => {
          const isSelected = h.id === activeHackathon.id;
          return (
            <div
              key={h.id}
              onClick={() => setActiveHackathon(h)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected ? 'bg-white border-sage shadow-md ring-2 ring-sage/20' : 'bg-cream/40 hover:bg-cream border-border-soft opacity-85 hover:opacity-100'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase rounded-full">
                    ● {h.status} challenge
                  </span>
                  <span className="text-xs font-bold text-ink-light flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sage" /> Due {h.deadline}
                  </span>
                </div>
                <h3 className="text-lg font-black text-ink tracking-tight">{h.title}</h3>
                <p className="text-xs font-extrabold text-sage-dark">{h.sponsor}</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {h.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-cream-dark text-ink text-[10px] font-extrabold rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-border-soft flex items-center justify-between">
                <span className="text-xs font-black text-ink">🏆 Prize: {h.prize_pool}</span>
                <span className="text-xs font-extrabold text-sage flex items-center gap-1">
                  View Leaderboard →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recruiter Dynamic Leaderboard Section */}
      <div className="bg-white rounded-3xl border border-border-soft p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-soft">
          <div>
            <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" /> Real-Time Hackathon Leaderboard
            </h2>
            <p className="text-xs text-ink-light mt-1">
              Recruiter evaluation engine: Adjust scoring weight sliders below to re-rank candidates based on your enterprise hiring priorities.
            </p>
          </div>

          {/* Sliders Box */}
          <div className="bg-cream p-5 rounded-2xl border border-border-soft grid grid-cols-1 md:grid-cols-3 gap-6 lg:w-[580px] shrink-0">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-ink mb-1">
                <span className="flex items-center gap-1"><Rocket className="w-3 h-3 text-purple-600" /> Innovation</span>
                <span className="text-sage font-black">{weightInnovation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightInnovation}
                onChange={e => setWeightInnovation(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-border-soft rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-ink mb-1">
                <span className="flex items-center gap-1"><Code className="w-3 h-3 text-sky" /> Complexity</span>
                <span className="text-sage font-black">{weightComplexity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightComplexity}
                onChange={e => setWeightComplexity(Number(e.target.value))}
                className="w-full accent-sky h-1.5 bg-border-soft rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-ink mb-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-600" /> Freshness</span>
                <span className="text-sage font-black">{weightFreshness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightFreshness}
                onChange={e => setWeightFreshness(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-border-soft rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : rankedLeaderboard.length === 0 ? (
          <div className="py-16 text-center text-ink-faint text-xs font-bold">
            No projects submitted to this challenge yet. Be the first to deploy!
          </div>
        ) : (
          <div className="space-y-3">
            {rankedLeaderboard.map((entry, idx) => {
              const std = entry.student;
              const rankColor = idx === 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : idx === 1 ? 'bg-slate-200 text-slate-800 border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-950 border-orange-300' : 'bg-cream text-ink-faint border-border-soft';

              return (
                <motion.div
                  key={entry.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-2xl border border-border-soft hover:border-sage bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center border shrink-0 ${rankColor}`}>
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-ink text-base truncate flex items-center gap-2">
                        {entry.project_title}
                        <a href={entry.repository_url} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-ink transition-colors">
                          <GithubIcon className="w-4 h-4" />
                        </a>
                        {entry.demo_url && (
                          <a href={entry.demo_url} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-sage transition-colors text-xs flex items-center gap-0.5 font-bold">
                            Live Demo <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </h4>
                      <p className="text-xs text-ink-light font-semibold truncate">
                        Built by <strong className="text-ink font-bold">{std?.full_name || 'Verified Developer'}</strong> ({std?.college || 'Codeprint Fellow'})
                      </p>
                    </div>
                  </div>

                  {/* Score metrics & Hire Action */}
                  <div className="flex flex-wrap items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="flex items-center gap-3 bg-cream px-4 py-2 rounded-xl border border-border-soft text-xs font-bold">
                      <div title="Innovation" className="text-purple-700">Innov: <strong>{entry.innovation_score || 88}</strong></div>
                      <span className="text-border-soft">|</span>
                      <div title="Complexity" className="text-sky">Compl: <strong>{entry.complexity_score || 89}</strong></div>
                      <span className="text-border-soft">|</span>
                      <div title="Freshness" className="text-emerald-700">Fresh: <strong>{entry.freshness_score || 93}</strong></div>
                    </div>

                    <div className="text-center px-4 py-2 bg-cream-dark rounded-xl border border-border-soft shrink-0">
                      <div className="text-xl font-black text-sage leading-tight">{entry.computed_rank_score}</div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-ink-faint">Weighted Score</div>
                    </div>

                    {std && (
                      <button
                        onClick={() => setHiringCandidate(std)}
                        className="px-5 py-2.5 bg-gradient-to-r from-sage to-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        ⚡ VIP Direct Hire
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-border-soft max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-soft">
                <div>
                  <h3 className="text-lg font-black text-ink">Submit Hackathon Repository</h3>
                  <p className="text-xs text-ink-light">Auto-verifies Git commits and links directly to your candidate profile</p>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="text-ink-faint hover:text-ink font-extrabold">✕</button>
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autonomous SQL Profiler"
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">GitHub Repository URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage font-mono"
                  />
                  <span className="text-[10px] font-bold text-emerald-700 mt-1 block">✓ AI will compute complexity & freshness automatically</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://your-demo.vercel.app"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Project Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-border-soft font-extrabold text-xs text-ink hover:bg-cream transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sage to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Direct Hire Modal from Leaderboard */}
      {hiringCandidate && (
        <OneClickHireModal
          candidate={hiringCandidate}
          onClose={() => setHiringCandidate(null)}
          onSuccess={() => setHiringCandidate(null)}
        />
      )}
    </div>
  );
}
