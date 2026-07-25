import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Code2, Target, Users, Loader2 } from 'lucide-react';
import type { Profile } from '../../types';

interface CandidateMatchEngineProps {
  candidate: Profile;
  onBack: () => void;
}

export function CandidateMatchEngine({ candidate, onBack }: CandidateMatchEngineProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI match engine processing
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-sage" />
        <h2 className="text-xl font-bold text-ink">AI Match Engine Running...</h2>
        <p className="text-ink-light">Analyzing {candidate.full_name}'s profile against your requirements</p>
      </div>
    );
  }

  // Simulated match data
  const matchScore = candidate.ai_profile_score || 85;
  const projectAnalysis = "Strong full-stack capabilities demonstrated across 4 major repositories. The candidate uses modern React patterns and has excellent test coverage.";
  const culturalFit = "High alignment with your core value of 'Innovation'. The candidate frequently contributes to open-source and participates in hackathons, showing proactive learning.";
  
  return (
    <div className="space-y-6 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-ink-light hover:text-ink font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Discovery
      </button>

      <div className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border-soft pb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink">{candidate.full_name}</h1>
            <p className="text-ink-light mt-1">{candidate.college}</p>
          </div>
          <div className="flex flex-col items-end">
             <div className="text-5xl font-black text-sage flex items-center gap-2">
                {matchScore}% <Sparkles className="w-8 h-8" />
             </div>
             <p className="text-sm font-bold text-ink-light uppercase tracking-wider mt-1">AI Match Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-cream-dark/30 p-6 rounded-xl border border-border">
               <div className="flex items-center gap-2 mb-3">
                 <Code2 className="w-5 h-5 text-sky" />
                 <h3 className="font-bold text-ink">Skill Summary Analysis</h3>
               </div>
               <p className="text-sm text-ink leading-relaxed">
                 The candidate matches 80% of your required technical skills. Strong proficiency in 
                 <span className="font-bold text-sky"> React</span> and <span className="font-bold text-sky">Node.js</span>. 
                 Gap identified in <span className="font-bold text-rose">Docker</span> containerization.
               </p>
            </div>

            <div className="bg-cream-dark/30 p-6 rounded-xl border border-border">
               <div className="flex items-center gap-2 mb-3">
                 <Target className="w-5 h-5 text-lavender" />
                 <h3 className="font-bold text-ink">Project Analysis</h3>
               </div>
               <p className="text-sm text-ink leading-relaxed">
                 {projectAnalysis}
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-cream-dark/30 p-6 rounded-xl border border-border">
               <div className="flex items-center gap-2 mb-3">
                 <Users className="w-5 h-5 text-sage" />
                 <h3 className="font-bold text-ink">Cultural Fit Analysis</h3>
               </div>
               <p className="text-sm text-ink leading-relaxed">
                 {culturalFit}
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
