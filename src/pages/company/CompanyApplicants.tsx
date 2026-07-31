import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ExternalLink, Calendar, MessageSquare, ChevronDown, ChevronUp, Search, Sparkles, CheckCircle2, ShieldCheck, Columns, List, ArrowRight, ArrowLeft as ArrowLeftIcon, Briefcase, Clock } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { apiClient } from '../../services/apiClient';
import { recruitmentService } from '../../services/recruitmentService';
import { LinkedinIcon, GithubIcon } from '../../components/BrandIcons';
import type { Profile, Application, PipelineStage } from '../../types';
import { FraudAnalysisModal } from '../../components/FraudAnalysisModal';
import { ApplicationTimelineModal } from '../../components/ApplicationTimelineModal';

interface CompanyApplicantsProps {
  profile: Profile;
}

interface ApplicantRow extends Omit<Application, 'recruitments'> {
  profiles?: Profile;
  recruitments?: { title: string } | any;
}

const KANBAN_STAGES: { stage: PipelineStage; label: string; color: string; border: string; bg: string }[] = [
  { stage: 'Applied', label: 'New Applied', color: 'text-sky-600', border: 'border-sky-500/30', bg: 'from-sky-500/10 to-transparent' },
  { stage: 'Under Review', label: 'Under Review', color: 'text-amber-600', border: 'border-amber-500/30', bg: 'from-amber-500/10 to-transparent' },
  { stage: 'Technical Screening', label: 'Tech Screening', color: 'text-purple-600', border: 'border-purple-500/30', bg: 'from-purple-500/10 to-transparent' },
  { stage: 'Interview Scheduled', label: 'Interviewing', color: 'text-teal-600', border: 'border-teal-500/30', bg: 'from-teal-500/10 to-transparent' },
  { stage: 'Offered', label: 'Offered 🎉', color: 'text-emerald-600', border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-transparent' },
  { stage: 'Rejected', label: 'Archived', color: 'text-rose-500', border: 'border-rose-500/30', bg: 'from-rose-500/10 to-transparent' },
];

export function CompanyApplicants({ profile }: CompanyApplicantsProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [interviewDates, setInterviewDates] = useState<Record<string, string>>({});
  const [filterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [auditingApplicant, setAuditingApplicant] = useState<ApplicantRow | null>(null);
  const [timelineApp, setTimelineApp] = useState<ApplicantRow | null>(null);


  const loadApplicants = useCallback(async () => {
    setLoading(true);
    const data = await recruitmentService.getApplications({ companyId: profile.id });
    const sorted = data.sort((a, b) => (b.ai_match_score || 0) - (a.ai_match_score || 0));

    const apps = sorted.map((app: any) => ({
      ...app,
      pipeline_stage: app.pipeline_stage || (app.status === 'accepted' ? 'Offered' : app.status === 'rejected' ? 'Rejected' : 'Applied')
    })) as ApplicantRow[];

    setApplicants(apps);
    
    const initialNotes: Record<string, string> = {};
    const initialDates: Record<string, string> = {};
    apps.forEach(a => {
      if (a.recruiter_notes) initialNotes[a.id] = a.recruiter_notes;
      if (a.interview_date) {
        const d = new Date(a.interview_date);
        initialDates[a.id] = d.toISOString().slice(0, 16);
      }
    });
    setNotes(initialNotes);
    setInterviewDates(initialDates);
    
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    loadApplicants();

    // Supabase Realtime automatic subscription for incoming applications and updates
    const channel = supabase
      .channel('company_applicants_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        loadApplicants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, loadApplicants]);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleStageChange = async (app: ApplicantRow, targetStage: PipelineStage) => {
    setUpdating(app.id);
    try {
      // Optimistic update
      setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, pipeline_stage: targetStage, status: targetStage === 'Offered' ? 'accepted' : targetStage === 'Rejected' ? 'rejected' : a.status } : a));
      
      try {
        await apiClient.post(`/api/applications/${app.id}/transition`, { stage: targetStage, actor_role: 'company', notes: `Moved via Recruiter ATS Dashboard` });
      } catch {
        try {
          await apiClient.patch(`/api/applications/${app.id}/stage`, { pipeline_stage: targetStage });
        } catch {
          // Fallback to unified sync service
          await recruitmentService.updateApplicationFields(app.id, { 
            pipeline_stage: targetStage,
            ...(targetStage === 'Offered' ? { status: 'accepted' } : targetStage === 'Rejected' ? { status: 'rejected' } : {})
          });
        }
      }

      const companyName = profile.company_name || profile.full_name;
      const roleTitle = app.recruitments?.title || 'the position';

      await supabase.from('notifications').insert({
        user_id: app.student_id,
        type: 'ats_stage_update',
        title: `Pipeline Progress: ${targetStage} ✨`,
        message: `Your application at ${companyName} for ${roleTitle} has moved to the "${targetStage}" stage!`,
        application_id: app.id,
        read: false,
      });

      showNotification(`Moved candidate to ${targetStage}! Automatic student update notification dispatched.`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDecision = async (app: ApplicantRow, status: 'accepted' | 'rejected') => {
    const stage = status === 'accepted' ? 'Offered' : 'Rejected';
    await handleStageChange(app, stage);
  };

  const handleSaveNotes = async (appId: string) => {
    setUpdating(appId);
    try {
      await recruitmentService.updateApplicationFields(appId, { recruiter_notes: notes[appId] });
      showNotification('Recruiter evaluation notes secured.');
    } finally {
      setUpdating(null);
    }
  };

  const handleScheduleInterview = async (app: ApplicantRow) => {
    setUpdating(app.id);
    try {
      const dateStr = interviewDates[app.id];
      if (!dateStr) return;
      
      const dateObj = new Date(dateStr);
      await recruitmentService.updateApplicationFields(app.id, { interview_date: dateObj.toISOString() });
      
      const companyName = profile.company_name || profile.full_name;
      const roleTitle = app.recruitments?.title || 'the role';

      await supabase.from('notifications').insert({
        user_id: app.student_id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled 📅',
        message: `${companyName} scheduled an interview for ${roleTitle} on ${dateObj.toLocaleString()}.`,
        application_id: app.id,
        read: false,
      });
      
      // Auto advance to Interview Scheduled stage in Kanban
      await handleStageChange(app, 'Interview Scheduled');
      showNotification(`Interview invite dispatched for ${dateObj.toLocaleDateString()}! Card moved to Interviewing.`);
    } finally {
      setUpdating(null);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesStatus = filterStatus === 'all' ? true : app.status === filterStatus;
    const studentName = app.profiles?.full_name?.toLowerCase() || '';
    const jobTitle = app.recruitments?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = studentName.includes(query) || jobTitle.includes(query);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-sage mb-3" />
        <p className="text-sm font-bold text-ink-light">Syncing AI ATS Pipeline & Candidate Scores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Toast feedback */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-ink text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-sm font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-sage" />
            <span>{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and View Mode Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-border-soft shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidate pipeline or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream text-sm rounded-2xl border border-border-soft focus:outline-none focus:border-ink transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-cream-dark p-1 rounded-2xl border border-border-soft">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                viewMode === 'kanban' ? 'bg-ink text-white shadow-md' : 'text-ink-light hover:text-ink'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Kanban Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-ink text-white shadow-md' : 'text-ink-light hover:text-ink'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List & Audit View
            </button>
          </div>
        </div>
      </div>

      {/* Kanban ATS Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-6 -mx-4 px-4">
          <div className="grid grid-flow-col auto-cols-[310px] gap-6 min-h-[550px] items-start">
            {KANBAN_STAGES.map((col) => {
              const colApps = filteredApplicants.filter(a => (a.pipeline_stage || 'Applied') === col.stage);
              return (
                <div key={col.stage} className={`flex flex-col rounded-3xl bg-white border border-border-soft shadow-sm overflow-hidden min-h-[500px]`}>
                  {/* Column Header */}
                  <div className={`p-4 border-b border-border-soft bg-gradient-to-r ${col.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm uppercase tracking-wide ${col.color}`}>{col.label}</span>
                    </div>
                    <span className="text-xs font-black bg-cream px-2.5 py-1 rounded-xl text-ink border border-border-soft shadow-2xs">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="p-3 space-y-3 flex-1 bg-cream-light/40">
                    {colApps.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-center text-ink-faint text-xs font-medium border border-dashed border-border-soft/60 rounded-2xl m-2">
                        No candidates currently in this pipeline stage.
                      </div>
                    ) : (
                      colApps.map((app) => {
                        const student = app.profiles;
                        const score = app.ai_match_score ?? student?.ai_profile_score ?? student?.talent_score ?? 84;
                        const stageIndex = KANBAN_STAGES.findIndex(s => s.stage === (app.pipeline_stage || 'Applied'));

                        return (
                          <div key={app.id} className="soft-card p-4 rounded-2xl bg-white border border-border-soft shadow-xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {student?.avatar_url ? (
                                  <img src={student.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover ring-1 ring-border" />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sage to-ink text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    {student?.full_name?.[0] || '?'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="font-bold text-ink text-sm truncate">{student?.full_name || 'Candidate'}</h4>
                                  <p className="text-[10px] text-ink-light truncate flex items-center gap-1">
                                    <Briefcase className="w-2.5 h-2.5 text-sage" /> {app.recruitments?.title}
                                  </p>
                                </div>
                              </div>

                              <div className="px-2 py-1 bg-cream rounded-xl text-center border border-border-soft flex-shrink-0">
                                <div className="text-xs font-black text-ink">{score}</div>
                                <div className="text-[7px] font-bold text-ink-faint uppercase">Match</div>
                              </div>
                            </div>

                            {/* Quick Action Badges */}
                            <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-border-soft/60 text-xs">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setAuditingApplicant(app)}
                                  className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3" /> Shield
                                </button>
                                <button
                                  onClick={() => setTimelineApp(app)}
                                  className="text-[10px] font-bold text-ink-light bg-cream hover:bg-cream-dark px-2 py-1 rounded-lg border border-border-soft transition-colors flex items-center gap-1"
                                  title="View state machine event timeline"
                                >
                                  <Clock className="w-3 h-3 text-sage" /> Timeline
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {stageIndex > 0 && (
                                  <button
                                    onClick={() => handleStageChange(app, KANBAN_STAGES[stageIndex - 1].stage)}
                                    disabled={updating === app.id}
                                    title={`Move back to ${KANBAN_STAGES[stageIndex - 1].label}`}
                                    className="p-1 text-ink-light hover:text-ink hover:bg-cream-dark rounded-lg border border-border-soft transition-colors"
                                  >
                                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {stageIndex < KANBAN_STAGES.length - 1 && (
                                  <button
                                    onClick={() => handleStageChange(app, KANBAN_STAGES[stageIndex + 1].stage)}
                                    disabled={updating === app.id}
                                    title={`Move forward to ${KANBAN_STAGES[stageIndex + 1].label}`}
                                    className="p-1 bg-ink text-white hover:bg-ink/80 rounded-lg transition-colors shadow-2xs"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard List & Audit View */
        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="soft-card rounded-2xl p-16 text-center border border-dashed border-border-soft flex flex-col items-center justify-center text-ink-faint">
              <Sparkles className="w-10 h-10 opacity-30 mb-3 text-sage" />
              <p className="text-base font-semibold text-ink mb-1">No applicants match criteria</p>
              <p className="text-xs text-ink-light max-w-xs">Adjust your search keywords or switch to the Kanban pipeline view.</p>
            </div>
          ) : (
            filteredApplicants.map((app, i) => {
              const student = app.profiles;
              const score = app.ai_match_score ?? student?.ai_profile_score ?? student?.talent_score ?? 84;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="soft-card rounded-2xl p-6 transition-all hover:border-ink/20 bg-white shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {student?.avatar_url ? (
                        <img src={student.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-border-soft" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-ink flex items-center justify-center text-white text-xl font-black shadow-md">
                          {student?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-ink truncate">{student?.full_name || 'Student Applicant'}</h3>
                          <span className="badge-sky text-[10px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">
                            Stage: {app.pipeline_stage || 'Applied'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-sage mt-0.5">Applied for: <span className="text-ink">{app.recruitments?.title}</span></p>
                        
                        <div className="flex flex-wrap gap-2.5 mt-2.5">
                          {student?.github_username && (
                            <a href={`https://github.com/${student.github_username}`} target="_blank" rel="noreferrer" className="text-xs font-medium px-2.5 py-1 rounded-lg bg-cream-dark flex items-center gap-1.5 text-ink hover:bg-ink hover:text-white transition-colors">
                              <GithubIcon className="w-3.5 h-3.5" /> @{student.github_username}
                            </a>
                          )}
                          {student?.linkedin_url && (
                            <a href={student.linkedin_url} target="_blank" rel="noreferrer" className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0A66C2]/10 flex items-center gap-1.5 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors">
                              <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setAuditingApplicant(app)}
                            className="text-xs font-black px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-1.5 text-emerald-900 hover:bg-emerald-600 hover:text-white transition-colors shadow-2xs"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:text-white" /> AI Fraud Shield Audit
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
                      <div className="text-center px-4 py-2 bg-cream rounded-2xl border border-border-soft">
                        <p className="text-2xl font-black text-ink">{score}</p>
                        <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">AI Score</p>
                      </div>

                      {app.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(app, 'accepted')}
                            disabled={updating === app.id}
                            className="px-4 py-2.5 rounded-xl bg-sage text-white font-bold text-xs hover:bg-sage/90 transition-all flex items-center gap-1.5 shadow-md shadow-sage/10"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => handleDecision(app, 'rejected')}
                            disabled={updating === app.id}
                            className="px-4 py-2.5 rounded-xl bg-rose-light text-rose font-bold text-xs hover:bg-rose hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-black px-4 py-2 rounded-xl capitalize uppercase tracking-wide ${
                          app.status === 'accepted' ? 'badge-emerald' : 'badge-rose'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedAppId === app.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-border-soft space-y-6 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-cream p-4 rounded-2xl border border-border-soft">
                            <label className="flex items-center gap-2 text-sm font-bold text-ink mb-3">
                              <MessageSquare className="w-4 h-4 text-lavender" /> Recruiter Evaluation Notes
                            </label>
                            <textarea
                              value={notes[app.id] || ''}
                              onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                              placeholder="Add confidential assessment findings or interview evaluations..."
                              className="w-full px-3.5 py-3 text-sm bg-white border border-border-soft rounded-xl focus:outline-none focus:border-ink resize-none h-24 shadow-inner"
                            />
                            <button
                              onClick={() => handleSaveNotes(app.id)}
                              disabled={updating === app.id}
                              className="mt-3 px-5 py-2.5 bg-ink text-white text-xs font-bold rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-all float-right"
                            >
                              Save Notes
                            </button>
                            <div className="clear-both"></div>
                          </div>

                          <div className="bg-cream p-4 rounded-2xl border border-border-soft flex flex-col justify-between">
                            <div>
                              <label className="flex items-center gap-2 text-sm font-bold text-ink mb-3">
                                <Calendar className="w-4 h-4 text-sky" /> Schedule Interview Invite
                              </label>
                              <p className="text-xs text-ink-light mb-3">
                                Select timestamp to dispatch instant real-time notification to student dashboard.
                              </p>
                              <input
                                type="datetime-local"
                                value={interviewDates[app.id] || ''}
                                onChange={e => setInterviewDates(prev => ({ ...prev, [app.id]: e.target.value }))}
                                className="w-full px-4 py-2.5 text-sm bg-white border border-border-soft rounded-xl focus:outline-none focus:border-sky transition-all font-medium"
                              />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              {app.interview_date ? (
                                <span className="text-xs text-sage font-bold flex items-center gap-1 bg-sage-light px-3 py-1.5 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled: {new Date(app.interview_date).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-xs text-ink-faint italic">No interview scheduled yet</span>
                              )}
                              <button
                                onClick={() => handleScheduleInterview(app)}
                                disabled={updating === app.id || !interviewDates[app.id]}
                                className="px-5 py-2.5 bg-sky text-white text-xs font-bold rounded-xl hover:bg-sky/90 disabled:opacity-50 transition-all shadow-md shadow-sky/10"
                              >
                                Dispatch Invite 📅
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                    className="w-full mt-5 flex items-center justify-center py-2.5 text-xs font-bold text-ink hover:text-white transition-all bg-cream hover:bg-ink rounded-xl border border-border-soft"
                  >
                    {expandedAppId === app.id ? (
                      <><ChevronUp className="w-4 h-4 mr-1" /> Close Candidate Evaluation Tools</>
                    ) : (
                      <><ChevronDown className="w-4 h-4 mr-1" /> Open Recruiter Tools (Notes & Scheduling)</>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {auditingApplicant && (
        <FraudAnalysisModal
          candidateName={auditingApplicant.profiles?.full_name || 'Candidate Applicant'}
          candidateEmail={auditingApplicant.profiles?.email}
          mockTestScore={auditingApplicant.ai_match_score || 92}
          onClose={() => setAuditingApplicant(null)}
        />
      )}

      {timelineApp && (
        <ApplicationTimelineModal
          applicationId={timelineApp.id || ''}
          candidateName={timelineApp.profiles?.full_name || 'Verified Applicant'}
          roleTitle={timelineApp.recruitments?.title || 'Open Position'}
          onClose={() => setTimelineApp(null)}
        />
      )}
    </div>
  );
}

