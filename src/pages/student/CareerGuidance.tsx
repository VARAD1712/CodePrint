import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, BookOpen, TrendingUp, Sparkles, Code2, Briefcase } from 'lucide-react';
import axios from 'axios';
import type { Profile } from '../../types';

interface CareerGuidanceProps {
  profile: Profile;
}

export function CareerGuidance({ profile }: CareerGuidanceProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [data, setData] = useState({
    provider: 'CodePrint AI Market Advisor',
    marketInsights: '',
    skillGaps: [
      { skill: 'React Native', current: 20, required: 80 },
      { skill: 'System Design', current: 40, required: 90 },
      { skill: 'GraphQL', current: 30, required: 70 },
      { skill: 'AWS', current: 50, required: 85 },
    ],
    recommendations: [
      { title: 'Advanced System Design', platform: 'Educative', type: 'Course' },
      { title: 'AWS Certified Solutions Architect', platform: 'Amazon', type: 'Certification' },
      { title: 'GraphQL with Apollo', platform: 'Udemy', type: 'Course' },
    ],
    roadmap: [
      { year: 'Year 1', role: 'Frontend Engineer', milestone: 'Master React & Next.js ecosystem' },
      { year: 'Year 2-3', role: 'Full Stack Developer', milestone: 'Integrate Node.js & Cloud services' },
      { year: 'Year 4-5', role: 'Senior Software Engineer', milestone: 'Lead architecture & system design' },
    ],
    salary: {
      current: '$85,000',
      predicted: '$120,000',
      timeline: '24 months'
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await axios.post('/api/career-guidance', {
        profile,
        skills: profile.skills || ['React', 'TypeScript', 'Node.js', 'Python'],
        role: 'Full Stack & AI Systems Developer'
      });
      if (res.data) {
        setData(prev => ({
          ...prev,
          ...res.data,
          skillGaps: res.data.skillGaps || prev.skillGaps,
          recommendations: res.data.recommendations || prev.recommendations,
          roadmap: res.data.roadmap || prev.roadmap,
          salary: res.data.salary || prev.salary,
          provider: res.data.provider || prev.provider,
          marketInsights: res.data.marketInsights || ''
        }));
      }
    } catch (error) {
      console.error('AI market analysis failed, using fallback metrics:', error);
    } finally {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }
  };

  if (!hasAnalyzed) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-3xl p-12 shadow-sm border border-border-soft relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender/10 text-lavender rounded-full text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Integrated with Tech Market AI Intelligence
          </div>
          <Brain className="w-16 h-16 text-lavender mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-ink mb-4">AI Career Guidance & Market Intelligence</h1>
          <p className="text-ink-light max-w-xl mx-auto mb-8">
            Our hybrid AI analysis engine evaluates live tech industry demand, GitHub stats, and salary trends to craft your custom career roadmap and skill gap evaluation.
          </p>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-8 py-4 bg-ink text-white rounded-xl font-medium hover:bg-ink/90 transition-all shadow-md shadow-ink/10 flex items-center gap-3 mx-auto relative z-10 cursor-pointer"
          >
            {isAnalyzing ? (
              <><Sparkles className="w-5 h-5 animate-pulse text-lavender-light" /> Querying AI Advisor...</>
            ) : (
              <><Target className="w-5 h-5" /> Generate Live Career Path</>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender/10 text-lavender rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by {data.provider}
          </div>
          <h1 className="text-2xl font-bold text-ink">Your Career Profile</h1>
          <p className="text-ink-light text-sm max-w-2xl">
            {data.marketInsights ? `📈 Real-time Market Insight: ${data.marketInsights}` : 'AI-generated insights based on your skills and market trends.'}
          </p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-cream text-ink font-medium rounded-lg border border-border hover:bg-cream-dark transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-lavender" /> {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze Career Path'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Skill Gap & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-lavender/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-lavender" />
              </div>
              <h2 className="text-lg font-bold text-ink">Skill Gap Analysis</h2>
            </div>
            <div className="space-y-5">
              {data.skillGaps.map((gap, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-ink">{gap.skill}</span>
                    <span className="text-ink-light">{gap.current}% / {gap.required}%</span>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-sky/30 rounded-full" 
                      style={{ width: `${gap.required}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-lavender rounded-full" 
                      style={{ width: `${gap.current}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-sky/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-sky" />
              </div>
              <h2 className="text-lg font-bold text-ink">Recommended Learning</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-cream/50 hover:bg-cream transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky mb-2 block">{rec.type}</span>
                  <h3 className="font-semibold text-ink mb-1">{rec.title}</h3>
                  <p className="text-sm text-ink-light">via {rec.platform}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Salary & Roadmap */}
        <div className="space-y-6">
          {/* Salary Prediction */}
          <div className="bg-ink text-white rounded-2xl p-6 shadow-lg shadow-ink/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-lavender-light" />
              </div>
              <h2 className="text-lg font-bold">Salary Prediction</h2>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-white/60 text-sm">Current Market Value</p>
                <p className="text-2xl font-bold">{data.salary.current}</p>
              </div>
              <div className="h-px bg-white/10 w-full"></div>
              <div>
                <p className="text-white/60 text-sm">Predicted Potential ({data.salary.timeline})</p>
                <p className="text-3xl font-bold text-lavender-light">{data.salary.predicted}</p>
              </div>
            </div>
          </div>

          {/* Career Roadmap */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sage" />
              </div>
              <h2 className="text-lg font-bold text-ink">Career Roadmap</h2>
            </div>
            <div className="relative border-l-2 border-cream ml-3 space-y-6">
              {data.roadmap.map((step, i) => (
                <div key={i} className="pl-6 relative">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-sage"></div>
                  <span className="text-xs font-bold text-sage mb-1 block">{step.year}</span>
                  <h3 className="font-semibold text-ink text-sm">{step.role}</h3>
                  <p className="text-sm text-ink-light mt-1">{step.milestone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
