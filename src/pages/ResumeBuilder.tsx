import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Sparkles, Briefcase, Code2, FolderGit2, BarChart3 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import axios from 'axios';


interface ResumeBuilderProps {
  profile: any;
  githubResult: any;
  repos: any[];
  linkedinUrl: string;
}

interface ResumeData {
  summary: string;
  skills: string[];
  projects: { name: string; description: string; tech: string[] }[];
  experience: string;
}

export function ResumeBuilder({ profile, githubResult, repos, linkedinUrl }: ResumeBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState('');

  // Editable fields
  const [editSummary, setEditSummary] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editExperience, setEditExperience] = useState('');

  const hasData = githubResult && githubResult.stats;

  const handleGenerate = async () => {
    if (!hasData) return;
    setIsGenerating(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-resume', {
        profile: {
          name: profile?.full_name || 'Student',
          email: profile?.email || '',
          githubUsername: profile?.github_username || githubResult?.username || '',
          linkedinUrl: linkedinUrl || profile?.linkedin_url || '',
        },
        linkedinHeadline: profile?.linkedin_headline || '',
        githubData: {
          stats: githubResult.stats,
          breakdown: githubResult.breakdown,
          talentScore: githubResult.talentScore,
        },
        repos: repos.slice(0, 10).map((r: any) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count || 0,
          topics: r.topics || [],
          homepage: r.homepage || '',
        })),
      });

      const data = response.data;
      setResumeData(data);
      setEditSummary(data.summary);
      setEditSkills(data.skills.join(', '));
      setEditExperience(data.experience);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-2xl font-bold text-ink tracking-tight">Resume Builder</h1>
        <p className="text-ink-light text-sm mt-1">
          AI-powered resume generated from your GitHub projects and LinkedIn profile.
        </p>
      </motion.div>

      {/* Data Sources */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="soft-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
            <GithubIcon className="w-4 h-4 text-cream" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-faint font-medium uppercase tracking-wider">GitHub</p>
            <p className="text-sm font-semibold text-ink truncate">
              {(profile?.github_username || githubResult?.username) ? `@${profile?.github_username || githubResult?.username}` : 'Not connected'}
            </p>
          </div>
          {hasData && <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />}
        </div>

        <div className="soft-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0A66C2] flex items-center justify-center">
            <LinkedinIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-faint font-medium uppercase tracking-wider">LinkedIn</p>
            <p className="text-sm font-semibold text-ink truncate">
              {linkedinUrl ? linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '@') : 'Not connected'}
            </p>
          </div>
          {linkedinUrl && <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />}
        </div>
      </motion.div>

      {/* Generate Button */}
      {!resumeData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !hasData}
            className="w-full bg-ink text-cream py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Resume...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate AI Resume</>
            )}
          </motion.button>

          {!hasData && (
            <p className="text-xs text-ink-faint text-center mt-2">
              Connect GitHub on Profile first. LinkedIn improves resume quality.
            </p>
          )}
          {hasData && !linkedinUrl && !profile?.linkedin_url && (
            <p className="text-xs text-amber text-center mt-2">
              Tip: Connect LinkedIn on Profile for a richer AI-generated resume.
            </p>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-rose bg-rose-light p-3 rounded-xl mt-3 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Resume Preview ── */}
      <AnimatePresence>
        {resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="space-y-4"
          >
            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="flex items-center gap-2 bg-sage text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sage/90 transition-colors"
              >
                <Download className="w-4 h-4" /> Download PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-white border border-border-soft text-ink px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-cream-dark transition-colors disabled:opacity-40"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Regenerate
              </motion.button>
            </div>

            {/* Resume Document */}
            <div id="resume-preview" className="bg-white rounded-xl border border-border-soft shadow-sm p-8 md:p-10 print:shadow-none print:border-0 print:p-0">
              {/* Header */}
              <div className="border-b border-border-soft pb-5 mb-6">
                <h2 className="text-2xl font-bold text-ink">{profile?.full_name || 'Student'}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-ink-light">
                  {profile?.email && <span>{profile.email}</span>}
                  {profile?.github_username && (
                    <span className="flex items-center gap-1">
                      <GithubIcon className="w-3.5 h-3.5" /> github.com/{profile.github_username}
                    </span>
                  )}
                  {linkedinUrl && (
                    <span className="flex items-center gap-1">
                      <LinkedinIcon className="w-3.5 h-3.5" /> {linkedinUrl.replace(/https?:\/\/(www\.)?/i, '')}
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              <section className="mb-6">
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Professional Summary
                </h3>
                <textarea
                  value={editSummary}
                  onChange={e => setEditSummary(e.target.value)}
                  className="w-full text-sm text-ink-light leading-relaxed bg-transparent border-0 resize-none focus:outline-none focus:ring-0 p-0 min-h-[60px]"
                />
              </section>

              {/* Skills */}
              <section className="mb-6">
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Technical Skills
                </h3>
                <textarea
                  value={editSkills}
                  onChange={e => setEditSkills(e.target.value)}
                  className="w-full text-sm text-ink-light leading-relaxed bg-transparent border-0 resize-none focus:outline-none focus:ring-0 p-0 min-h-[30px]"
                />
              </section>

              {/* Projects */}
              <section className="mb-6">
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5" /> Projects
                </h3>
                <div className="space-y-4">
                  {resumeData.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-sm font-semibold text-ink">{proj.name}</h4>
                        {proj.tech.length > 0 && (
                          <span className="text-xs text-ink-faint">
                            {proj.tech.join(' · ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-light mt-0.5 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* GitHub Stats */}
              {githubResult?.stats && (
                <section>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> GitHub Metrics
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-light">
                    <span><strong className="text-ink">{githubResult.stats.repos}</strong> Repositories</span>
                    <span><strong className="text-ink">{githubResult.stats.stars.toLocaleString()}</strong> Stars</span>
                    <span><strong className="text-ink">{githubResult.stats.followers.toLocaleString()}</strong> Followers</span>
                    <span>Talent Score: <strong className="text-ink">{githubResult.talentScore}/100</strong></span>
                  </div>
                </section>
              )}

              {/* Experience (if any) */}
              {editExperience && editExperience.trim() !== '' && (
                <section className="mt-6 pt-4 border-t border-border-soft">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Experience & Contributions
                  </h3>
                  <textarea
                    value={editExperience}
                    onChange={e => setEditExperience(e.target.value)}
                    className="w-full text-sm text-ink-light leading-relaxed bg-transparent border-0 resize-none focus:outline-none focus:ring-0 p-0 min-h-[40px]"
                  />
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
