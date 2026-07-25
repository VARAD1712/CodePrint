import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ExternalLink, Calendar, MessageSquare, ChevronDown, ChevronUp, Search, Filter, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { LinkedinIcon, GithubIcon } from '../../components/BrandIcons';
import type { Profile, Application } from '../../types';
import { FraudAnalysisModal } from '../../components/FraudAnalysisModal';

interface CompanyApplicantsProps {
  profile: Profile;
}

interface ApplicantRow extends Application {
  profiles?: Profile;
  recruitments?: { title: string };
}

export function CompanyApplicants({ profile }: CompanyApplicantsProps) {
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [interviewDates, setInterviewDates] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [auditingApplicant, setAuditingApplicant] = useState<ApplicantRow | null>(null);

  useEffect(() => {
    loadApplicants();
  }, [profile.id]);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const loadApplicants = async () => {
    setLoading(true);
    const { data: recs } = await supabase
      .from('recruitments')
      .select('id')
      .eq('company_id', profile.id);

    const recIds = (recs || []).map(r => r.id);
    if (recIds.length === 0) {
      setApplicants([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:student_id(id, full_name, email, github_username, linkedin_url, talent_score, ai_profile_score, github_stats, avatar_url),
        recruitments:recruitment_id(title)
      `)
      .in('recruitment_id', recIds)
      .order('ai_match_score', { ascending: false, nullsFirst: false });

    const apps = (data || []) as ApplicantRow[];
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
  };

  const handleDecision = async (app: ApplicantRow, status: 'accepted' | 'rejected') => {
    setUpdating(app.id);
    try {
      await supabase.from('applications').update({ status }).eq('id', app.id);

      const companyName = profile.company_name || profile.full_name;
      const roleTitle = app.recruitments?.title || 'the role';

      await supabase.from('notifications').insert({
        user_id: app.student_id,
        type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
        title: status === 'accepted' ? 'Application Accepted! 🎉' : 'Application Update',
        message: status === 'accepted'
          ? `${companyName} accepted your application for ${roleTitle}.`
          : `${companyName} declined your application for ${roleTitle}. Keep applying!`,
        application_id: app.id,
        read: false,
      });

      showNotification(`Candidate successfully marked as ${status.toUpperCase()}! Student notified.`);
      await loadApplicants();
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setUpdating(appId);
    try {
      await supabase.from('applications').update({ recruiter_notes: notes[appId] }).eq('id', appId);
      showNotification('Recruiter notes saved to candidate profile.');
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
      await supabase.from('applications').update({ interview_date: dateObj.toISOString() }).eq('id', app.id);
      
      const companyName = profile.company_name || profile.full_name;
      const roleTitle = app.recruitments?.title || 'the role';

      await supabase.from('notifications').insert({
        user_id: app.student_id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled 📅',
        message: `${companyName} has scheduled an interview for ${roleTitle} on ${dateObj.toLocaleString()}.`,
        application_id: app.id,
        read: false,
      });
      
      showNotification(`Interview invitation dispatched for ${dateObj.toLocaleDateString()}!`);
      await loadApplicants();
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-sage mb-3" />
        <p className="text-sm font-semibold text-ink-light">Loading AI ranked candidate pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-ink text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-sage" />
            <span>{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border-soft shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream text-sm rounded-xl border border-border-soft focus:outline-none focus:border-ink transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-ink-faint mr-1" />
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-ink text-white shadow-md'
                  : 'bg-cream-dark text-ink-light hover:text-ink hover:bg-cream'
              }`}
            >
              {status} {status !== 'all' ? `(${applicants.filter(a => a.status === status).length})` : `(${applicants.length})`}
            </button>
          ))}
        </div>
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="soft-card rounded-2xl p-16 text-center border border-dashed border-border-soft flex flex-col items-center justify-center text-ink-faint">
          <Sparkles className="w-10 h-10 opacity-30 mb-3 text-sage" />
          <p className="text-base font-semibold text-ink mb-1">No applicants found</p>
          <p className="text-xs text-ink-light max-w-xs">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filter criteria or clearing your search query.'
              : 'Post a job recruitment to start gathering high-potential student applicants.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app, i) => {
            const student = app.profiles;
            const score = app.ai_match_score ?? student?.ai_profile_score ?? student?.talent_score ?? 0;

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
                        {score >= 90 && (
                          <span className="badge-emerald text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Top Talent
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-sage mt-0.5">Applied for: <span className="text-ink">{app.recruitments?.title}</span></p>
                      <div className="flex flex-wrap gap-3 mt-2.5">
                        {student?.github_username && (
                          <a
                            href={`https://github.com/${student.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-cream-dark flex items-center gap-1.5 text-ink hover:bg-ink hover:text-white transition-colors"
                          >
                            <GithubIcon className="w-3.5 h-3.5" /> @{student.github_username}
                          </a>
                        )}
                        {student?.linkedin_url && (
                          <a
                            href={student.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0A66C2]/10 flex items-center gap-1.5 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors"
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                            <ExternalLink className="w-3 h-3" />
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
                          title="Accept Candidate"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleDecision(app, 'rejected')}
                          disabled={updating === app.id}
                          className="px-4 py-2.5 rounded-xl bg-rose-light text-rose font-bold text-xs hover:bg-rose hover:text-white transition-all flex items-center gap-1.5"
                          title="Reject Candidate"
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
                            placeholder="Add private feedback, technical assessment remarks, or culture fit notes..."
                            className="w-full px-3.5 py-3 text-sm bg-white border border-border-soft rounded-xl focus:outline-none focus:border-ink resize-none h-24 shadow-inner"
                          />
                          <button
                            onClick={() => handleSaveNotes(app.id)}
                            disabled={updating === app.id}
                            className="mt-3 px-5 py-2.5 bg-ink text-white text-xs font-bold rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-all float-right"
                          >
                            Save Private Notes
                          </button>
                          <div className="clear-both"></div>
                        </div>

                        <div className="bg-cream p-4 rounded-2xl border border-border-soft flex flex-col justify-between">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-ink mb-3">
                              <Calendar className="w-4 h-4 text-sky" /> Schedule & Dispatch Interview Invite
                            </label>
                            <p className="text-xs text-ink-light mb-3">
                              Select a date and time to automatically send an interview invitation notification directly to the candidate's portal.
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
                              Dispatch Invitation 📅
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
          })}
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
    </div>
  );
}
