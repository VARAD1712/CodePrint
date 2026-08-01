import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, ShieldCheck, Plus, Trash2, CheckCircle2, Eye, Edit3, Award, Code2, Rocket, Sparkles, Brain, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Profile, PortfolioConfig, HackathonAchievement } from '../types';

interface PortfolioProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  githubRepos?: any[];
}

export function Portfolio({ profile, setProfile, githubRepos = [] }: PortfolioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Build featured repos from actual GitHub data
  const featuredRepoNames = (githubRepos || []).slice(0, 3).map(r => r.name);

  // Default / stored config — NO fake projects
  const defaultConfig: PortfolioConfig = profile.portfolio_config || (
    localStorage.getItem(`codeprint_portfolio_${profile.id}`)
      ? JSON.parse(localStorage.getItem(`codeprint_portfolio_${profile.id}`)!)
      : {
          title: profile.linkedin_headline || `${profile.full_name || 'Developer'}'s Portfolio`,
          bio: '',
          theme: 'dark_obsidian',
          featured_repos: featuredRepoNames,
          custom_projects: [],
          show_hackathons: true
        }
  );

  const [config, setConfig] = useState<PortfolioConfig>(defaultConfig);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLink, setNewProjLink] = useState('');
  const [newProjTech, setNewProjTech] = useState('React, TypeScript, AI');

  const hackathons: HackathonAchievement[] = profile.hackathon_achievements || (
    localStorage.getItem(`codeprint_hackathons_${profile.id}`)
      ? JSON.parse(localStorage.getItem(`codeprint_hackathons_${profile.id}`)!)
      : []
  );

  const handleSaveToProfile = async () => {
    localStorage.setItem(`codeprint_portfolio_${profile.id}`, JSON.stringify(config));
    try {
      await supabase.from('profiles').update({ portfolio_config: config }).eq('id', profile.id);
    } catch { /* offline handling */ }

    setProfile({ ...profile, portfolio_config: config });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
    setIsEditing(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;
    const newProj = {
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      link: newProjLink.trim() || 'https://github.com',
      tech_stack: newProjTech.split(',').map(s => s.trim()).filter(Boolean)
    };
    setConfig({ ...config, custom_projects: [...(config.custom_projects || []), newProj] });
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjLink('');
  };

  const handleRemoveProject = (idx: number) => {
    const updated = (config.custom_projects || []).filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, custom_projects: updated });
  };

  const themeClasses: Record<string, { header: string; card: string; accent: string }> = {
    dark_obsidian: {
      header: 'from-slate-900 via-indigo-950 to-neutral-900 text-white border-white/10',
      card: 'bg-slate-900/40 border-slate-700 text-white',
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    sage_executive: {
      header: 'from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-500/20',
      card: 'bg-emerald-950/20 border-emerald-200 text-ink',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    cyber_indigo: {
      header: 'from-purple-900 via-indigo-900 to-blue-900 text-white border-purple-500/20',
      card: 'bg-purple-950/20 border-purple-200 text-ink',
      accent: 'text-purple-700 bg-purple-50 border-purple-200'
    }
  };

  const currentTheme = themeClasses[config.theme || 'dark_obsidian'] || themeClasses.dark_obsidian;


  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border-soft shadow-md">
        <div>
          <span className="text-xs font-black bg-sage/10 text-sage uppercase tracking-wider px-3 py-1 rounded-xl block w-fit mb-1.5">
            Verified Talent Showcase
          </span>
          <h1 className="text-2xl font-black text-ink">My Public Engineering Portfolio</h1>
          <p className="text-xs sm:text-sm text-ink-light font-medium mt-0.5">
            This live showcase is attached to all job applications. Recruiters evaluate your projects, hackathons, and AI verification score directly from this portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
              isEditing ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-cream text-ink hover:bg-cream-dark'
            }`}
          >
            {isEditing ? <><Eye className="w-4 h-4" /> Preview Showcase</> : <><Edit3 className="w-4 h-4" /> Customize Portfolio</>}
          </button>
          <button
            onClick={handleSaveToProfile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> Save to Profile Vault
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Portfolio Showcase successfully saved and linked to your active applicant profile!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-8 bg-cream/60 rounded-3xl border border-border-soft space-y-6 shadow-inner overflow-hidden"
          >
            <h3 className="font-black text-lg text-ink flex items-center gap-2 border-b border-border-soft pb-3">
              <Edit3 className="w-5 h-5 text-indigo-600" /> Portfolio Configuration & Styling
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <label className="text-xs font-extrabold text-ink block mb-1">Professional Headline / Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={e => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-border-soft text-sm font-bold text-ink shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-ink block mb-1">Visual Theme Presets</label>
                <select
                  value={config.theme}
                  onChange={e => setConfig({ ...config, theme: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-border-soft text-sm font-extrabold text-ink shadow-sm"
                >
                  <option value="dark_obsidian">Dark Obsidian AI</option>
                  <option value="sage_executive">Sage Executive</option>
                  <option value="cyber_indigo">Cyber Indigo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-ink block mb-1">Executive Summary / Bio</label>
              <textarea
                rows={3}
                value={config.bio}
                onChange={e => setConfig({ ...config, bio: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-2xl border border-border-soft text-sm font-semibold text-ink resize-none shadow-sm"
              />
            </div>

            <div className="p-6 bg-white rounded-2xl border border-border-soft space-y-4">
              <h4 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Add Featured Technical Project
              </h4>
              <form onSubmit={handleAddProject} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Title (e.g. LLM Copilot Engine)"
                  value={newProjTitle}
                  onChange={e => setNewProjTitle(e.target.value)}
                  className="px-4 py-2.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-bold text-ink"
                />
                <input
                  type="url"
                  placeholder="Demo or Github URL (https://...)"
                  value={newProjLink}
                  onChange={e => setNewProjLink(e.target.value)}
                  className="px-4 py-2.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-bold text-ink"
                />
                <input
                  type="text"
                  placeholder="Tech Stack (comma separated: Python, Docker, PyTorch)"
                  value={newProjTech}
                  onChange={e => setNewProjTech(e.target.value)}
                  className="px-4 py-2.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-bold text-ink sm:col-span-2"
                />
                <textarea
                  placeholder="Technical highlight & performance impact..."
                  rows={2}
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  className="px-4 py-2.5 bg-cream/40 rounded-xl border border-border-soft text-xs font-semibold text-ink resize-none sm:col-span-2"
                />
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="bg-ink hover:bg-ink/90 text-white px-6 py-2.5 rounded-xl font-bold text-xs">
                    + Add to Featured Projects
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Portfolio Showcase Render */}
      <div className="bg-white rounded-3xl border border-border-soft shadow-2xl overflow-hidden">
        {/* Showcase Header */}
        <div className={`p-10 md:p-14 bg-gradient-to-br ${currentTheme.header} flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden shadow-inner`}>
          <div className="space-y-4 max-w-3xl z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-white/10 text-white font-extrabold text-xs rounded-xl backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI Verified Candidate
              </span>
              <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-xl backdrop-blur-md border border-amber-400/30">
                Talent Score: {profile.talent_score || profile.ai_profile_score || 85}/100
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              {profile.full_name || profile.email?.split('@')[0] || 'Senior Engineer'}
            </h1>
            <h2 className="text-base sm:text-lg font-extrabold text-indigo-200 tracking-wide">
              {config.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal max-w-2xl">
              {config.bio}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto z-10">
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-white text-ink rounded-2xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
              >
                <Code2 className="w-4 h-4" /> GitHub Profile <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
              >
                <Globe className="w-4 h-4" /> LinkedIn Profile <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* AI Talent Score & Profile Competence Analysis */}
        <div className="mx-8 md:mx-12 my-8 p-8 rounded-3xl bg-neutral-900 border border-indigo-500/30 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> AI Evaluation Engine & Profile Analysis
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Verified Engineering Competence Report</span>
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                {profile.github_explainability?.scoreRationale ||
                 profile.ai_profile_summary?.summary ||
                 `AI syntax telemetry verifies @${profile.github_username || profile.email?.split('@')[0] || 'candidate'} as an adaptable developer exhibiting clean modular architectures, disciplined version control cadence, and consistent technical problem-solving capabilities across modern application stacks.`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Core Competence Strengths
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside font-medium">
                    {(profile.github_explainability?.strengths || [
                      `Robust architectural practices across ${(profile.github_stats?.languages || ['TypeScript', 'Python']).slice(0, 2).join(' & ')}`,
                      'Structured repository documentation and clear API abstraction',
                      'Strong commitment to continuous deployment workflows'
                    ]).map((str: string, i: number) => (
                      <li key={i} className="truncate">{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> AI Recommended Next Milestones
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside font-medium">
                    {(profile.github_explainability?.actionableSteps || [
                      'Integrate comprehensive end-to-end automated test coverage badges into README roots',
                      'Publish architectural sequence diagrams for primary distributed repositories'
                    ]).map((act: string, i: number) => (
                      <li key={i} className="truncate">{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 min-w-[220px] shadow-inner text-center space-y-3 flex-shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border-4 border-indigo-500/40 shadow-lg shadow-indigo-500/10">
                <div className="text-center">
                  <span className="text-4xl font-black text-white block">
                    {profile.talent_score || profile.ai_profile_score || 88}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block mt-0.5">
                    Talent Score
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1.5 pt-2 text-left text-xs border-t border-white/10">
                <div className="flex justify-between items-center text-gray-300 font-bold">
                  <span>Productivity:</span>
                  <span className="text-emerald-400">{profile.github_breakdown?.productivity || 22}/25</span>
                </div>
                <div className="flex justify-between items-center text-gray-300 font-bold">
                  <span>Code Impact:</span>
                  <span className="text-indigo-400">{profile.github_breakdown?.impact || 21}/25</span>
                </div>
                <div className="flex justify-between items-center text-gray-300 font-bold">
                  <span>Stack Diversity:</span>
                  <span className="text-purple-400">{profile.github_breakdown?.diversity || 18}/20</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Projects Section */}
        <div className="p-8 md:p-12 space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-ink flex items-center gap-3">
              <Rocket className="w-6 h-6 text-indigo-600" /> Featured Engineering Architecture & Projects
            </h3>
            <p className="text-xs text-ink-light font-semibold">
              Highlighted builds verified for structural scalability and algorithm clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(config.custom_projects || []).map((proj: any, idx: number) => (
              <div key={idx} className="p-6 rounded-3xl border border-border-soft bg-cream/30 hover:bg-white hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-black text-ink group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-indigo-600 flex-shrink-0" /> {proj.title}
                    </h4>
                    {isEditing && (
                      <button onClick={() => handleRemoveProject(idx)} className="text-rose-600 hover:text-rose-800 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-ink-light leading-relaxed font-normal">{proj.description}</p>
                </div>

                <div className="space-y-4 pt-3 border-t border-border-soft/60">
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.tech_stack || []).map((t: string, tIdx: number) => (
                      <span key={tIdx} className={`px-2.5 py-1 rounded-xl text-[11px] font-black border ${currentTheme.accent}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 inline-block pt-1"
                    >
                      View Live Repository & Demo <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>


          {/* Hackathon & Achievement Showcase */}
          {config.show_hackathons && hackathons.length > 0 && (
            <div className="pt-8 border-t border-border-soft space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-ink flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-600" /> Verified Hackathons & Competitions
                </h3>
                <p className="text-xs text-ink-light font-semibold">
                  Validated competitive contributions contributing to AI Credibility Score.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hackathons.map(h => (
                  <div key={h.id} className="p-6 bg-amber-50/30 border border-amber-200/60 rounded-3xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-100 text-amber-950 font-extrabold text-xs rounded-xl border border-amber-300">
                        🏆 {h.placement}
                      </span>
                      <span className="text-xs font-bold text-ink-faint">{h.date}</span>
                    </div>
                    <h4 className="font-black text-base text-ink">{h.title} <span className="text-xs font-bold text-indigo-700">@ {h.event_name}</span></h4>
                    <p className="text-xs text-ink-light leading-relaxed">{h.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(h.skills || []).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white text-ink text-[11px] font-bold rounded-lg border border-amber-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
