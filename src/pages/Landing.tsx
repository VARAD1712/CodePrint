import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { FeatureTabs } from '../components/FeatureTabs';
import { Workflow } from '../components/Workflow';
import { ArchitectureGrid } from '../components/ArchitectureGrid';
import { MetricsBanner } from '../components/MetricsBanner';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { supabase } from '../services/supabase';
import type { UserRole } from '../types';

export function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthType, setInitialAuthType] = useState<UserRole>('student');
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend...');
  const navigate = useNavigate();

  const redirectByRole = async (uid: string, retries = 3) => {
    const activeRole = localStorage.getItem('codeprint_active_role');
    if (activeRole === 'company' || activeRole === 'student') {
      navigate(activeRole === 'company' ? '/company/dashboard' : '/home');
      return;
    }
    const { data } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
    if (!data && retries > 0) {
      setTimeout(() => redirectByRole(uid, retries - 1), 1000);
      return;
    }
    const role = (data?.role as UserRole) || 'student';
    navigate(role === 'company' ? '/company/dashboard' : '/home');
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        redirectByRole(user.uid);
      }
    });

    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message || 'Connected to backend'))
      .catch(() => setBackendStatus('Backend unavailable'));

    return () => unsubscribe();
  }, [navigate]);

  const handleAuthSuccess = (role: UserRole) => {
    localStorage.setItem('codeprint_active_role', role);
    navigate(role === 'company' ? '/company/dashboard' : '/home');
  };

  const openAuth = (type: UserRole) => {
    setInitialAuthType(type);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans text-deep-graphite selection:bg-slate-gray/20">
      <nav className="w-full border-b border-stone-border bg-warm-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-deep-graphite">Codeprint</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-gray">
            <a href="#pipeline" className="hover:text-deep-graphite transition-colors">The Pipeline</a>
            <a href="#features" className="hover:text-deep-graphite transition-colors">Flagship Features</a>
            <button
              onClick={() => openAuth('student')}
              className="bg-charcoal text-warm-white px-5 py-2 text-sm font-medium rounded-md hover:bg-deep-graphite transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-charcoal text-warm-white text-center py-2 text-sm font-medium border-b border-white/10">
        <span className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendStatus.includes('running smoothly') ? 'bg-green-400' : 'bg-red-500'}`} />
          Backend API Status: {backendStatus}
        </span>
      </div>

      <main className="flex-1">
        <Hero onOpenAuth={openAuth} />
        <FeatureTabs />
        <Workflow />
        <ArchitectureGrid />
        <MetricsBanner />
      </main>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialAccountType={initialAuthType}
      />
    </div>
  );
}
