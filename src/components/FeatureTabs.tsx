import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Presentation, ShieldCheck, Zap, LineChart, FileSearch } from 'lucide-react';

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState<'ppt' | 'fraud'>('ppt');

  return (
    <section id="features" className="py-24 bg-white border-y border-stone-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-graphite mb-4 tracking-tight">The Flagship Spike</h2>
          <p className="text-slate-gray max-w-2xl mx-auto">
            Our dual-engine architecture goes beyond static resumes, evaluating both technical execution and presentation clarity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:w-1/3 pb-4 md:pb-0">
            <button
              onClick={() => setActiveTab('ppt')}
              className={`flex-shrink-0 text-left px-5 py-4 rounded-lg border transition-all ${
                activeTab === 'ppt'
                  ? 'bg-warm-white border-charcoal shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-warm-white/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Presentation className={`w-5 h-5 ${activeTab === 'ppt' ? 'text-charcoal' : 'text-slate-gray'}`} />
                <h3 className={`font-semibold ${activeTab === 'ppt' ? 'text-deep-graphite' : 'text-slate-gray'}`}>
                  AI PPT Analyzer
                </h3>
              </div>
              <p className={`text-sm ${activeTab === 'ppt' ? 'text-slate-gray' : 'text-slate-gray/70'} hidden md:block`}>
                Presentation intelligence scoring and boilerplate detection.
              </p>
            </button>
            
            <button
              onClick={() => setActiveTab('fraud')}
              className={`flex-shrink-0 text-left px-5 py-4 rounded-lg border transition-all ${
                activeTab === 'fraud'
                  ? 'bg-warm-white border-charcoal shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-warm-white/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className={`w-5 h-5 ${activeTab === 'fraud' ? 'text-charcoal' : 'text-slate-gray'}`} />
                <h3 className={`font-semibold ${activeTab === 'fraud' ? 'text-deep-graphite' : 'text-slate-gray'}`}>
                  Fraud Prevention
                </h3>
              </div>
              <p className={`text-sm ${activeTab === 'fraud' ? 'text-slate-gray' : 'text-slate-gray/70'} hidden md:block`}>
                Cross-reference claims against GitHub history.
              </p>
            </button>
          </div>

          <div className="flex-1 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'ppt' ? (
                <motion.div
                  key="ppt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-warm-white border border-stone-border rounded-xl p-8 h-full"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-deep-graphite">Live Pitch Evaluation</h4>
                    <span className="px-3 py-1 bg-charcoal text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Processing Deck
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-deep-graphite">Innovation & Feasibility</span>
                        <span className="font-bold text-deep-graphite">85/100</span>
                      </div>
                      <div className="w-full bg-stone-border h-2 rounded-full overflow-hidden">
                        <div className="bg-charcoal h-full w-[85%]"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-deep-graphite">Technical Clarity</span>
                        <span className="font-bold text-deep-graphite">92/100</span>
                      </div>
                      <div className="w-full bg-stone-border h-2 rounded-full overflow-hidden">
                        <div className="bg-charcoal h-full w-[92%]"></div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h5 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <FileSearch className="w-4 h-4" /> AI Boilerplate Detected
                      </h5>
                      <p className="text-sm text-amber-800/80">
                        Slide 4 ("Market Opportunity") contains high-probability AI-generated phrasing. Recommend human review of business model specifics.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="fraud"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-warm-white border border-stone-border rounded-xl p-8 h-full"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-deep-graphite">Authenticity Analysis</h4>
                    <span className="px-3 py-1 bg-white border border-stone-border text-deep-graphite text-xs font-medium rounded-full flex items-center gap-1">
                      <LineChart className="w-3 h-3" /> Real-time Sync
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-white border border-stone-border rounded-md">
                      <div className="flex justify-between items-center border-b border-stone-border pb-3 mb-3">
                        <span className="text-sm font-medium text-slate-gray">Skill Claim</span>
                        <span className="text-sm font-bold text-deep-graphite">"Expert in Rust"</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-gray">GitHub Reality</span>
                        <span className="text-sm text-slate-gray">3 commits in past 12 months</span>
                      </div>
                      <div className="mt-3 text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                        Discrepancy Flagged
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-stone-border rounded-md">
                      <div className="flex justify-between items-center border-b border-stone-border pb-3 mb-3">
                        <span className="text-sm font-medium text-slate-gray">Certificate Claim</span>
                        <span className="text-sm font-bold text-deep-graphite">AWS Solutions Architect</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-gray">Validation</span>
                        <span className="text-sm text-slate-gray">Verified via Credly API</span>
                      </div>
                      <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded inline-block">
                        Authentic
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
