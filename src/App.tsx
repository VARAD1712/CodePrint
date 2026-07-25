import { useEffect, useState, useCallback } from 'react';
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
import { AppShell } from './components/AppShell';
import { PageNavigation } from './components/PageNavigation';
import { auth } from './services/firebase';
import { supabase } from './services/supabase';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
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

        setProfile({
          ...(data as UserProfile || {}),
          id: uid,
          email: firebaseUser.email || (data as UserProfile)?.email || '',
          full_name: firebaseUser.displayName || (data as UserProfile)?.full_name || 'User',
          role: finalRole as UserRole,
        });

        if (data?.github_stats && data?.talent_score != null) {
          setGithubResult({
            talentScore: data.talent_score,
            breakdown: data.github_breakdown || null,
            stats: data.github_stats,
            avatarUrl: data.avatar_url || null,
            username: data.github_username || '',
          });

          if (data.github_username) {
            try {
              const reposRes = await axios.get(`/api/github-repos/${data.github_username}`);
              setRepos(reposRes.data.repos || []);
            } catch { /* ignore */ }
          }
        }

        if (data?.linkedin_url) setLinkedinUrl(data.linkedin_url);
        await refreshNotifications(uid);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        const activeRole = localStorage.getItem('codeprint_active_role');
        setProfile({
          id: uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'User',
          role: (activeRole as UserRole) || 'student',
        });
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

  const role: UserRole = profile.role || 'student';

  const handleUpdateProfile = async (name: string, email: string) => {
    await supabase.from('profiles').update({ full_name: name, email }).eq('id', profile.id);
    setProfile({ ...profile, full_name: name, email });
  };

  const handleUpdateGithub = async (username: string) => {
    await supabase.from('profiles').update({ github_username: username }).eq('id', profile.id);
    setProfile({ ...profile, github_username: username });
  };

  const handleUpdateLinkedin = async (url: string, headline?: string) => {
    await supabase.from('profiles').update({
      linkedin_url: url,
      ...(headline !== undefined ? { linkedin_headline: headline } : {}),
    }).eq('id', profile.id);
    setLinkedinUrl(url);
    setProfile({ ...profile, linkedin_url: url, linkedin_headline: headline ?? profile.linkedin_headline });
  };

  const shellProps = {
    profile,
    githubResult,
    role,
    notifications,
    onRefreshNotifications: () => refreshNotifications(profile.id),
  };

  if (role === 'company') {
    return (
      <AppShell {...shellProps}>
        <PageNavigation role="company" />
        <Routes>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="company/dashboard" element={<CompanyDashboard profile={profile} />} />
          <Route path="company/profile" element={<CompanyProfile profile={profile} />} />
          <Route path="company/portfolio" element={<CompanyPortfolio profile={profile} setProfile={setProfile} />} />
          <Route path="company/copilot" element={<CandidateDiscovery />} />
          <Route path="company/interviews" element={<CompanyInterviews profile={profile} />} />
          <Route path="company/ppt-analyser" element={<PitchAnalysis profile={profile} />} />
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
      <PageNavigation role="student" />
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
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </Router>
  );
}

export default App;
