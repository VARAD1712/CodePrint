import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, GraduationCap, Building2 } from 'lucide-react';
import type { UserRole } from '../types';

interface HeroProps {
  onOpenAuth?: (type: UserRole) => void;
}

export function Hero({ onOpenAuth }: HeroProps) {
  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
      <div className="flex-1 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-deep-graphite leading-[1.1]">
            Verify developer talent by what they build, not what they claim.
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl text-slate-gray max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Resumes and projects are increasingly AI-generated. Codeprint cross-verifies GitHub commit history, resumes, and pitch decks into one auditable, explainable talent profile.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <button 
            onClick={() => onOpenAuth?.('student')}
            className="bg-charcoal text-warm-white px-6 py-3 rounded-md font-medium hover:bg-deep-graphite transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <GraduationCap className="w-5 h-5" /> Get Started as Student
          </button>
          <button 
            onClick={() => onOpenAuth?.('company')}
            className="bg-white border-2 border-stone-border text-deep-graphite px-6 py-3 rounded-md font-medium hover:bg-warm-white transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Building2 className="w-5 h-5" /> For Companies
          </button>
        </motion.div>
      </div>

      <motion.div 
        className="flex-1 w-full max-w-md lg:max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="bg-white border border-stone-border rounded-lg shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-border pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-deep-graphite">Candidate Profile</h3>
              <p className="text-sm text-slate-gray">ID: 8F92-AX · Full Stack Engineer</p>
            </div>
            <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-stone-border rounded-md bg-warm-white/50">
                <div className="text-xs text-slate-gray uppercase tracking-wider mb-1 font-semibold">Talent Score</div>
                <div className="text-2xl font-bold text-deep-graphite">92<span className="text-sm font-normal text-slate-gray">/100</span></div>
              </div>
              <div className="p-3 border border-stone-border rounded-md bg-warm-white/50">
                <div className="text-xs text-slate-gray uppercase tracking-wider mb-1 font-semibold">Pitch Score</div>
                <div className="text-2xl font-bold text-deep-graphite">88<span className="text-sm font-normal text-slate-gray">/100</span></div>
              </div>
            </div>

            <div className="p-4 border border-stone-border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-deep-graphite">Authenticity Flag</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Low Risk
                </span>
              </div>
              <p className="text-xs text-slate-gray leading-relaxed">
                GitHub commit timestamps align with claimed timezone. Language distribution (70% TS, 30% Rust) matches resume claims. No boilerplate AI artifacts detected in recent PRs.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
