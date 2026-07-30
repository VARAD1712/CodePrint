import { motion } from 'framer-motion';
import { ArrowRight, FolderGit2, GitBranch, Star, Users, Code2, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TalentScoreRing } from '../components/TalentScoreRing';
import { ImprovementSuggestions } from '../components/ImprovementSuggestions';
import { ProjectCard } from '../components/ProjectCard';
import type { Profile, GitHubResult, Repo } from '../types';
import { LinkedinIcon, GithubIcon } from '../components/BrandIcons';

interface DashboardProps {
  profile: Profile;
  githubResult: GitHubResult | null;
  repos: Repo[];
}

export function Dashboard({ profile, githubResult, repos }: DashboardProps) {
  const navigate = useNavigate();
  const aiScore = profile.ai_profile_score ?? githubResult?.talentScore ?? profile.talent_score;
  const topRepos = repos.slice(0, 3);
  const stats = githubResult?.stats || profile.github_stats;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          Candidate Performance Console
        </h1>
        <p className="text-ink-light text-sm mt-1.5">
          Quantitative evaluation and telemetry metrics across connected repositories and professional profiles.
        </p>
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
      </motion.div>

      {/* AI Score Section — always renders */}
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
            {githubResult?.breakdown ? (
              <ImprovementSuggestions breakdown={githubResult.breakdown} />
            ) : profile.ai_profile_summary?.recommendations ? (
              <div>
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Optimization Roadmap</h3>
                <ul className="space-y-2.5">
                  {profile.ai_profile_summary.recommendations.map((tip, i) => (
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
      ) : (
        /* CTA for new users without a score */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="soft-card rounded-xl p-8 flex flex-col items-center text-center gap-4 border border-border-soft bg-white"
        >
          <div>
            <h2 className="text-lg font-bold text-ink">Connect Repository Credentials to Initialize Analytics</h2>
            <p className="text-sm text-ink-light mt-1 max-w-md">
              Link your GitHub account to generate verified competence ratings and repository telemetry.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-2 px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors flex items-center gap-2"
          >
            <GithubIcon className="w-4 h-4" /> Initialize Credentials
          </button>
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
            {stats.languages.map((lang: string) => (
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

