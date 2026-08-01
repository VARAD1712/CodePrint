import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Code, Clock, ExternalLink, Send, Sparkles, ShieldCheck, Loader2, Award } from 'lucide-react';
import { supabase } from '../services/supabase';
import axios from 'axios';
import type { Profile, LeaderboardEntry } from '../types';
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
    prize_pool: '₹20,00,000 + Direct Executive Interviews',
    deadline: '2026-08-15',
    status: 'active',
    tags: ['AI Agents', 'LLMs', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 'hack_web_systems',
    title: 'High-Velocity Distributed Systems Challenge',
    sponsor: 'Enterprise FinTech Foundation',
    prize_pool: '₹12,00,000 + VIP Hiring Track',
    deadline: '2026-09-01',
    status: 'active',
    tags: ['Microservices', 'Node.js', 'Distributed DBs']
  }
];

interface HackathonHubProps {
  role?: 'student' | 'company';
}

export function HackathonHub({ role = 'student' }: HackathonHubProps) {
  const [activeHackathon, setActiveHackathon] = useState<HackathonItem>(SAMPLE_HACKATHONS[0]);
  const [submissions, setSubmissions] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  // Recruiter Leaderboard sliders
  const [weightInnovation, setWeightInnovation] = useState<number>(40);
  const [weightComplexity, setWeightComplexity] = useState<number>(35);
  const [weightFreshness, setWeightFreshness] = useState<number>(25);

  // Project Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/developer/ai-agent-project');
  const [demoUrl, setDemoUrl] = useState('https://codeprint.dev/demo/ai-agent');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  // Certificate Upload State (Student Side)
  const [showCertModal, setShowCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certEventName, setCertEventName] = useState('');
  const [certRole, setCertRole] = useState('Team Lead / Full Stack Developer');
  const [certPlacement, setCertPlacement] = useState('1st Place / Winner');
  const [certDesc, setCertDesc] = useState('');
  const [certSkills, setCertSkills] = useState('React, Node.js, AI');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  // One-Click Hire State
  const [hiringCandidate, setHiringCandidate] = useState<Profile | null>(null);

  const loadCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUserProfile(data as Profile);
        if (data.hackathon_achievements) {
          setCertificates(data.hackathon_achievements);
        }
      }
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hackathons/${activeHackathon.id}/leaderboard`);
      if (res.data?.leaderboard) {
        setSubmissions(res.data.leaderboard);
      }
    } catch {
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeHackathon.id]);

  useEffect(() => {
    loadCurrentUser();
    if (role === 'company') {
      loadLeaderboard();
    } else {
      setLoading(false);
    }
  }, [activeHackathon, role, loadCurrentUser, loadLeaderboard]);

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certEventName.trim()) return;
    setUploadingCert(true);
    setSubmitMsg(null);

    let uploadedUrl = '';
    if (certFile) {
      try {
        const fileExt = certFile.name.split('.').pop();
        const fileName = `${userProfile?.id || 'anon'}_${Date.now()}.${fileExt}`;
        const { data } = await supabase.storage.from('certificates').upload(fileName, certFile);
        if (data) {
          const { data: publicData } = supabase.storage.from('certificates').getPublicUrl(fileName);
          uploadedUrl = publicData.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback:', err);
      }
    }

    try {
      const res = await axios.post('/api/hackathons/certificates', {
        studentId: userProfile?.id || 'stud_demo',
        title: certTitle,
        eventName: certEventName,
        role: certRole,
        placement: certPlacement,
        description: certDesc,
        skills: certSkills,
        certificateUrl: uploadedUrl
      });

      if (res.data?.achievement) {
        setCertificates(prev => [res.data.achievement, ...prev]);
        setSubmitMsg('🏆 Certificate uploaded! AI Credibility Engine verified authenticity (' + res.data.achievement.ai_credibility_score + '% score) and awarded bonus points.');
      }
      setShowCertModal(false);
      setCertTitle('');
      setCertEventName('');
      setCertDesc('');
      setCertFile(null);
    } catch (err: any) {
      setSubmitMsg('⚠️ ' + (err?.response?.data?.error || 'Certificate upload failed.'));
    } finally {
      setUploadingCert(false);
    }
  };

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
      setSubmitMsg('🚀 Project submitted successfully! Real-time AI complexity and freshness validation updated your candidate score.');
      setShowSubmitModal(false);
      if (role === 'company') loadLeaderboard();
    } catch (err: any) {
      setSubmitMsg('⚠️ ' + (err?.response?.data?.error || 'Submission failed.'));
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-8 pb-24 relative animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-neutral-900 rounded-2xl p-8 text-white border border-neutral-800 relative">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-semibold">
            <span>Competitive Achievements & Credibility Verification</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {role === 'company' ? 'Candidate Leaderboard & Assessments' : 'Competitive Achievements & Certifications'}
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {role === 'company' 
              ? 'Evaluate technical contest submissions via dynamic quantitative criteria weighting across complexity, innovation, and code freshness.'
              : 'Submit repository links and achievement credentials for automated credibility analysis and verified profile integration.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-neutral-100 text-neutral-900 font-semibold text-xs rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <span>Submit Repository Artifact</span>
            </button>
            {role === 'student' && (
              <button
                onClick={() => setShowCertModal(true)}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Upload Certificate Record</span>
              </button>
            )}
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Student View: Verified Certificates List */}
      {role === 'student' && (
        <div className="bg-white rounded-3xl border border-border-soft p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" /> Uploaded Hackathon Certificates
              </h2>
              <p className="text-xs text-ink-light mt-1">
                Your certificates analyzed by AI Credibility Engine
              </p>
            </div>
            <button
              onClick={() => setShowCertModal(true)}
              className="px-5 py-2.5 bg-ink text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-ink/90"
            >
              <Award className="w-4 h-4 text-amber-400" /> Upload New Certificate
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="py-12 text-center text-ink-faint text-xs font-bold border-2 border-dashed border-border-soft rounded-2xl">
              No certificates uploaded yet. Click above to upload your hackathon certificates and get AI verified!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl border border-border-soft bg-cream/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-full">
                        {cert.placement}
                      </span>
                      <h3 className="font-extrabold text-ink text-base mt-1">{cert.title}</h3>
                      <p className="text-xs text-ink-light font-bold">{cert.event_name} • {cert.date}</p>
                    </div>
                    {cert.ai_verified && (
                      <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <ShieldCheck className="w-4 h-4" /> {cert.ai_credibility_score}% AI Verified
                      </div>
                    )}
                  </div>
                  {cert.description && (
                    <p className="text-xs text-ink-light leading-relaxed">{cert.description}</p>
                  )}
                  {cert.ai_feedback && (
                    <div className="p-3 bg-white rounded-xl border border-border-soft text-xs text-ink-light font-medium">
                      💡 {cert.ai_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recruiter Leaderboard Section — Only visible to Company role */}
      {role === 'company' && (
        <div className="bg-white rounded-3xl border border-border-soft p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-soft">
            <div>
              <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" /> Candidate Hackathon Leaderboard
              </h2>
              <p className="text-xs text-ink-light mt-1">
                Recruiter evaluation engine: Adjust scoring weight sliders below to re-rank candidates based on your hiring priorities.
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
              No project submissions found for this challenge yet.
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
                          className="px-5 py-2.5 bg-gradient-to-r from-sage to-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
      )}

      {/* Certificate Upload Modal (Student Side) */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-border-soft max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-soft">
                <div>
                  <h3 className="text-lg font-black text-ink">Upload Hackathon Certificate</h3>
                  <p className="text-xs text-ink-light">Analyzed by AI Credibility Engine and stored in Supabase</p>
                </div>
                <button onClick={() => setShowCertModal(false)} className="text-ink-faint hover:text-ink font-extrabold">✕</button>
              </div>

              <form onSubmit={handleUploadCertificate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Achievement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place Winner — Autonomous Agents Hackathon"
                    value={certTitle}
                    onChange={e => setCertTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Hackathon Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global AI Agent Hackathon 2026"
                    value={certEventName}
                    onChange={e => setCertEventName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Role / Position</label>
                    <input
                      type="text"
                      value={certRole}
                      onChange={e => setCertRole(e.target.value)}
                      className="w-full px-3 py-2 bg-cream border border-border-soft rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Placement / Rank</label>
                    <input
                      type="text"
                      value={certPlacement}
                      onChange={e => setCertPlacement(e.target.value)}
                      className="w-full px-3 py-2 bg-cream border border-border-soft rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Key Skills Used</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Python, LLMs"
                    value={certSkills}
                    onChange={e => setCertSkills(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Upload Certificate File (PDF / Image)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={e => setCertFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-ink-light file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sage file:text-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">Description / Project Detail</label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of the winning project or hackathon challenge solved..."
                    value={certDesc}
                    onChange={e => setCertDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream border border-border-soft rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => setShowCertModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-border-soft font-extrabold text-xs text-ink hover:bg-cream transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingCert}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sage to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    Upload & AI Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Submission Modal */}
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sage to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
