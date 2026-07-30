import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Projects } from './pages/Projects';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Settings } from './pages/Settings';
import { StudentHome } from './pages/StudentHome';
import { CareerGuidance } from './pages/student/CareerGuidance';
import { AiInterview } from './pages/student/AiInterview';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { CandidateDiscovery } from './pages/company/CandidateDiscovery';
import { CompanyInterviews } from './pages/company/CompanyInterviews';
import { PitchAnalysis } from './pages/company/PitchAnalysis';
import { Portfolio } from './pages/Portfolio';
import { CompanyPortfolio } from './pages/company/CompanyPortfolio';
import { CinematicHero } from './pages/CinematicHero';
import { HackathonHub } from './pages/HackathonHub';
import { AppShell } from './components/AppShell';
import { PageNavigation } from './components/PageNavigation';
import { auth } from './services/firebase';
import { supabase } from './services/supabase';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { authService } from './services/apiClient';
import type { Profile as UserProfile, GitHubResult, Repo, Notification, UserRole } from './types';

function AuthenticatedApp() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubResult, setGithubResult] = useState<GitHubResult | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  }, []);

  useEffect(() => {
    const fetchProfile = async (uid: string, firebaseUser: { email: string | null; displayName: string | null }, retries = 3) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (error) throw error;
        
        if (!data && retries > 0) {
          // Race condition: AuthModal is still creating the profile
          setTimeout(() => fetchProfile(uid, firebaseUser, retries - 1), 1000);
          return;
        }

        const dbRole = data?.role;
        const activeRole = localStorage.getItem('codeprint_active_role');
        const finalRole = activeRole || dbRole || 'student';

        const storedGhUsername = localStorage.getItem(`codeprint_gh_username_${uid}`) || '';
        const storedLinkedin = localStorage.getItem(`codeprint_linkedin_url_${uid}`) || '';
        const storedHeadline = localStorage.getItem(`codeprint_linkedin_headline_${uid}`) || '';
        const storedGhResult = localStorage.getItem(`codeprint_gh_result_${uid}`);

        const oauthGhUsername = auth.currentUser?.providerData?.find(p => p.providerId === 'github.com')?.displayName || (firebaseUser as any)?.providerData?.find((p: any) => p.providerId === 'github.com')?.displayName || '';
        const finalGhUsername = data?.github_username || storedGhUsername || oauthGhUsername;
        if (finalGhUsername && !storedGhUsername) {
          localStorage.setItem(`codeprint_gh_username_${uid}`, finalGhUsername);
        }
        const finalLinkedinUrl = data?.linkedin_url || storedLinkedin;
        const finalHeadline = data?.linkedin_headline || storedHeadline;

        const finalName = firebaseUser.displayName || (data as UserProfile)?.full_name || 'User';
        const finalRoleType = finalRole as UserRole;
        setProfile({
          ...(data as UserProfile || {}),
          id: uid,
          email: firebaseUser.email || (data as UserProfile)?.email || '',
          full_name: finalName,
          role: finalRoleType,
          github_username: finalGhUsername,
          linkedin_url: finalLinkedinUrl,
          linkedin_headline: finalHeadline,
        });

        // Ensure active JWT authorization token is negotiated and saved
        await authService.negotiateToken(uid, firebaseUser.email || null, finalRoleType, finalName);

        if (data?.github_stats && data?.talent_score != null) {
          setGithubResult({
            talentScore: data.talent_score,
            breakdown: data.github_breakdown || null,
            stats: data.github_stats,
            freshness: (data as any).github_freshness || null,
            explainability: (data as any).github_explainability || null,
            avatarUrl: data.avatar_url || null,
            username: finalGhUsername,
          });
        } else if (storedGhResult) {
          try {
            const parsed = JSON.parse(storedGhResult);
            setGithubResult(parsed);
          } catch { /* ignore */ }
        }

        if (finalGhUsername) {
          try {
            const reposRes = await axios.get(`/api/github-repos/${finalGhUsername}`);
            setRepos(reposRes.data.repos || []);
          } catch { /* ignore */ }
        }

        if (finalLinkedinUrl) setLinkedinUrl(finalLinkedinUrl);
        await refreshNotifications(uid);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        const activeRole = localStorage.getItem('codeprint_active_role');
        const storedGhUsername = localStorage.getItem(`codeprint_gh_username_${uid}`) || '';
        const oauthGhUsername = auth.currentUser?.providerData?.find(p => p.providerId === 'github.com')?.displayName || (firebaseUser as any)?.providerData?.find((p: any) => p.providerId === 'github.com')?.displayName || '';
        const finalGhUsername = storedGhUsername || oauthGhUsername;
        const storedLinkedin = localStorage.getItem(`codeprint_linkedin_url_${uid}`) || '';
        const storedHeadline = localStorage.getItem(`codeprint_linkedin_headline_${uid}`) || '';
        const storedGhResult = localStorage.getItem(`codeprint_gh_result_${uid}`);

        setProfile({
          id: uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'User',
          role: (activeRole as UserRole) || 'student',
          github_username: finalGhUsername,
          linkedin_url: storedLinkedin,
          linkedin_headline: storedHeadline,
        });

        if (storedGhResult) {
          try {
            setGithubResult(JSON.parse(storedGhResult));
          } catch { /* ignore */ }
        }
        if (storedGhUsername) {
          try {
            const reposRes = await axios.get(`/api/github-repos/${storedGhUsername}`);
            setRepos(reposRes.data.repos || []);
          } catch { /* ignore */ }
        }
        if (storedLinkedin) setLinkedinUrl(storedLinkedin);
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile(user.uid, user);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, refreshNotifications]);

  const role: UserRole = profile?.role || 'student';

  const prefetchedRef = useRef<Record<string, boolean>>({});

  const handlePrefetchRoute = useCallback(async (routePath: string) => {
    if (prefetchedRef.current[routePath] || !profile) return;
    prefetchedRef.current[routePath] = true;

    // Prefetch GitHub repos when intending to view projects or portfolio
    if ((routePath.includes('projects') || routePath.includes('portfolio') || routePath.includes('resume')) && repos.length === 0) {
      const ghUser = profile.github_username || localStorage.getItem(`codeprint_gh_username_${profile.id}`) || '';
      if (ghUser) {
        try {
          const res = await axios.get(`/api/github-repos/${ghUser}`);
          if (res.data?.repos) setRepos(res.data.repos);
        } catch (e) { /* ignore prefetch error */ }
      }
    }

    // Prefetch AI Career Guidance insights into localStorage when intending to view Career AI
    if (routePath.includes('career')) {
      const cacheKey = `codeprint_career_guidance_${profile.id}`;
      if (!localStorage.getItem(cacheKey)) {
        try {
          const res = await axios.post('/api/career-guidance', {
            targetRole: 'Full Stack AI Developer',
            skills: profile.github_stats || 'React, Node, Python, AI',
            experienceLevel: 'Student / Fresher'
          });
          if (res.data?.success && res.data?.analysis) {
            localStorage.setItem(cacheKey, res.data.analysis);
          }
        } catch (e) { /* ignore prefetch error */ }
      }
    }
  }, [profile, repos.length]);

  const handleUpdateProfile = useCallback(async (name: string, email: string) => {
    if (!profile) return;
    try {
      await supabase.from('profiles').update({ full_name: name, email }).eq('id', profile.id);
    } catch (e) { console.warn(e); }
    setProfile(prev => prev ? { ...prev, full_name: name, email } : null);
  }, [profile]);

  const handleUpdateGithub = useCallback(async (username: string) => {
    if (!profile) return;
    localStorage.setItem(`codeprint_gh_username_${profile.id}`, username);
    try {
      await supabase.from('profiles').update({ github_username: username }).eq('id', profile.id);
    } catch (e) { console.warn('Supabase offline fallback:', e); }
    setProfile(prev => prev ? { ...prev, github_username: username } : null);
  }, [profile]);

  const handleUpdateLinkedin = useCallback(async (url: string, headline?: string) => {
    if (!profile) return;
    localStorage.setItem(`codeprint_linkedin_url_${profile.id}`, url);
    if (headline !== undefined) localStorage.setItem(`codeprint_linkedin_headline_${profile.id}`, headline);
    try {
      await supabase.from('profiles').update({
        linkedin_url: url,
        ...(headline !== undefined ? { linkedin_headline: headline } : {}),
      }).eq('id', profile.id);
    } catch (e) { console.warn('Supabase offline fallback:', e); }
    setLinkedinUrl(url);
    setProfile(prev => prev ? { ...prev, linkedin_url: url, linkedin_headline: headline ?? prev.linkedin_headline } : null);
  }, [profile]);

  const onRefreshNotificationsCallback = useCallback(() => {
    if (profile?.id) refreshNotifications(profile.id);
  }, [profile?.id, refreshNotifications]);

  const shellProps = useMemo(() => ({
    profile: profile || ({} as UserProfile),
    githubResult,
    role,
    notifications,
    onRefreshNotifications: onRefreshNotificationsCallback,
    onPrefetch: handlePrefetchRoute,
  }), [profile, githubResult, role, notifications, onRefreshNotificationsCallback, handlePrefetchRoute]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-ink-faint" />
          <span className="text-sm text-ink-faint font-medium">Loading your profile...</span>
        </motion.div>
      </div>
    );
  }

  if (role === 'company') {
    return (
      <AppShell {...shellProps}>
        <PageNavigation role="company" onPrefetch={handlePrefetchRoute} />
        <Routes>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="company/dashboard" element={<CompanyDashboard profile={profile} />} />
          <Route path="company/profile" element={<CompanyProfile profile={profile} />} />
          <Route path="company/portfolio" element={<CompanyPortfolio profile={profile} setProfile={setProfile} />} />
          <Route path="company/copilot" element={<CandidateDiscovery />} />
          <Route path="company/interviews" element={<CompanyInterviews profile={profile} />} />
          <Route path="company/ppt-analyser" element={<PitchAnalysis profile={profile} />} />
          <Route path="company/hackathons" element={<HackathonHub role="company" />} />
          <Route
            path="company/settings"
            element={
              <Settings
                profile={profile}
                githubUsername={profile.github_username || ''}
                linkedinUrl={linkedinUrl}
                onUpdateGithub={handleUpdateGithub}
                onUpdateLinkedin={handleUpdateLinkedin}
                onUpdateProfile={handleUpdateProfile}
              />
            }
          />
        </Routes>
      </AppShell>
    );
  }

  return (
    <AppShell {...shellProps}>
      <PageNavigation role="student" onPrefetch={handlePrefetchRoute} />
      <Routes>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<StudentHome profile={profile} />} />
        <Route
          path="dashboard"
          element={<Dashboard profile={profile} githubResult={githubResult} repos={repos} />}
        />
        <Route
          path="profile"
          element={
            <Profile
              profile={profile}
              setProfile={setProfile}
              githubResult={githubResult}
              setGithubResult={setGithubResult}
              linkedinUrl={linkedinUrl}
              setLinkedinUrl={setLinkedinUrl}
              onReposLoaded={setRepos}
              onProfileAnalyzed={(updated) => setProfile({ ...profile, ...updated })}
            />
          }
        />
        <Route
          path="portfolio"
          element={<Portfolio profile={profile} setProfile={setProfile} githubRepos={repos} />}
        />
        <Route
          path="projects"
          element={<Projects repos={repos} githubUsername={profile.github_username || githubResult?.username || ''} />}
        />
        <Route
          path="resume"
          element={
            <ResumeBuilder
              profile={profile}
              githubResult={githubResult}
              repos={repos}
              linkedinUrl={linkedinUrl}
            />
          }
        />
        <Route
          path="career"
          element={<CareerGuidance profile={profile} />}
        />
        <Route
          path="interview"
          element={<AiInterview profile={profile} />}
        />
        <Route
          path="ppt-analyser"
          element={<PitchAnalysis profile={profile} />}
        />
        <Route
          path="hackathons"
          element={<HackathonHub role="student" />}
        />
        <Route
          path="settings"
          element={
            <Settings
              profile={profile}
              githubUsername={profile.github_username || ''}
              linkedinUrl={linkedinUrl}
              onUpdateGithub={handleUpdateGithub}
              onUpdateLinkedin={handleUpdateLinkedin}
              onUpdateProfile={handleUpdateProfile}
            />
          }
        />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cinematic" element={<CinematicHero />} />
        <Route path="/hero" element={<CinematicHero />} />
        <Route path="/streaming" element={<CinematicHero />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </Router>
  );
}

export default App;
