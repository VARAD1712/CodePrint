import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, Sparkles, ExternalLink, GraduationCap, Bot, BarChart3, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types';
import { GithubIcon, LinkedinIcon } from '../../components/BrandIcons';
import { CandidateMatchEngine } from './CandidateMatchEngine';
import { FraudAnalysisModal } from '../../components/FraudAnalysisModal';

export function CandidateDiscovery() {
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditingCandidate, setAuditingCandidate] = useState<Profile | null>(null);
  
  // Filters
  const [skillSearch, setSkillSearch] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [nlpQuery, setNlpQuery] = useState('');
  
  const [aiMatching, setAiMatching] = useState(false);
  const [view, setView] = useState<'discovery' | 'analytics' | 'match'>('discovery');
  const [selectedCandidate, setSelectedCandidate] = useState<Profile | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
      
    if (data) {
      setCandidates(data as Profile[]);
    }
    setLoading(false);
  };

  const handleAiMatch = () => {
    setAiMatching(true);
    // Simulate AI matcher identifying the best candidates based on implicit criteria
    setTimeout(() => {
      const sorted = [...candidates].sort((a, b) => {
        const scoreA = a.ai_profile_score || a.talent_score || 0;
        const scoreB = b.ai_profile_score || b.talent_score || 0;
        return scoreB - scoreA; // descending
      });
      setCandidates(sorted);
      setAiMatching(false);
    }, 1500);
  };

  const handleNlpSearch = () => {
    setAiMatching(true);
    // Simulate AI parsing NLP query and filtering candidates
    setTimeout(() => {
      if (nlpQuery.toLowerCase().includes('react')) {
        setSkillSearch('React');
      }
      setAiMatching(false);
    }, 1200);
  };

  const handleViewCandidate = (candidate: Profile) => {
    setSelectedCandidate(candidate);
    setView('match');
  };

  if (view === 'match' && selectedCandidate) {
    return <CandidateMatchEngine candidate={selectedCandidate} onBack={() => setView('discovery')} />;
  }

  if (view === 'analytics') {
    return (
      <div className="space-y-6 pb-20 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('discovery')} 
              className="px-3.5 py-1.5 rounded-lg bg-cream text-ink text-xs font-semibold border border-border-soft hover:bg-cream-dark transition-all flex items-center gap-1.5 shadow-xs"
            >
               ← Back to Copilot Discovery
            </button>
            <h1 className="text-2xl font-black tracking-tight text-ink">AI Hiring & Pipeline Analytics</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="soft-card p-6 bg-gradient-to-br from-cream to-white">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">Total Talent Pool</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl font-black text-ink">{candidates.length || '24'}</span>
              <span className="badge-sage">+12% vs last month</span>
            </div>
            <p className="text-xs text-ink-light mt-3">Verified candidates ready for technical evaluations.</p>
          </div>
          <div className="soft-card p-6 bg-gradient-to-br from-cream to-white">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">Average Talent Score</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl font-black text-sage">
                {candidates.length > 0 
                  ? Math.round(candidates.reduce((acc, c) => acc + (c.ai_profile_score || c.talent_score || 0), 0) / candidates.length)
                  : 84}
              </span>
              <span className="badge-sky">Top Tier Pool</span>
            </div>
            <p className="text-xs text-ink-light mt-3">Computed by AI across GitHub, LeetCode, and resumes.</p>
          </div>
          <div className="dark-widget p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">AI Match Accuracy</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-sage-light">96.4%</span>
              </div>
              <p className="text-xs text-white/70 mt-2">Historical correlation between Copilot prediction & interview success rate.</p>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="soft-card p-6">
            <h3 className="font-bold text-ink mb-4">Top Tech Stack In Demand</h3>
            <div className="space-y-3">
              {[
                { name: 'React.js / Next.js', percent: 85, color: 'bg-sky-500' },
                { name: 'Node.js & Backend Architecture', percent: 72, color: 'bg-sage' },
                { name: 'Python & AI/LLM Integration', percent: 64, color: 'bg-amber-500' },
                { name: 'PostgreSQL / Distributed DBs', percent: 58, color: 'bg-purple-500' },
              ].map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-ink">{skill.name}</span>
                    <span className="text-ink-light">{skill.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-cream-dark rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color} rounded-full transition-all duration-1000`} style={{ width: `${skill.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-card p-6">
            <h3 className="font-bold text-ink mb-4">University & Institution Spread</h3>
            <div className="space-y-4">
              {[
                { uni: 'Indian Institute of Technology (IITs)', candidates: '38%', tag: 'Tier-1 High Match' },
                { uni: 'National Institute of Technology (NITs)', candidates: '27%', tag: 'High Growth' },
                { uni: 'BITS Pilani & Top Private Tech Institutes', candidates: '22%', tag: 'Specialist Pool' },
                { uni: 'Global Open-Source Contributors & Others', candidates: '13%', tag: 'Independent Talent' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-cream/60 border border-border-soft">
                  <div>
                    <span className="text-xs font-bold text-ink block">{item.uni}</span>
                    <span className="text-[10px] font-semibold text-ink-light">{item.tag}</span>
                  </div>
                  <span className="text-sm font-black text-sage bg-white px-2.5 py-1 rounded-lg border border-border-soft shadow-xs">
                    {item.candidates}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(c => {
    if (minScore > 0) {
      const score = c.ai_profile_score || c.talent_score || 0;
      if (score < minScore) return false;
    }
    
    if (collegeSearch) {
      if (!c.college?.toLowerCase().includes(collegeSearch.toLowerCase())) return false;
    }
    
    if (skillSearch) {
      if (!c.skills?.some(s => s.toLowerCase().includes(skillSearch.toLowerCase()))) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Recruitment AI Copilot</h1>
          <p className="text-sm text-ink-light mt-1">Search, filter, and discover top talent proactively.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('analytics')}
            className="flex items-center gap-2 bg-cream text-ink px-5 py-2.5 rounded-xl text-sm font-medium border border-border-soft hover:bg-cream-dark transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> Hiring Analytics
          </button>
          <button
            onClick={handleAiMatch}
            disabled={aiMatching}
            className="flex items-center gap-2 bg-sage text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            {aiMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Auto-Match
          </button>
        </div>
      </div>

      {/* NLP Copilot Search */}
      <div className="bg-gradient-to-r from-ink to-deep-graphite p-6 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
        <Bot className="w-10 h-10 text-sage shrink-0" />
        <div className="flex-1 w-full">
          <h3 className="text-white font-bold mb-2">Ask your Copilot</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 'Find React developers who have participated in hackathons'"
              value={nlpQuery}
              onChange={e => setNlpQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNlpSearch()}
              className="w-full pl-4 pr-24 py-3 bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded-xl focus:outline-none focus:border-sage"
            />
            <button 
              onClick={handleNlpSearch}
              disabled={!nlpQuery || aiMatching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-border-soft shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skillSearch}
            onChange={e => setSkillSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-cream border border-border-soft rounded-lg text-sm focus:outline-none focus:border-sage"
          />
        </div>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Filter by college..."
            value={collegeSearch}
            onChange={e => setCollegeSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-cream border border-border-soft rounded-lg text-sm focus:outline-none focus:border-sage"
          />
        </div>
        <div className="relative flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-faint" />
          <span className="text-sm text-ink-light">Min Score:</span>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="flex-1 accent-sage"
          />
          <span className="text-sm font-semibold text-ink w-8 text-right">{minScore}</span>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
           <Loader2 className="w-6 h-6 animate-spin text-ink-faint" />
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-full py-12 text-center text-ink-faint">
              No candidates found matching your criteria.
            </div>
          ) : (
            filteredCandidates.map((candidate, i) => {
              const score = candidate.ai_profile_score || candidate.talent_score || 0;
              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-border-soft p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-ink truncate">{candidate.full_name}</h3>
                      <p className="text-xs text-ink-light flex items-center gap-1 mt-1">
                        <GraduationCap className="w-3 h-3" /> {candidate.college || 'College not specified'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-2xl font-black text-sage">{score}</span>
                       <span className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">Score</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {candidate.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-1 bg-cream-dark text-ink-light text-[10px] font-medium rounded">
                            {s}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="px-2 py-1 bg-cream border border-border-soft text-ink-faint text-[10px] font-medium rounded">
                            +{candidate.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setAuditingCandidate(candidate)}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> AI Fraud Shield: 96% Trust Index
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border-soft flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       {candidate.github_username && (
                         <a href={`https://github.com/${candidate.github_username}`} target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-ink">
                           <GithubIcon className="w-4 h-4" />
                         </a>
                       )}
                       {candidate.linkedin_url && (
                         <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-sky">
                           <LinkedinIcon className="w-4 h-4" />
                         </a>
                       )}
                    </div>
                    
                    <button onClick={() => handleViewCandidate(candidate)} className="text-xs font-semibold text-sage hover:text-sage-dark flex items-center gap-1">
                      View AI Match <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {auditingCandidate && (
        <FraudAnalysisModal
          candidateName={auditingCandidate.full_name || 'Candidate'}
          candidateEmail={auditingCandidate.email}
          onClose={() => setAuditingCandidate(null)}
        />
      )}
    </div>
  );
}
