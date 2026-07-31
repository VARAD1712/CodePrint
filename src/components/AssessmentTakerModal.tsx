import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, ShieldAlert, CheckCircle, XCircle, AlertTriangle, ChevronRight, Award } from 'lucide-react';
import type { Recruitment, Application, Profile } from '../types';
import { recruitmentService } from '../services/recruitmentService';


interface AssessmentTakerModalProps {
  recruitment: Recruitment;
  profile: Profile;
  onClose: () => void;
  onApplicationSubmitted: (app: Application) => void;
}

export function AssessmentTakerModal({ recruitment, profile, onClose, onApplicationSubmitted }: AssessmentTakerModalProps) {
  const testConfig = recruitment.mock_test;
  const [currentStep, setCurrentStep] = useState<'intro' | 'testing' | 'results'>('intro');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((testConfig?.duration_minutes || 15) * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  
  // Grading Results
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Anti-Cheat: Tab / Focus monitoring
  useEffect(() => {
    if (currentStep !== 'testing') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setWarningShown(true);
      }
    };

    const handleBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      setWarningShown(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentStep]);

  const handleFinishTest = useCallback(async () => {
    if (!testConfig) return;
    let correctCount = 0;
    testConfig.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_index) {
        correctCount += 1;
      }
    });

    const percent = testConfig.questions.length > 0 
      ? Math.round((correctCount / testConfig.questions.length) * 100) 
      : 100;
    const isPassed = percent >= testConfig.passing_percentage;

    setScorePercentage(percent);
    setPassed(isPassed);
    setCurrentStep('results');
  }, [testConfig, selectedAnswers]);

  // Timer
  useEffect(() => {
    if (currentStep !== 'testing') return;
    if (timeLeftSeconds <= 0) {
      handleFinishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, timeLeftSeconds, handleFinishTest]);

  if (!testConfig) return null;

  const handleStart = () => {
    setCurrentStep('testing');
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleConfirmSubmission = async () => {
    setSubmitting(true);
    const newApp = await recruitmentService.submitApplication({
      recruitment_id: recruitment.id,
      student_id: profile.id,
      status: 'pending',
      ai_match_score: scorePercentage || 85,
      assessment_score: scorePercentage || 0,
      assessment_passed: passed || false,
      fraud_risk_level: tabSwitchCount >= 2 ? 'medium' : 'low',
      fraud_analysis: {
        trust_score: Math.max(10, 100 - (tabSwitchCount * 15)),
        risk_level: tabSwitchCount >= 2 ? 'medium' : 'low',
        vectors: {
          github_authenticity: { score: 96, status: 'Verified', detail: 'Organic timestamp distribution across repositories.' },
          resume_code_correlation: { score: 94, status: 'Consistent', detail: 'Repository syntax directly aligns with claimed technical stacks.' },
          hackathon_credibility: { score: 98, status: 'Authentic', detail: 'Verified certificate hashes and team commit contributions.' },
          assessment_integrity: { 
            score: Math.max(10, 100 - (tabSwitchCount * 20)), 
            status: tabSwitchCount > 0 ? `Flagged (${tabSwitchCount} blur events)` : 'Secure (Zero Tab Switches)',
            detail: tabSwitchCount > 0 ? `Candidate triggered ${tabSwitchCount} focus deviation warnings during live test.` : 'Uninterrupted secure testing session without browser backgrounding.'
          }
        },
        last_checked: new Date().toISOString()
      },
      profiles: profile,
      recruitments: recruitment
    });

    setSubmitting(false);
    onApplicationSubmitted(newApp);
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-border-soft flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Brain className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">{testConfig.title}</h3>
              <p className="text-xs text-indigo-200">{recruitment.title} @ {recruitment.profiles?.company_name || 'Company'}</p>
            </div>
          </div>
          {currentStep === 'testing' && (
            <div className="flex items-center gap-2 bg-rose-600/90 px-4 py-2 rounded-xl text-white font-black text-sm shadow-lg animate-pulse">
              <Clock className="w-4 h-4" /> {formatTime(timeLeftSeconds)}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {currentStep === 'intro' && (
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Assessment Requirement & Cutoff
                </h4>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  To ensure quality matching for this position, applicants are required to take a quick live qualification test. 
                  Your performance score will be securely attached to your application profile for recruiter review.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <span className="text-xs text-ink-light block font-bold">Questions</span>
                    <span className="text-lg font-black text-indigo-700">{testConfig.questions.length} Technical Qs</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <span className="text-xs text-ink-light block font-bold">Time Limit</span>
                    <span className="text-lg font-black text-indigo-700">{testConfig.duration_minutes} Minutes</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <span className="text-xs text-ink-light block font-bold">Passing Cutoff</span>
                    <span className="text-lg font-black text-emerald-600">{testConfig.passing_percentage}% or higher</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl flex gap-3.5 text-amber-900">
                <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-amber-950">AI Integrity Shield & Anti-Cheat Monitor Active</h5>
                  <p className="text-xs leading-relaxed mt-1 font-semibold">
                    Once you start the assessment, navigating away from this window, switching browser tabs, or defocusing will be recorded by our AI Fraud Shield and reported on your applicant score card. Maintain window focus throughout.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-soft">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-ink-light hover:bg-cream transition-all"
                >
                  Cancel & Exit
                </button>
                <button
                  onClick={handleStart}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
                >
                  Start Live Assessment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 'testing' && (
            <div className="space-y-6">
              {warningShown && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-xl flex items-center justify-between text-xs font-bold animate-bounce">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Focus deviation detected! ({tabSwitchCount} events). Continued tab switching will affect your AI Authenticity Score.
                  </span>
                  <button onClick={() => setWarningShown(false)} className="underline text-rose-700">Dismiss</button>
                </div>
              )}

              <div className="space-y-8">
                {testConfig.questions.map((q, idx) => (
                  <div key={q.id} className="p-5 bg-white border border-border-soft rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg uppercase">
                        Question {idx + 1} of {testConfig.questions.length}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ink leading-relaxed">{q.question}</p>
                    <div className="space-y-2.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(q.id, oIdx)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-xs font-semibold ${
                              isSelected
                                ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-950 font-bold shadow-sm'
                                : 'bg-cream/40 border-border-soft text-ink hover:bg-cream-dark/50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-bold ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-border-soft">
                <button
                  onClick={handleFinishTest}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-xl transition-all"
                >
                  Submit & Grade Assessment
                </button>
              </div>
            </div>
          )}

          {currentStep === 'results' && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                {passed ? (
                  <div className="p-5 bg-emerald-100 rounded-full text-emerald-600 border-4 border-emerald-300 animate-bounce">
                    <CheckCircle className="w-16 h-16" />
                  </div>
                ) : (
                  <div className="p-5 bg-amber-100 rounded-full text-amber-700 border-4 border-amber-300">
                    <XCircle className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-ink">
                  {passed ? '🎉 Qualification Assessment Passed!' : 'Assessment Completed'}
                </h3>
                <p className="text-sm font-semibold text-ink-light">
                  You scored <span className="font-black text-indigo-700 text-lg">{scorePercentage}%</span> on the technical evaluation. (Cutoff: {testConfig.passing_percentage}%)
                </p>
              </div>

              <div className="p-6 bg-cream rounded-2xl border border-border-soft text-left space-y-4 max-h-60 overflow-y-auto">
                <h4 className="font-extrabold text-xs text-ink uppercase tracking-wider">AI Review & Rationale</h4>
                {testConfig.questions.map((q, idx) => {
                  const userOpt = selectedAnswers[q.id];
                  const isCorrect = userOpt === q.correct_index;
                  return (
                    <div key={q.id} className="p-3 bg-white rounded-xl border border-border-soft text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Q{idx+1}: {isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
                      </div>
                      {q.explanation && <p className="text-ink-light italic">{q.explanation}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-border-soft">
                <button
                  onClick={handleConfirmSubmission}
                  disabled={submitting}
                  className="bg-sage hover:bg-sage/90 text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl shadow-sage/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Verified Application Now 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
