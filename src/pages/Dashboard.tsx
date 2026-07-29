import { motion } from 'framer-motion';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TalentScoreRing } from '../components/TalentScoreRing';
import { ImprovementSuggestions } from '../components/ImprovementSuggestions';
import { ProjectCard } from '../components/ProjectCard';
import type { Profile, GitHubResult, Repo } from '../types';
import { LinkedinIcon } from '../components/BrandIcons';

interface DashboardProps {
  profile: Profile;
  githubResult: GitHubResult | null;
  repos: Repo[];
}

export function Dashboard({ profile, githubResult, repos }: DashboardProps) {
  const navigate = useNavigate();
  const aiScore = profile.ai_profile_score ?? githubResult?.talentScore;
  const topRepos = repos.slice(0, 3);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-ink-light text-sm mt-1.5">
          Your AI-analyzed profile telemetry from GitHub and LinkedIn.
        </p>
      </motion.div>

      {/* Connected accounts status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3"
      >
        <span className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
          profile.github_username ? 'bg-sage-light text-sage' : 'bg-cream-dark text-ink-faint'
        }`}>
          GitHub {profile.github_username ? `@${profile.github_username}` : '— not connected'}
        </span>
        <span className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
          profile.linkedin_url ? 'bg-sky-light text-sky' : 'bg-cream-dark text-ink-faint'
        }`}>
          <LinkedinIcon className="w-3 h-3" /> LinkedIn {profile.linkedin_url ? 'connected' : '— not connected'}
        </span>
      </motion.div>

      {/* AI Score */}
      {aiScore != null ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="soft-card rounded-xl p-6 flex flex-col items-center justify-center">
            <TalentScoreRing score={aiScore} />
            <p className="text-[11px] text-ink-faint mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              AI Profile Score
            </p>
            {profile.ai_profile_summary?.summary && (
              <p className="text-xs text-ink-light text-center mt-3 max-w-[200px]">
                {profile.ai_profile_summary.summary}
              </p>
            )}
          </div>

          <div className="lg:col-span-2 soft-card rounded-xl p-6">
            {githubResult?.breakdown ? (
              <ImprovementSuggestions breakdown={githubResult.breakdown} />
            ) : profile.ai_profile_summary?.recommendations ? (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-3">AI Recommendations</h3>
                <ul className="space-y-2">
                  {profile.ai_profile_summary.recommendations.map((tip, i) => (
                    <li key={i} className="text-sm text-ink-light flex gap-2">
                      <span className="text-sage">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-ink-faint text-sm">
                Connect GitHub & LinkedIn on Profile for full analysis
              </div>
            )}
          </div>
        </motion.div>
      ) : null}

      {topRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-sage" />
              <h2 className="text-lg font-bold text-ink">Featured GitHub Repositories</h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-medium text-sage hover:text-sage/80 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
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

