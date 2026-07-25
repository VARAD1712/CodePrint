import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Briefcase, Loader2, CheckCircle2, Brain, Zap, ArrowRight, Award } from 'lucide-react';
import { supabase } from '../services/supabase';
import { recruitmentService } from '../services/recruitmentService';
import { AssessmentTakerModal } from '../components/AssessmentTakerModal';
import type { Profile, Recruitment, Application } from '../types';

interface CompanyProfileData {
  id: string;
  full_name?: string;
  company_name?: string;
  company_culture?: string;
  company_values?: string[];
  testimonials?: { name: string; role: string; text: string }[];
  alumni_stories?: { name: string; role: string; story: string }[];
}

interface StudentHomeProps {
  profile: Profile;
}

export function StudentHome({ profile }: StudentHomeProps) {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfileData | null>(null);
  const [activeAssessmentJob, setActiveAssessmentJob] = useState<Recruitment | null>(null);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    setLoading(true);
    const [jobs, apps] = await Promise.all([
      recruitmentService.getRecruitments(),
      recruitmentService.getApplications({ studentId: profile.id })
    ]);
    setRecruitments(jobs);
    setApplications(apps);
    setLoading(false);
  };

  const getApplication = (recruitmentId: string) =>
    applications.find(a => a.recruitment_id === recruitmentId);

  const handleApply = async (recruitment: Recruitment) => {
    if (recruitment.mock_test && recruitment.mock_test.enabled && recruitment.mock_test.questions.length > 0) {
      setActiveAssessmentJob(recruitment);
      return;
    }

    setApplying(recruitment.id);
    try {
      const aiScore = profile.ai_profile_score ?? profile.talent_score ?? 85;
      await recruitmentService.submitApplication({
        recruitment_id: recruitment.id,
        student_id: profile.id,
        status: 'pending',
        ai_match_score: aiScore,
        fraud_risk_level: 'low',
        profiles: profile,
        recruitments: recruitment
      });

      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      alert(message);
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Assessment Modal */}
      {activeAssessmentJob && (
        <AssessmentTakerModal
          recruitment={activeAssessmentJob}
          profile={profile}
          onClose={() => setActiveAssessmentJob(null)}
          onApplicationSubmitted={async () => {
            await loadData();
          }}
        />
      )}

      {/* Company Profile Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCompany(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-border-soft"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-border-soft pb-4">
              <div>
                <h2 className="text-2xl font-black text-ink">
                  {selectedCompany.company_name || selectedCompany.full_name || 'Company Profile'}
                </h2>
                <p className="text-xs text-ink-light font-semibold uppercase tracking-wider mt-1">Employer Branding & Tech Culture</p>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="p-2 bg-cream hover:bg-cream-dark rounded-full transition-colors text-ink-faint hover:text-ink font-bold">
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {selectedCompany.company_culture ? (
                <div className="bg-gradient-to-r from-sage/10 to-transparent p-5 rounded-2xl border border-sage/20">
                  <h3 className="font-extrabold text-sm text-sage mb-2 flex items-center gap-2"><Building2 className="w-4 h-4"/> Engineering Culture</h3>
                  <p className="text-xs text-ink-light leading-relaxed whitespace-pre-wrap font-medium">{selectedCompany.company_culture}</p>
                </div>
              ) : (
                <div className="p-4 bg-cream/50 rounded-2xl text-center text-xs text-ink-faint">
                  Verified Enterprise Tech Employer on CodePrint
                </div>
              )}
              
              {selectedCompany.company_values && selectedCompany.company_values.length > 0 && (
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-ink mb-3">Core Engineering Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.company_values.map((v, i) => (
                      <span key={i} className="px-3 py-1 bg-sage/10 text-sage border border-sage/20 text-xs font-bold rounded-xl">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="bg-gradient-to-r from-ink via-ink to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-white/10"
      >
        <div className="space-y-2 relative z-10 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full text-indigo-300 backdrop-blur-md inline-block">
            Tier-1 Talent Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Open Recruitments & Assessments
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed font-medium">
            Browse live opportunities posted by verified tech enterprises. Pass company qualification mock tests to immediately verify your expertise and boost application prominence.
          </p>
        </div>
      </motion.div>

      {recruitments.length === 0 ? (
        <div className="soft-card rounded-3xl p-16 text-center border border-dashed border-border-soft">
          <Building2 className="w-12 h-12 text-sage opacity-40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-ink">No open positions published yet</h3>
          <p className="text-xs text-ink-light mt-1 max-w-md mx-auto">Check back soon as top companies actively launch recruitment pipelines and technical challenges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recruitments.map((rec, i) => {
            const company = rec.profiles as { full_name?: string; company_name?: string; company_culture?: string } | undefined;
            const app = getApplication(rec.id);
            const hasMockTest = rec.mock_test && rec.mock_test.enabled && rec.mock_test.questions.length > 0;

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="soft-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all border border-border-soft hover:border-ink/10 bg-white group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-extrabold text-base shadow-sm">
                        {(company?.company_name || company?.full_name || 'C')[0].toUpperCase()}
                      </div>
                      <div className="cursor-pointer group-hover:translate-x-0.5 transition-transform" onClick={() => setSelectedCompany(company as CompanyProfileData)}>
                        <h3 className="text-lg font-extrabold text-ink group-hover:text-indigo-700 transition-colors">{rec.title}</h3>
                        <p className="text-xs text-ink-light font-bold flex items-center gap-1 mt-0.5">
                          {company?.company_name || company?.full_name || 'Verified Tech Employer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {rec.description && (
                    <p className="text-xs sm:text-sm text-ink-light mb-4 line-clamp-3 leading-relaxed font-normal">{rec.description}</p>
                  )}

                  {rec.skills && rec.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rec.skills.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-cream-dark text-ink-light font-bold text-[11px] rounded-lg">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-faint mb-5 pt-3 border-t border-border-soft">
                    <span className="flex items-center gap-1 bg-cream px-2.5 py-1 rounded-lg text-ink">
                      <Briefcase className="w-3.5 h-3.5 text-sage" /> {rec.role_type}
                    </span>
                    {hasMockTest && (
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-black px-2.5 py-1 rounded-lg">
                        <Brain className="w-3.5 h-3.5 text-indigo-600" /> Mock Test Required ({rec.mock_test?.passing_percentage}% Pass)
                      </span>
                    )}
                  </div>
                </div>

                {app ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Applied ({app.status.toUpperCase()})
                    </span>
                    {app.assessment_score !== undefined && app.assessment_score !== null && (
                      <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 text-emerald-700 font-black">
                        Assessment Score: {app.assessment_score}%
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(rec)}
                    disabled={applying === rec.id}
                    className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                      hasMockTest
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-indigo-200'
                        : 'bg-ink hover:bg-ink/90 text-white shadow-sm'
                    }`}
                  >
                    {applying === rec.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : hasMockTest ? (
                      <><Brain className="w-4 h-4" /> Take Qualification Assessment & Apply <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      'Direct One-Click Apply'
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
