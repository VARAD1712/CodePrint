import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Building2, Briefcase, ShieldCheck, Edit3, CheckCircle2, Award, Rocket } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { recruitmentService } from '../../services/recruitmentService';
import type { Profile, Recruitment } from '../../types';


interface CompanyPortfolioProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
}

export function CompanyPortfolio({ profile, setProfile }: CompanyPortfolioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [openJobs, setOpenJobs] = useState<Recruitment[]>([]);

  // Stored company brand portfolio
  const initialData = (profile as any).company_portfolio || (
    localStorage.getItem(`codeprint_company_portfolio_${profile.id}`)
      ? JSON.parse(localStorage.getItem(`codeprint_company_portfolio_${profile.id}`)!)
      : {
          headline: 'Pioneering the Next Generation of Autonomous AI Systems',
          mission: 'We build planetary-scale AI infrastructures, resilient machine learning pipelines, and collaborative human-AI tooling that transform global tech industries.',
          tech_stack: ['Python', 'Gemini Flash', 'Kubernetes', 'Go', 'React', 'PyTorch', 'Rust'],
          perks: ['Remote-First Globally', 'Top-Tier Health & Wellness', 'AI Hardware Budget', 'Competitive Equity Grants', 'Unlimited Learning Retreats'],
          theme: 'deepmind_indigo'
        }
  );

  const [portfolioData, setPortfolioData] = useState(initialData);
  const [newTech, setNewTech] = useState('');
  const [newPerk, setNewPerk] = useState('');

  useEffect(() => {
    loadJobs();
  }, [profile.id]);

  const loadJobs = async () => {
    const jobs = await recruitmentService.getRecruitments();
    setOpenJobs(jobs);
  };

  const handleSave = async () => {
    localStorage.setItem(`codeprint_company_portfolio_${profile.id}`, JSON.stringify(portfolioData));
    try {
      await supabase.from('profiles').update({
        company_culture: portfolioData.mission,
        company_values: portfolioData.tech_stack
      }).eq('id', profile.id);
    } catch { /* offline handling */ }

    setProfile({ ...profile, company_culture: portfolioData.mission, company_values: portfolioData.tech_stack });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
    setIsEditing(false);
  };

  const addTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.trim()) return;
    setPortfolioData({ ...portfolioData, tech_stack: [...portfolioData.tech_stack, newTech.trim()] });
    setNewTech('');
  };

  const addPerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerk.trim()) return;
    setPortfolioData({ ...portfolioData, perks: [...portfolioData.perks, newPerk.trim()] });
    setNewPerk('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border-soft shadow-md">
        <div>
          <span className="text-xs font-black bg-indigo-50 text-indigo-700 uppercase tracking-wider px-3 py-1 rounded-xl block w-fit mb-1.5 border border-indigo-200">
            Employer Brand & Tech Hub
          </span>
          <h1 className="text-2xl font-black text-ink">Company Tech & Culture Portfolio</h1>
          <p className="text-xs sm:text-sm text-ink-light font-medium mt-0.5">
            Present your engineering culture, tech stacks, and active qualification assessments directly to verified student engineers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
              isEditing ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-cream text-ink hover:bg-cream-dark'
            }`}
          >
            <Edit3 className="w-4 h-4" /> {isEditing ? 'Preview Brand Hub' : 'Customize Hub'}
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> Save to Brand Vault
          </button>
        </div>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl font-extrabold text-sm flex items-center gap-2.5 shadow-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Employer Tech Hub saved! Applicants viewing your job listings will experience your new custom branding.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-8 bg-cream/60 rounded-3xl border border-border-soft space-y-6 shadow-inner overflow-hidden"
          >
            <h3 className="font-black text-lg text-ink flex items-center gap-2 border-b border-border-soft pb-3">
              <Edit3 className="w-5 h-5 text-indigo-600" /> Employer Branding & Perks Editor
            </h3>

            <div>
              <label className="text-xs font-extrabold text-ink block mb-1">Brand Vision Headline</label>
              <input
                type="text"
                value={portfolioData.headline}
                onChange={e => setPortfolioData({ ...portfolioData, headline: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-2xl border border-border-soft text-sm font-bold text-ink shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-ink block mb-1">Engineering Mission & Tech Culture</label>
              <textarea
                rows={3}
                value={portfolioData.mission}
                onChange={e => setPortfolioData({ ...portfolioData, mission: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-2xl border border-border-soft text-sm font-semibold text-ink resize-none shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-white rounded-2xl border border-border-soft space-y-3">
                <h4 className="font-black text-xs text-ink uppercase tracking-wide flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-indigo-600" /> Core Tech Stack & Tooling
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {portfolioData.tech_stack.map((t: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-cream text-ink font-bold text-xs rounded-xl flex items-center gap-2">
                      {t}
                      <button onClick={() => setPortfolioData({ ...portfolioData, tech_stack: portfolioData.tech_stack.filter((_: any, idx: number) => idx !== i) })} className="text-rose-600 font-bold">×</button>
                    </span>
                  ))}
                </div>
                <form onSubmit={addTech} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tech (e.g. PyTorch)"
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-bold"
                  />
                  <button type="submit" className="bg-ink text-white px-3 py-1.5 rounded-xl text-xs font-bold">Add</button>
                </form>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-border-soft space-y-3">
                <h4 className="font-black text-xs text-ink uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> Engineering Perks & Benefits
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {portfolioData.perks.map((p: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-2">
                      {p}
                      <button onClick={() => setPortfolioData({ ...portfolioData, perks: portfolioData.perks.filter((_: any, idx: number) => idx !== i) })} className="text-rose-600 font-bold">×</button>
                    </span>
                  ))}
                </div>

                <form onSubmit={addPerk} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add benefit (e.g. AI Hardware Budget)"
                    value={newPerk}
                    onChange={e => setNewPerk(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-bold"
                  />
                  <button type="submit" className="bg-ink text-white px-3 py-1.5 rounded-xl text-xs font-bold">Add</button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Enterprise Brand Showcase */}
      <div className="bg-white rounded-3xl border border-border-soft shadow-2xl overflow-hidden">
        {/* Enterprise Banner */}
        <div className="p-10 md:p-14 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden shadow-inner border-b border-white/10">
          <div className="space-y-4 max-w-3xl z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-white/10 text-indigo-200 font-black text-xs uppercase tracking-widest rounded-xl backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <Building2 className="w-4 h-4 text-indigo-400" /> Enterprise Tech Partner
              </span>
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-xl backdrop-blur-md border border-emerald-400/30">
                AI Fraud Shield Enabled
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              {profile.company_name || profile.full_name || 'Tech Enterprise Inc.'}
            </h1>
            <h2 className="text-base sm:text-xl font-extrabold text-indigo-200 tracking-wide">
              {portfolioData.headline}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal max-w-2xl">
              {portfolioData.mission}
            </p>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl space-y-3 min-w-[240px] z-10">
            <h3 className="font-extrabold text-xs text-indigo-200 uppercase tracking-widest">Active Talent Pipeline</h3>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-black text-white block">{openJobs.length}</span>
                <span className="text-xs text-gray-400">Open Roles</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-2xl font-black text-emerald-400 block">100%</span>
                <span className="text-xs text-gray-400">Verified AI Testing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack & Culture Perks */}
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-ink flex items-center gap-2.5">
                <Rocket className="w-6 h-6 text-indigo-600" /> Production Engineering Tech Stack
              </h3>
              <p className="text-xs text-ink-light leading-relaxed font-medium">
                Our core systems and proprietary AI pipelines are engineered using cutting-edge developer architectures:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {portfolioData.tech_stack.map((t: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 font-black text-xs rounded-2xl border border-indigo-200 shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-ink flex items-center gap-2.5">
                <Award className="w-6 h-6 text-emerald-600" /> Developer Culture & Perks
              </h3>
              <p className="text-xs text-ink-light leading-relaxed font-medium">
                We empower senior architectural talent with world-class work environments and continuous learning allowances:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {portfolioData.perks.map((p: string, idx: number) => (
                  <div key={idx} className="p-3.5 bg-cream/50 rounded-2xl border border-border-soft text-xs font-bold text-ink flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Job Roles Section with Management Actions */}
          <div className="pt-8 border-t border-border-soft space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-ink flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-indigo-600" /> Active Open Recruitments & Assessments
                </h3>
                <p className="text-xs text-ink-light font-semibold mt-1">
                  Manage published engineering positions. Toggle job visibility to control candidate applications.
                </p>
              </div>
            </div>

            {openJobs.length === 0 ? (
              <div className="p-10 bg-cream/30 rounded-2xl border border-dashed border-border-soft text-center">
                <p className="text-xs font-semibold text-ink-faint">No openings published yet. Launch a recruitment pipeline from the dashboard!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openJobs.map((rec) => (
                  <div key={rec.id} className="p-6 rounded-3xl border border-border-soft bg-white hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                          {rec.role_type}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          rec.status === 'open' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          ● {rec.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-ink mt-2 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                      <p className="text-xs text-ink-light mt-1.5 line-clamp-2 leading-relaxed">{rec.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-soft text-xs font-black">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="w-4 h-4" /> Qualification Test ({rec.mock_test?.passing_percentage || 70}% Pass)
                      </span>

                      <button
                        onClick={async () => {
                          const newStatus = rec.status === 'open' ? 'closed' : 'open';
                          await recruitmentService.updateRecruitment(rec.id, { status: newStatus });
                          loadJobs();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-colors cursor-pointer ${
                          rec.status === 'open' 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {rec.status === 'open' ? 'Pause / Close Job' : 'Publish / Re-open Job'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
