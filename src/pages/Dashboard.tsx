import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TalentScoreRing } from '../components/TalentScoreRing';
import { ImprovementSuggestions } from '../components/ImprovementSuggestions';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { ProjectCard } from '../components/ProjectCard';
import type { Profile, GitHubResult, Repo } from '../types';
import { LinkedinIcon, GithubIcon } from '../components/BrandIcons';
import { supabase } from '../services/supabase';
import { fetchGithubAnalysis, fetchGithubRepos } from '../services/githubService';

interface DashboardProps {
  profile: Profile;
  githubResult: GitHubResult | null;
  repos: Repo[];
  setGithubResult?: (r: GitHubResult | null) => void;
  setRepos?: (repos: Repo[]) => void;
  setProfile?: (p: Profile) => void;
}

export function Dashboard({ profile, githubResult, repos, setGithubResult, setRepos, setProfile }: DashboardProps) {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [localGithubResult, setLocalGithubResult] = useState<GitHubResult | null>(githubResult);
  const [localRepos, setLocalRepos] = useState<Repo[]>(repos);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  // Sync from parent props
  useEffect(() => {
    if (githubResult) setLocalGithubResult(githubResult);
  }, [githubResult]);

  useEffect(() => {
    if (repos.length > 0) setLocalRepos(repos);
  }, [repos]);

  const [localGithubUsername, setLocalGithubUsername] = useState(
    profile.github_username || localStorage.getItem(`codeprint_gh_username_${profile.id}`) || 'VARAD1712'
  );
  const githubUsername = localGithubUsername || profile.github_username || localStorage.getItem(`codeprint_gh_username_${profile.id}`) || 'VARAD1712';

  const analyzeGithub = useCallback(async (username: string) => {
    if (!username.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      // Fetch analysis and repos in parallel with automatic client fallback
      const [result, fetchedRepos] = await Promise.all([
        fetchGithubAnalysis(username),
        fetchGithubRepos(username).catch(() => []),
      ]);

      // Update local state
      setLocalGithubResult(result);
      setLocalRepos(fetchedRepos);

      // Propagate to parent if setters are available
      if (setGithubResult) setGithubResult(result);
      if (setRepos) setRepos(fetchedRepos);

      // Update local github username
      setLocalGithubUsername(username);

      // Persist to localStorage
      localStorage.setItem(`codeprint_gh_username_${profile.id}`, username);
      localStorage.setItem(`codeprint_gh_result_${profile.id}`, JSON.stringify({
        talentScore: result.talentScore,
        breakdown: result.breakdown || null,
        stats: result.stats,
        freshness: result.freshness || null,
        explainability: result.explainability || null,
        avatarUrl: result.avatarUrl || null,
        username,
      }));

      // Persist to Supabase (best-effort)
      try {
        await supabase.from('profiles').update({
          github_username: username,
          talent_score: result.talentScore,
          github_stats: result.stats,
          github_breakdown: result.breakdown,
          github_freshness: result.freshness || null,
          github_explainability: result.explainability || null,
          avatar_url: result.avatarUrl,
        } as any).eq('id', profile.id);
      } catch { /* Supabase update is best-effort */ }

      // Update parent profile state if setter is available
      if (setProfile) {
        setProfile({
          ...profile,
          github_username: username,
          talent_score: result.talentScore,
          github_stats: result.stats,
          github_breakdown: result.breakdown,
          github_freshness: result.freshness || null,
          github_explainability: result.explainability || null,
          avatar_url: result.avatarUrl || profile.avatar_url,
        });
      }

      // Hide the credential form after success
      setShowCredentialForm(false);
    } catch (err: any) {
      console.error('Dashboard GitHub analysis failed:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to analyze GitHub profile';
      setAnalysisError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, profile, setGithubResult, setRepos, setProfile]);

  // Auto-trigger analysis when GitHub username exists but no score data is loaded
  useEffect(() => {
    if (hasAutoTriggered) return;
    if (!githubUsername) return;

    const hasExistingData = localGithubResult?.talentScore != null
      || profile.talent_score != null
      || profile.ai_profile_score != null;

    if (!hasExistingData) {
      setHasAutoTriggered(true);
      analyzeGithub(githubUsername);
    }
  }, [githubUsername, localGithubResult, profile, hasAutoTriggered, analyzeGithub]);

  const aiScore = localGithubResult?.talentScore ?? profile.ai_profile_score ?? profile.talent_score;
  const topRepos = localRepos.slice(0, 3);
  const stats = localGithubResult?.stats || profile.github_stats;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
              Candidate Performance Console
            </h1>
            <p className="text-ink-light text-sm mt-1.5">
              Quantitative evaluation and telemetry metrics across connected repositories and professional profiles.
            </p>
          </div>
          {githubUsername && (
            <button
              onClick={() => analyzeGithub(githubUsername)}
              disabled={isAnalyzing}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border-soft bg-white text-ink hover:bg-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isAnalyzing ? 'Analyzing…' : 'Recalculate'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Connected accounts status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3"
      >
        <span className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${
          profile.github_username ? 'bg-white text-ink border-border-soft' : 'bg-cream-dark text-ink-faint border-transparent'
        }`}>
          <GithubIcon className="w-3.5 h-3.5 text-ink" /> GitHub {profile.github_username ? `@${profile.github_username}` : '— offline'}
        </span>
        <span className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${
          profile.linkedin_url ? 'bg-white text-ink border-border-soft' : 'bg-cream-dark text-ink-faint border-transparent'
        }`}>
          <LinkedinIcon className="w-3.5 h-3.5 text-ink" /> LinkedIn {profile.linkedin_url ? 'connected' : '— offline'}
        </span>
        {/* Mobile recalculate */}
        {githubUsername && (
          <button
            onClick={() => analyzeGithub(githubUsername)}
            disabled={isAnalyzing}
            className="sm:hidden inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-soft bg-white text-ink hover:bg-cream transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {isAnalyzing ? 'Analyzing…' : 'Recalculate'}
          </button>
        )}
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{analysisError}</span>
            <button onClick={() => setAnalysisError('')} className="text-xs font-semibold underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state while auto-analyzing */}
      {isAnalyzing && aiScore == null && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card rounded-xl p-10 flex flex-col items-center text-center gap-4 border border-border-soft bg-white"
        >
          <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
          <div>
            <h2 className="text-lg font-bold text-ink">Analyzing GitHub Profile</h2>
            <p className="text-sm text-ink-light mt-1 max-w-md">
              Fetching repositories, calculating commit velocity, scoring across 5 dimensions…
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <GithubIcon className="w-3.5 h-3.5" />
            <span>@{githubUsername}</span>
          </div>
        </motion.div>
      )}

      {/* AI Score Section — always renders when data is available */}
      {aiScore != null ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="soft-card rounded-xl p-6 flex flex-col items-center justify-center">
            <TalentScoreRing score={aiScore} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-light mt-3">
              Verified Competence Benchmark
            </p>
            {profile.ai_profile_summary?.summary && (
              <p className="text-xs text-ink-light text-center mt-3 max-w-[220px] leading-relaxed">
                {profile.ai_profile_summary.summary}
              </p>
            )}
          </div>

          <div className="lg:col-span-2 soft-card rounded-xl p-6">
            {localGithubResult?.breakdown ? (
              <div className="space-y-6">
                <ScoreBreakdown
                  breakdown={localGithubResult.breakdown}
                  freshness={localGithubResult.freshness}
                  explainability={localGithubResult.explainability}
                />
              </div>
            ) : profile.github_breakdown ? (
              <ScoreBreakdown
                breakdown={profile.github_breakdown}
                freshness={profile.github_freshness}
                explainability={profile.github_explainability}
              />
            ) : profile.ai_profile_summary?.recommendations ? (
              <div>
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Optimization Roadmap</h3>
                <ul className="space-y-2.5">
                  {(profile.ai_profile_summary.recommendations || []).map((tip, i) => (
                    <li key={i} className="text-sm text-ink-light flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-faint mt-2 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-ink-faint text-sm">
                Connect professional profile credentials to unlock analytical breakdowns
              </div>
            )}
          </div>
        </motion.div>
      ) : !isAnalyzing ? (
        /* CTA for new users — inline GitHub username form */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="soft-card rounded-xl p-8 flex flex-col items-center text-center gap-5 border border-border-soft bg-white"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ink/5 to-ink/10 flex items-center justify-center">
            <GithubIcon className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Connect Repository Credentials to Initialize Analytics</h2>
            <p className="text-sm text-ink-light mt-1.5 max-w-lg">
              Enter your GitHub username to generate verified competence ratings, repository telemetry, and a multi-dimensional talent score.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showCredentialForm ? (
              <motion.button
                key="cta-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setShowCredentialForm(true)}
                className="mt-1 px-6 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <GithubIcon className="w-4 h-4" /> Initialize Credentials
              </motion.button>
            ) : (
              <motion.form
                key="cta-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (usernameInput.trim()) analyzeGithub(usernameInput.trim());
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg"
              >
                <div className="relative flex-1">
                  <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter GitHub username"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-soft bg-cream/50 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!usernameInput.trim() || isAnalyzing}
                  className="px-6 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Analyze Profile</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}

      {/* Improvement Suggestions — separate card when breakdown is available */}
      {(localGithubResult?.breakdown || profile.github_breakdown) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="soft-card rounded-xl p-6 border border-border-soft bg-white"
        >
          <ImprovementSuggestions breakdown={localGithubResult?.breakdown || profile.github_breakdown!} />
        </motion.div>
      )}

      {/* GitHub Stats Grid */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {[
            { label: 'Repositories', value: stats.repos },
            { label: 'Stars Earned', value: stats.stars },
            { label: 'Followers', value: stats.followers },
            { label: 'Languages', value: stats.languages?.length || 0 },
            { label: 'Recent Commits', value: stats.recentCommits },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="soft-card rounded-xl p-4 flex flex-col items-center text-center justify-center bg-white border border-border-soft"
            >
              <span className="text-2xl font-black text-ink">{stat.value ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-faint font-bold mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* GitHub Languages */}
      {stats?.languages && stats.languages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="soft-card rounded-xl p-6 border border-border-soft bg-white"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3.5">
            Technology Stack Competency
          </h3>
          <div className="flex flex-wrap gap-2">
            {(stats?.languages || []).map((lang: string) => (
              <span
                key={lang}
                className="px-3 py-1 bg-cream-dark text-ink text-xs font-semibold rounded-md border border-border-soft"
              >
                {lang}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {topRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-ink">Primary Repositories</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-ink hover:underline transition-colors flex items-center gap-1"
            >
              View complete index <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRepos.map((repo, i) => (
              <ProjectCard
                key={repo.name}
                name={repo.name}
                description={repo.description || undefined}
                language={repo.language || undefined}
                stars={repo.stargazers_count || 0}
                forks={repo.forks_count || 0}
                url={repo.html_url}
                updatedAt={repo.updated_at}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
