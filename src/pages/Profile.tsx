import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Loader2, RefreshCw, FileText, Presentation, ExternalLink, Sparkles, GitBranch, Calendar, Award, ShieldCheck, Plus, Trash2, Zap, Link2, Unlink } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../services/supabase';
import { auth, githubProvider } from '../services/firebase';
import { linkWithPopup, GithubAuthProvider, unlink } from 'firebase/auth';

import { GithubIcon, LinkedinIcon } from '../components/BrandIcons';
import { TalentScoreRing } from '../components/TalentScoreRing';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { GitHubStatsGrid } from '../components/GitHubStatsGrid';
import type { HackathonAchievement } from '../types';

const languageColors: Record<string, string> = {
  JavaScript: '#F7DF1E', TypeScript: '#3178C6', Python: '#3776AB', Java: '#ED8B00',
  'C++': '#00599C', C: '#A8B9CC', Go: '#00ADD8', Rust: '#DEA584', Ruby: '#CC342D',
  PHP: '#777BB4', Swift: '#FA7343', Kotlin: '#7F52FF', Dart: '#0175C2', Shell: '#89E051',
  HTML: '#E34F26', CSS: '#1572B6', Lua: '#000080', R: '#276DC3', Scala: '#DC322F',
  Haskell: '#5D4F85', Elixir: '#6E4A7E', Vue: '#4FC08D', Jupyter: '#F37626',
};

interface ProfileProps {
  profile: any;
  setProfile: (p: any) => void;
  githubResult: any;
  setGithubResult: (r: any) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  onReposLoaded: (repos: any[]) => void;
  onProfileAnalyzed?: (updated: Record<string, unknown>) => void;
}

export function Profile({ profile, setProfile, githubResult, setGithubResult, linkedinUrl, setLinkedinUrl, onReposLoaded, onProfileAnalyzed }: ProfileProps) {
  const [githubUsername, setGithubUsername] = useState(
    profile?.github_username || (githubResult as any)?.username || localStorage.getItem(`codeprint_gh_username_${profile?.id}`) || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);
  const [githubLinkError, setGithubLinkError] = useState('');
  const [isUnlinkingGithub, setIsUnlinkingGithub] = useState(false);

  // Check if GitHub is linked via Firebase OAuth
  const isGithubLinkedViaOAuth = auth.currentUser?.providerData?.some(p => p.providerId === 'github.com') || false;

  const [pitchText, setPitchText] = useState('');
  const [isAnalyzingPitch, setIsAnalyzingPitch] = useState(false);
  const [pitchError, setPitchError] = useState('');

  const [linkedinInput, setLinkedinInput] = useState(
    linkedinUrl || profile?.linkedin_url || localStorage.getItem(`codeprint_linkedin_url_${profile?.id}`) || ''
  );
  const [linkedinHeadline, setLinkedinHeadline] = useState(
    profile?.linkedin_headline || localStorage.getItem(`codeprint_linkedin_headline_${profile?.id}`) || ''
  );
  const [linkedinSaved, setLinkedinSaved] = useState(false);
  const [savingLinkedin, setSavingLinkedin] = useState(false);

  useEffect(() => {
    const savedGh = profile?.github_username || (githubResult as any)?.username || localStorage.getItem(`codeprint_gh_username_${profile?.id}`) || '';
    if (savedGh && !githubUsername) setGithubUsername(savedGh);

    const savedLi = linkedinUrl || profile?.linkedin_url || localStorage.getItem(`codeprint_linkedin_url_${profile?.id}`) || '';
    if (savedLi && !linkedinInput) setLinkedinInput(savedLi);

    const savedHeadline = profile?.linkedin_headline || localStorage.getItem(`codeprint_linkedin_headline_${profile?.id}`) || '';
    if (savedHeadline && !linkedinHeadline) setLinkedinHeadline(savedHeadline);
  }, [profile, githubResult, linkedinUrl]);

  // Hackathon Vault State
  const [showHackathonForm, setShowHackathonForm] = useState(false);
  const [hackTitle, setHackTitle] = useState('');
  const [hackEvent, setHackEvent] = useState('');
  const [hackDate, setHackDate] = useState('');
  const [hackRole, setHackRole] = useState('Lead Developer');
  const [hackPlacement, setHackPlacement] = useState('Winner (1st Place)');
  const [hackDesc, setHackDesc] = useState('');
  const [hackSkills, setHackSkills] = useState('React, Python, OpenAI, Vector DB');
  const [analyzingHackathon, setAnalyzingHackathon] = useState(false);

  const hackathons: HackathonAchievement[] = profile?.hackathon_achievements || (
    localStorage.getItem(`codeprint_hackathons_${profile?.id}`)
      ? JSON.parse(localStorage.getItem(`codeprint_hackathons_${profile?.id}`)!)
      : []
  );

  const handleAddAndAnalyzeHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackTitle.trim() || !hackEvent.trim()) return;
    setAnalyzingHackathon(true);

    // Simulate AI verification & analysis delay
    await new Promise(r => setTimeout(r, 1200));

    const skillList = hackSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newHack: HackathonAchievement = {
      id: `hack-${Date.now()}`,
      title: hackTitle.trim(),
      event_name: hackEvent.trim(),
      date: hackDate || new Date().toISOString().split('T')[0],
      role: hackRole,
      placement: hackPlacement,
      description: hackDesc.trim() || 'Built high-throughput autonomous AI agents and interactive interfaces.',
      skills: skillList,
      ai_verified: true,
      ai_credibility_score: 98,
      ai_feedback: `Verified Gold Tier Contribution. AI detected advanced technical depth across ${skillList.slice(0, 2).join(' & ')} with confirmed competitive distinction.`,
      bonus_points: hackPlacement.includes('Winner') ? 15 : 10
    };

    const updatedHackathons = [newHack, ...hackathons];
    const newTalentScore = (profile.talent_score || profile.ai_profile_score || 75) + newHack.bonus_points;

    localStorage.setItem(`codeprint_hackathons_${profile?.id}`, JSON.stringify(updatedHackathons));
    try {
      await supabase.from('profiles').update({
        hackathon_achievements: updatedHackathons,
        talent_score: newTalentScore
      }).eq('id', profile.id);
    } catch { /* offline handling */ }

    setProfile({ ...profile, hackathon_achievements: updatedHackathons, talent_score: newTalentScore });
    setHackTitle('');
    setHackEvent('');
    setHackDesc('');
    setShowHackathonForm(false);
    setAnalyzingHackathon(false);
  };

  const handleRemoveHackathon = async (id: string) => {
    const updated = hackathons.filter(h => h.id !== id);
    localStorage.setItem(`codeprint_hackathons_${profile?.id}`, JSON.stringify(updated));
    try {
      await supabase.from('profiles').update({ hackathon_achievements: updated }).eq('id', profile.id);
    } catch { /* offline handling */ }
    setProfile({ ...profile, hackathon_achievements: updated });
  };

  const runFullProfileAnalysis = async (githubData: any, linkedin: string, headline: string) => {
    try {
      const res = await axios.post('/api/analyze-profile', {
        githubData,
        linkedinUrl: linkedin,
        linkedinHeadline: headline,
        profile: { name: profile.full_name, email: profile.email },
      });
      const { overallScore } = res.data;


      await supabase.from('profiles').update({
        ai_profile_score: overallScore,
        ai_profile_summary: res.data,
      }).eq('id', profile.id);

      onProfileAnalyzed?.({
        ai_profile_score: overallScore,
        ai_profile_summary: res.data,
      });
      setProfile({
        ...profile,
        ai_profile_score: overallScore,
        ai_profile_summary: res.data,
      });
    } catch (err) {
      console.warn('Profile analysis failed:', err);
    }
  };

  // ── GitHub OAuth Link Handler ──
  const handleLinkGithub = async () => {
    if (!auth.currentUser || !profile?.id) return;
    setIsLinkingGithub(true);
    setGithubLinkError('');

    try {
      const result = await linkWithPopup(auth.currentUser, githubProvider);

      // Extract GitHub username from the OAuth response
      const additionalInfo = (result as any).additionalUserInfo || (result as any)._tokenResponse;
      const extractedUsername =
        additionalInfo?.username ||
        additionalInfo?.screenName ||
        result.user.providerData.find(p => p.providerId === 'github.com')?.displayName ||
        '';

      // Extract GitHub OAuth access token for API calls
      const credential = GithubAuthProvider.credentialFromResult(result);
      const githubAccessToken = credential?.accessToken || null;
      const avatarUrl = result.user.photoURL || null;

      // Store access token locally
      if (githubAccessToken) {
        localStorage.setItem(`codeprint_gh_access_token_${profile.id}`, githubAccessToken);
      }

      // Update state and Supabase
      if (extractedUsername) {
        setGithubUsername(extractedUsername);
        localStorage.setItem(`codeprint_gh_username_${profile.id}`, extractedUsername);

        await supabase.from('profiles').update({
          github_username: extractedUsername,
          avatar_url: avatarUrl || profile.avatar_url,
        }).eq('id', profile.id);

        setProfile({
          ...profile,
          github_username: extractedUsername,
          avatar_url: avatarUrl || profile.avatar_url,
        });

        // Auto-trigger analysis after linking
        setIsLinkingGithub(false);
        setIsAnalyzing(true);
        try {
          const response = await axios.post('/api/analyze-github', { username: extractedUsername });
          const analysisResult = response.data;

          try {
            const reposRes = await axios.get(`/api/github-repos/${extractedUsername}`);
            onReposLoaded(reposRes.data.repos || []);
          } catch { /* ignore */ }

          await supabase.from('profiles').update({
            github_username: extractedUsername,
            talent_score: analysisResult.talentScore,
            github_stats: analysisResult.stats,
            github_breakdown: analysisResult.breakdown,
            github_freshness: analysisResult.freshness || null,
            github_explainability: analysisResult.explainability || null,
            avatar_url: analysisResult.avatarUrl || avatarUrl,
          } as any).eq('id', profile.id);

          localStorage.setItem(`codeprint_gh_result_${profile.id}`, JSON.stringify({
            talentScore: analysisResult.talentScore,
            breakdown: analysisResult.breakdown || null,
            stats: analysisResult.stats,
            freshness: analysisResult.freshness || null,
            explainability: analysisResult.explainability || null,
            avatarUrl: analysisResult.avatarUrl || avatarUrl || null,
            username: extractedUsername,
          }));

          setGithubResult(analysisResult);
          setProfile({
            ...profile,
            github_username: extractedUsername,
            talent_score: analysisResult.talentScore,
            github_stats: analysisResult.stats,
            github_breakdown: analysisResult.breakdown,
            github_freshness: analysisResult.freshness || null,
            github_explainability: analysisResult.explainability || null,
            avatar_url: analysisResult.avatarUrl || avatarUrl,
          });
        } catch (analyzeErr) {
          console.warn('Post-link analysis failed:', analyzeErr);
          setAnalysisError('GitHub linked successfully! Analysis failed — try "Recalculate" later.');
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err: unknown) {
      const errorCode = (err as any)?.code;
      if (err instanceof Error) {
        if (errorCode === 'auth/credential-already-in-use') {
          setGithubLinkError('This GitHub account is already linked to another Codeprint account.');
        } else if (errorCode === 'auth/provider-already-linked') {
          setGithubLinkError('GitHub is already connected to your account.');
        } else if (errorCode === 'auth/operation-not-allowed') {
          setGithubLinkError('GitHub OAuth is not enabled in your Firebase Console. Enable GitHub under Authentication > Sign-in method.');
        } else if (errorCode === 'auth/popup-closed-by-user') {
          // User closed the popup — no error needed
        } else {
          setGithubLinkError(err.message);
        }
      } else {
        setGithubLinkError('Failed to connect GitHub account.');
      }
    } finally {
      setIsLinkingGithub(false);
    }
  };

  // ── GitHub OAuth Unlink Handler ──
  const handleUnlinkGithub = async () => {
    if (!auth.currentUser || !profile?.id) return;
    setIsUnlinkingGithub(true);

    try {
      await unlink(auth.currentUser, 'github.com');
      localStorage.removeItem(`codeprint_gh_access_token_${profile.id}`);
      localStorage.removeItem(`codeprint_gh_username_${profile.id}`);
      localStorage.removeItem(`codeprint_gh_result_${profile.id}`);

      await supabase.from('profiles').update({
        github_username: null,
        talent_score: null,
        github_stats: null,
        github_breakdown: null,
      }).eq('id', profile.id);

      setGithubUsername('');
      setGithubResult(null);
      setProfile({
        ...profile,
        github_username: undefined,
        talent_score: null,
        github_stats: null,
        github_breakdown: null,
      });
    } catch (err) {
      console.error('Failed to unlink GitHub:', err);
      setGithubLinkError('Failed to unlink GitHub. Please try again.');
    } finally {
      setIsUnlinkingGithub(false);
    }
  };

  const handleAnalyzeGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim() || !profile?.id) return;

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const response = await axios.post('/api/analyze-github', { username: githubUsername });
      const result = response.data;

      // Also fetch repos for Projects page
      try {
        const reposRes = await axios.get(`/api/github-repos/${githubUsername}`);
        onReposLoaded(reposRes.data.repos || []);
      } catch { /* ignore */ }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          github_username: githubUsername,
          talent_score: result.talentScore,
          github_stats: result.stats,
          github_breakdown: result.breakdown,
          github_freshness: result.freshness || null,
          github_explainability: result.explainability || null,
          avatar_url: result.avatarUrl
        } as any)
        .eq('id', profile.id);

      if (dbError) console.warn("Supabase update warning:", dbError.message);

      localStorage.setItem(`codeprint_gh_username_${profile.id}`, githubUsername);
      localStorage.setItem(`codeprint_gh_result_${profile.id}`, JSON.stringify({
        talentScore: result.talentScore,
        breakdown: result.breakdown || null,
        stats: result.stats,
        freshness: result.freshness || null,
        explainability: result.explainability || null,
        avatarUrl: result.avatarUrl || null,
        username: githubUsername,
      }));

      setGithubResult(result);
      setProfile({
        ...profile,
        github_username: githubUsername,
        talent_score: result.talentScore,
        github_stats: result.stats,
        github_breakdown: result.breakdown,
        github_freshness: result.freshness || null,
        github_explainability: result.explainability || null,
        avatar_url: result.avatarUrl
      });

      if (linkedinUrl || linkedinInput) {
        await runFullProfileAnalysis(result, linkedinUrl || linkedinInput, linkedinHeadline);
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.response?.data?.error || err.message || 'Failed to analyze GitHub');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchText.trim() || !profile?.id) return;

    setIsAnalyzingPitch(true);
    setPitchError('');

    try {
      const response = await axios.post('/api/analyze-pitch', { pitchText });
      const { score, feedback } = response.data;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ pitch_score: score, pitch_feedback: feedback })
        .eq('id', profile.id);

      if (dbError) console.warn("Supabase update warning:", dbError.message);

      setProfile({ ...profile, pitch_score: score, pitch_feedback: feedback });
      setPitchText('');
    } catch (err: any) {
      console.error(err);
      setPitchError(err.response?.data?.error || err.message || 'Failed to analyze Pitch');
    } finally {
      setIsAnalyzingPitch(false);
    }
  };

  const handleSaveLinkedin = async () => {
    if (!profile?.id) return;
    setSavingLinkedin(true);
    const cleanedUrl = linkedinInput.trim();
    const cleanedHeadline = linkedinHeadline.trim();
    
    localStorage.setItem(`codeprint_linkedin_url_${profile.id}`, cleanedUrl);
    localStorage.setItem(`codeprint_linkedin_headline_${profile.id}`, cleanedHeadline);

    try {
      await supabase.from('profiles').update({
        linkedin_url: cleanedUrl || null,
        linkedin_headline: cleanedHeadline || null,
      }).eq('id', profile.id);
    } catch (err) {
      console.warn('Supabase offline update warning for LinkedIn:', err);
    }

    setLinkedinUrl(cleanedUrl);
    setProfile({
      ...profile,
      linkedin_url: cleanedUrl,
      linkedin_headline: cleanedHeadline,
    });

    if (githubResult && cleanedUrl) {
      await runFullProfileAnalysis(githubResult, cleanedUrl, cleanedHeadline);
    }

    setLinkedinSaved(true);
    setTimeout(() => setLinkedinSaved(false), 2000);
    setSavingLinkedin(false);
  };

  const hasGithubData = githubResult && githubResult.talentScore != null;

  const accountAgeDays = githubResult?.stats?.accountAgeDays;
  const accountAgeLabel = accountAgeDays
    ? `${Math.floor(accountAgeDays / 365)}y ${Math.floor((accountAgeDays % 365) / 30)}m on GitHub`
    : null;

  return (
    <div className="space-y-6">
      {/* ── Profile Hero ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="soft-card rounded-xl p-6 md:p-8"
      >
        <div className="flex items-start gap-5">
          {githubResult?.avatarUrl ? (
            <motion.img
              src={githubResult.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border-soft"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-cream-dark flex items-center justify-center">
              <UserIcon className="w-9 h-9 text-ink-faint" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-ink tracking-tight">{profile?.full_name || 'Student'}</h1>
            <p className="text-sm text-ink-faint mt-0.5">{profile?.email}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile?.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink bg-cream-dark px-3 py-1.5 rounded-lg hover:bg-border-soft transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  @{profile.github_username}
                  <ExternalLink className="w-2.5 h-2.5 text-ink-faint" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A66C2] bg-sky-light px-3 py-1.5 rounded-lg hover:bg-sky-light/80 transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  LinkedIn
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {accountAgeLabel && (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint bg-cream-dark px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  {accountAgeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Connect GitHub + LinkedIn ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* GitHub — OAuth-first with manual fallback */}
        <div className="soft-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
            <GithubIcon className="w-4 h-4" />
            {hasGithubData ? 'GitHub Connected' : 'Connect GitHub'}
          </h3>

          {/* Connected state: show username, recalculate, and unlink */}
          {hasGithubData && githubUsername ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                {(profile?.avatar_url || (githubResult as any)?.avatarUrl) && (
                  <img
                    src={profile?.avatar_url || (githubResult as any)?.avatarUrl}
                    alt="GitHub avatar"
                    className="w-8 h-8 rounded-full border border-emerald-200 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900 truncate">@{githubUsername}</p>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isGithubLinkedViaOAuth ? 'OAuth connected' : 'Connected via username'}
                  </p>
                </div>
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.preventDefault(); handleAnalyzeGithub(e as any); }}
                  disabled={isAnalyzing}
                  className="flex-1 bg-ink text-cream py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Recalculate Score</>
                  )}
                </motion.button>

                {isGithubLinkedViaOAuth && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUnlinkGithub}
                    disabled={isUnlinkingGithub}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-rose border border-rose/30 hover:bg-rose-light transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    title="Disconnect GitHub account"
                  >
                    {isUnlinkingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            /* Not connected: OAuth button + manual fallback */
            <div className="space-y-3">
              <p className="text-xs text-ink-faint mb-2">
                Connect your GitHub account to automatically verify your developer profile and calculate your Talent Score.
              </p>

              {/* Primary: OAuth Connect Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLinkGithub}
                disabled={isLinkingGithub || isAnalyzing}
                className="w-full bg-[#24292F] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1B1F23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinkingGithub ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                ) : isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><GithubIcon className="w-4 h-4" /> <Link2 className="w-3.5 h-3.5" /> Connect with GitHub</>
                )}
              </motion.button>
            </div>
          )}

          {/* Error messages */}
          <AnimatePresence>
            {(analysisError || githubLinkError) && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-rose bg-rose-light p-2.5 rounded-lg mt-3"
              >
                {githubLinkError || analysisError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* LinkedIn */}
        <div className="soft-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
            <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
            Connect LinkedIn
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Add your LinkedIn URL and headline for AI profile analysis and resume generation.
          </p>
          <div className="space-y-3">
            <input
              type="url"
              value={linkedinInput}
              onChange={e => setLinkedinInput(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
            />
            <input
              type="text"
              value={linkedinHeadline}
              onChange={e => setLinkedinHeadline(e.target.value)}
              placeholder="LinkedIn headline (e.g. Full Stack Developer | React)"
              className="w-full px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveLinkedin}
              disabled={savingLinkedin}
              className="w-full bg-[#0A66C2] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0A66C2]/90 transition-colors disabled:opacity-50"
            >
              {savingLinkedin ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving & analyzing...</>
              ) : linkedinSaved ? (
                '✓ Saved!'
              ) : (
                'Save LinkedIn'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Score Breakdown + Ring ── */}
      <AnimatePresence>
        {hasGithubData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div className="soft-card rounded-xl p-6 flex flex-col items-center justify-center">
              <TalentScoreRing score={githubResult.talentScore} />
              {profile?.github_username && (
                <p className="text-[11px] text-ink-faint mt-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                  Verified via GitHub
                </p>
              )}
            </div>
            <div className="lg:col-span-2 soft-card rounded-xl p-6">
              {githubResult.breakdown ? (
                <ScoreBreakdown breakdown={githubResult.breakdown} freshness={githubResult.freshness} explainability={githubResult.explainability} />
              ) : (
                <div className="flex items-center justify-center h-full text-ink-faint text-sm">
                  Breakdown not available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GitHub Analytics ── */}
      <AnimatePresence>
        {hasGithubData && githubResult.stats && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
            className="soft-card rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-5 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-ink-faint" /> GitHub Analytics
            </h3>
            <GitHubStatsGrid stats={githubResult.stats} />

            {githubResult.stats.languages?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border-soft">
                <h4 className="text-[11px] font-semibold text-ink-faint uppercase tracking-widest mb-3">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {githubResult.stats.languages.map((lang: string, i: number) => (
                    <motion.span
                      key={lang}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 + i * 0.04 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cream-dark text-ink border border-border-soft/60"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: languageColors[lang] || '#A3A3A3' }}
                      />
                      {lang}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── AI Pitch Feedback (existing data) ── */}
      <AnimatePresence>
        {profile?.pitch_feedback && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="bg-ink rounded-xl p-6 md:p-8 text-cream"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber" /> AI Pitch Analysis
            </h3>
            {profile.pitch_score != null && (
              <p className="text-xs text-cream/40 mb-5">
                Score: <span className="text-amber font-bold">{profile.pitch_score}/100</span>
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'communication', label: 'Communication', color: 'text-sky', border: 'border-sky/20' },
                { key: 'technicalDepth', label: 'Technical Depth', color: 'text-sage', border: 'border-sage/20' },
                { key: 'clarity', label: 'Clarity', color: 'text-lavender', border: 'border-lavender/20' },
              ].map(item => (
                <div key={item.key} className={`border ${item.border} rounded-lg p-3.5 bg-white/5`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.label}</span>
                  <p className="text-xs text-cream/70 mt-1.5 leading-relaxed">
                    {profile.pitch_feedback[item.key]}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Pitch Analyzer Panel ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.2 }}
        className="soft-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
          <Presentation className="w-4 h-4" /> AI Pitch Analyzer
        </h3>
        <p className="text-xs text-ink-faint mb-4">
          Paste your presentation text for AI-powered feedback.
        </p>
        <form onSubmit={handleAnalyzePitch} className="space-y-3">
          <textarea
            value={pitchText}
            onChange={e => setPitchText(e.target.value)}
            placeholder="Paste the text content of your presentation deck here..."
            className="w-full min-h-[120px] px-3.5 py-2.5 bg-cream border border-border-soft rounded-xl text-sm text-ink placeholder:text-ink-faint resize-none focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isAnalyzingPitch || !pitchText.trim()}
            className="w-full bg-ink text-cream py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnalyzingPitch ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><FileText className="w-4 h-4" /> Run AI Analysis</>
            )}
          </motion.button>
          <AnimatePresence>
            {pitchError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-rose bg-rose-light p-2.5 rounded-lg"
              >
                {pitchError}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.section>

      {/* Pitch Analyser Link */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.25 }}
        className="soft-card rounded-2xl p-6 bg-gradient-to-r from-indigo-900 to-ink text-white flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Presentation className="w-5 h-5 text-indigo-400" /> Full AI Pitch Deck & PPT Analyser
          </h3>
          <p className="text-xs text-white/70 mt-1">Upload presentation files (.pdf, .pptx) for slide-by-slide AI analysis and feedback.</p>
        </div>
        <a
          href="/ppt-analyser"
          className="px-5 py-2.5 bg-sage hover:bg-sage-dark text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0"
        >
          Open Deck Analyser →
        </a>
      </motion.section>
    </div>
  );
}
