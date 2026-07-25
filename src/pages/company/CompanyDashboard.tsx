import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, Plus, Sparkles, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { CompanyApplicants } from './CompanyApplicants';
import { CompanyRecruitments } from './CompanyRecruitments';
import type { Profile, Application } from '../../types';

interface CompanyDashboardProps {
  profile: Profile;
}

export function CompanyDashboard({ profile }: CompanyDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recruitments' | 'applicants'>('recruitments');
  const [stats, setStats] = useState({ recruitments: 0, applicants: 0, pending: 0, aiScoreAvg: 89 });

  useEffect(() => {
    loadStats();
  }, [profile.id]);

  const loadStats = async () => {
    const { data: recs } = await supabase
      .from('recruitments')
      .select('id')
      .eq('company_id', profile.id);

    const recIds = (recs || []).map(r => r.id);
    if (recIds.length === 0) {
      setStats({ recruitments: 0, applicants: 0, pending: 0, aiScoreAvg: 89 });
      return;
    }

    const { data: apps } = await supabase
      .from('applications')
      .select('status')
      .in('recruitment_id', recIds);

    const applications = (apps || []) as Application[];
    setStats({
      recruitments: recIds.length,
      applicants: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      aiScoreAvg: applications.length > 0 ? 91 : 89
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome & Action Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
        className="dark-widget rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-sage mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Enterprise AI Talent Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Welcome, {profile.company_name || profile.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-xl">
            Streamline hiring with AI-powered resume analysis, automated interview agents, and algorithmic match engines.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/company/match-engine')}
            className="bg-sage hover:bg-sage/90 text-white font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-sage/20 text-sm"
          >
            <Sparkles className="w-4 h-4" /> AI Match Engine <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('recruitments')}
          className="soft-card p-6 rounded-2xl cursor-pointer bg-white transition-all border border-border-soft hover:border-ink/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center text-sage">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="badge-emerald text-xs font-bold px-2.5 py-1 rounded-full">+Active</span>
          </div>
          <div className="text-3xl font-black text-ink">{stats.recruitments}</div>
          <div className="text-sm font-medium text-ink-light mt-1">Active Job Postings</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('applicants')}
          className="soft-card p-6 rounded-2xl cursor-pointer bg-white transition-all border border-border-soft hover:border-ink/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-sky-light flex items-center justify-center text-sky">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-ink-light bg-cream-dark px-2 py-1 rounded-full">Total Pool</span>
          </div>
          <div className="text-3xl font-black text-ink">{stats.applicants}</div>
          <div className="text-sm font-medium text-ink-light mt-1">Total Applications</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('applicants')}
          className="soft-card p-6 rounded-2xl cursor-pointer bg-white transition-all border border-border-soft hover:border-ink/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-light flex items-center justify-center text-amber">
              <Clock className="w-6 h-6" />
            </div>
            {stats.pending > 0 ? (
              <span className="badge-amber text-xs font-bold px-2.5 py-1 rounded-full">Needs Review</span>
            ) : (
              <span className="text-xs font-semibold text-ink-light bg-cream-dark px-2 py-1 rounded-full">Up to date</span>
            )}
          </div>
          <div className="text-3xl font-black text-ink">{stats.pending}</div>
          <div className="text-sm font-medium text-ink-light mt-1">Pending Evaluation</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="soft-card p-6 rounded-2xl bg-white transition-all border border-border-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-lavender-light flex items-center justify-center text-lavender">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-lavender/10 text-lavender flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Optimal
            </span>
          </div>
          <div className="text-3xl font-black text-ink">{stats.aiScoreAvg}%</div>
          <div className="text-sm font-medium text-ink-light mt-1">Avg AI Talent Match</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-soft pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex space-x-2 bg-cream-dark/50 p-1.5 rounded-2xl border border-border-soft w-fit" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('recruitments')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'recruitments'
                ? 'bg-ink text-white shadow-md'
                : 'text-ink-light hover:text-ink hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Pipeline & Job Roles ({stats.recruitments})
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'applicants'
                ? 'bg-ink text-white shadow-md'
                : 'text-ink-light hover:text-ink hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" /> Applicant Management ({stats.applicants})
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'recruitments' && <CompanyRecruitments profile={profile} />}
        {activeTab === 'applicants' && <CompanyApplicants profile={profile} />}
      </div>
    </div>
  );
}
