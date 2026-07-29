import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Users, Sparkles, Briefcase, Calendar, Sliders, X, Brain, Zap, HelpCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { recruitmentService } from '../../services/recruitmentService';
import type { Profile, Recruitment, MockQuestion } from '../../types';


interface CompanyRecruitmentsProps {
  profile: Profile;
}

export function CompanyRecruitments({ profile }: CompanyRecruitmentsProps) {
  const [recruitments, setRecruitments] = useState<(Recruitment & { applicant_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roleType, setRoleType] = useState('Full Stack');
  const [postingType, setPostingType] = useState('full-time');
  const [skills, setSkills] = useState('');
  const [academicCriteria, setAcademicCriteria] = useState('');
  const [cgpaCutoff, setCgpaCutoff] = useState('');
  const [eligibleBranches, setEligibleBranches] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Weightage
  const [skillWeight, setSkillWeight] = useState(60);
  const [cgpaWeight, setCgpaWeight] = useState(20);
  const [projectWeight, setProjectWeight] = useState(20);
  
  // Online Qualification Mock Test State
  const [enableMockTest, setEnableMockTest] = useState(true);
  const [mockTitle, setMockTitle] = useState('Online Technical & AI Qualification Assessment');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [mockQuestions, setMockQuestions] = useState<MockQuestion[]>([]);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadRecruitments();
  }, [profile.id]);

  const loadRecruitments = async () => {
    setLoading(true);
    const jobs = await recruitmentService.getRecruitments(profile.id);
    const withCounts = await Promise.all(
      jobs.map(async (rec) => {
        const apps = await recruitmentService.getApplications({ recruitmentId: rec.id });
        return { ...rec, applicant_count: apps.length };
      })
    );
    setRecruitments(withCounts);
    setLoading(false);
  };

  const handleGenerateAiQuestions = () => {
    const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
    const generated = recruitmentService.generateAiQuestions(skillList.length > 0 ? skillList : ['Enterprise AI System', 'React & TypeScript', 'Distributed Architecture']);
    setMockQuestions([...mockQuestions, ...generated]);
  };

  const handleAddCustomQuestion = () => {
    const q: MockQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: ''
    };
    setMockQuestions([...mockQuestions, q]);
  };

  const updateQuestion = (idx: number, field: keyof MockQuestion, value: any) => {
    const updated = [...mockQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setMockQuestions(updated);
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...mockQuestions];
    const newOpts = [...updated[qIdx].options];
    newOpts[optIdx] = value;
    updated[qIdx].options = newOpts;
    setMockQuestions(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const newJob = await recruitmentService.createRecruitment({
      company_id: profile.id,
      title: title.trim(),
      description: description.trim() || null,
      role_type: roleType,
      posting_type: postingType,
      status: 'open',
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      academic_criteria: academicCriteria.trim() || null,
      cgpa_cutoff: cgpaCutoff ? parseFloat(cgpaCutoff) : null,
      eligible_branches: eligibleBranches.split(',').map(b => b.trim()).filter(Boolean),
      deadline: deadline || null,
      criteria_weightage: {
        skills: skillWeight,
        cgpa: cgpaWeight,
        projects: projectWeight
      },
      profiles: {
        full_name: profile.full_name || profile.company_name || 'Hiring Company',
        company_name: profile.company_name || profile.full_name || 'Enterprise Employer',
        id: profile.id
      },
      mock_test: enableMockTest ? {
        enabled: true,
        title: mockTitle.trim() || 'Qualification Assessment',
        duration_minutes: durationMinutes,
        passing_percentage: passingPercentage,
        questions: mockQuestions
      } : null
    });

    if (newJob) {
      setTitle('');
      setDescription('');
      setSkills('');
      setAcademicCriteria('');
      setCgpaCutoff('');
      setEligibleBranches('');
      setDeadline('');
      setMockQuestions([]);
      setShowForm(false);
      await loadRecruitments();
    }
    setCreating(false);
  };

  const toggleStatus = async (rec: Recruitment) => {
    const newStatus = rec.status === 'open' ? 'closed' : 'open';
    try {
      await supabase.from('recruitments').update({ status: newStatus }).eq('id', rec.id);
    } catch { /* offline handling */ }
    const stored = localStorage.getItem('codeprint_recruitments');
    if (stored) {
      const parsed: Recruitment[] = JSON.parse(stored);
      const idx = parsed.findIndex(p => p.id === rec.id);
      if (idx >= 0) {
        parsed[idx].status = newStatus;
        localStorage.setItem('codeprint_recruitments', JSON.stringify(parsed));
      }
    }
    await loadRecruitments();
  };

  const totalWeight = skillWeight + cgpaWeight + projectWeight;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-sage mb-3" />
        <p className="text-sm font-semibold text-ink-light">Loading job pipeline & recruitment roles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border-soft shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sage" /> Active Recruitment Pipeline
          </h2>
          <p className="text-xs text-ink-light mt-1">
            Post opportunities with custom AI weightage algorithms to evaluate applicant relevance automatically.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
            showForm ? 'bg-rose text-white hover:bg-rose/90' : 'bg-ink text-white hover:bg-ink/90'
          }`}
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Post New Opportunity</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-white border-2 border-ink/10 rounded-3xl p-8 shadow-xl space-y-6 overflow-hidden"
          >
            <div className="border-b border-border-soft pb-4">
              <h3 className="text-lg font-black text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber" /> Create AI-Indexed Job Role
              </h3>
              <p className="text-xs text-ink-light">Fill in criteria to calibrate automated applicant scoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Role Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Software Engineer"
                  className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-ink transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Domain</label>
                  <select
                    value={roleType}
                    onChange={e => setRoleType(e.target.value)}
                    className="w-full px-3 py-3 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink"
                  >
                    <option>Full Stack</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>DevOps</option>
                    <option>Mobile</option>
                    <option>Data / ML</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Engagement</label>
                  <select
                    value={postingType}
                    onChange={e => setPostingType(e.target.value)}
                    className="w-full px-3 py-3 bg-cream border border-border-soft rounded-xl text-sm font-semibold text-ink"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="internship">Internship</option>
                    <option value="hackathon-to-hire">Hackathon to Hire</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Job Description & Responsibilities</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Outline core objectives, perks, tech stacks, and team culture..."
                className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm min-h-[100px] focus:outline-none focus:border-ink resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Required Skills (Comma Separated)</label>
                 <input
                   value={skills}
                   onChange={e => setSkills(e.target.value)}
                   placeholder="React, TypeScript, Next.js, GraphQL"
                   className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:border-ink"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Eligible Branches / Degrees</label>
                 <input
                   value={eligibleBranches}
                   onChange={e => setEligibleBranches(e.target.value)}
                   placeholder="Computer Science, IT, Software Engineering"
                   className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:border-ink"
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Academic Degree Criteria</label>
                <input
                  value={academicCriteria}
                  onChange={e => setAcademicCriteria(e.target.value)}
                  placeholder="e.g. B.Tech / B.E. / M.Sc"
                  className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Minimum CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  value={cgpaCutoff}
                  onChange={e => setCgpaCutoff(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-cream border border-border-soft rounded-xl text-sm text-ink font-semibold focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            {/* Criteria Weightage */}
            <div className="p-6 bg-gradient-to-br from-cream to-sage-light/30 border border-sage/20 rounded-2xl space-y-4">
               <div className="flex items-center justify-between">
                 <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                   <Sliders className="w-4 h-4 text-sage" /> AI Match Scoring Algorithm Weightage (%)
                 </h4>
                 <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                   totalWeight === 100 ? 'bg-sage-light text-sage' : 'bg-rose-light text-rose'
                 }`}>
                   Total: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
                 </span>
               </div>
               <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-ink-light">Technical Skills Match</label>
                    <input type="number" min="0" max="100" value={skillWeight} onChange={e => setSkillWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl font-bold text-ink text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-light">Academic CGPA</label>
                    <input type="number" min="0" max="100" value={cgpaWeight} onChange={e => setCgpaWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl font-bold text-ink text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-light">Projects & Github Talent</label>
                    <input type="number" min="0" max="100" value={projectWeight} onChange={e => setProjectWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl font-bold text-ink text-sm mt-1" />
                  </div>
               </div>
            </div>

            {/* Online Qualification Mock Test Builder */}
            <div className="p-6 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-200 rounded-2xl space-y-5 shadow-inner">
               <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                     <Brain className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-sm font-black text-ink">Online Qualification Assessment & Mock Test</h4>
                     <p className="text-xs text-ink-light">Require candidates to pass a timed technical evaluation before application approval.</p>
                   </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={enableMockTest} 
                     onChange={e => setEnableMockTest(e.target.checked)} 
                     className="sr-only peer" 
                   />
                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                 </label>
               </div>

               {enableMockTest && (
                 <div className="space-y-4 pt-1 animate-fadeIn">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="text-xs font-bold text-ink-light block mb-1">Assessment Title</label>
                       <input 
                         type="text" 
                         value={mockTitle} 
                         onChange={e => setMockTitle(e.target.value)} 
                         className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl text-xs font-semibold text-ink focus:border-indigo-600 outline-none" 
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-ink-light block mb-1">Duration (Minutes)</label>
                       <input 
                         type="number" 
                         value={durationMinutes} 
                         onChange={e => setDurationMinutes(Number(e.target.value))} 
                         className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl text-xs font-semibold text-ink focus:border-indigo-600 outline-none" 
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-ink-light block mb-1">Passing Cutoff (%)</label>
                       <input 
                         type="number" 
                         value={passingPercentage} 
                         onChange={e => setPassingPercentage(Number(e.target.value))} 
                         className="w-full px-3 py-2 bg-white border border-border-soft rounded-xl text-xs font-semibold text-ink focus:border-indigo-600 outline-none" 
                       />
                     </div>
                   </div>

                   <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                     <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                       <HelpCircle className="w-4 h-4 text-indigo-600" /> Assessment Questions ({mockQuestions.length})
                     </span>
                     <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={handleGenerateAiQuestions}
                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
                       >
                         <Zap className="w-3.5 h-3.5 fill-current" /> Auto-Generate with AI
                       </button>
                       <button
                         type="button"
                         onClick={handleAddCustomQuestion}
                         className="px-4 py-2 bg-white hover:bg-gray-50 border border-indigo-300 text-indigo-700 rounded-xl font-bold text-xs transition-all"
                       >
                         + Add Manual Question
                       </button>
                     </div>
                   </div>

                   {mockQuestions.length > 0 && (
                     <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                       {mockQuestions.map((q, qIdx) => (
                         <div key={q.id} className="p-4 bg-white border border-indigo-100 rounded-xl space-y-3 shadow-sm">
                           <div className="flex items-center justify-between gap-2">
                             <input
                               type="text"
                               placeholder={`Question #${qIdx + 1} Prompt...`}
                               value={q.question}
                               onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                               className="w-full font-bold text-xs px-3 py-2 border border-border-soft rounded-lg focus:border-indigo-500 outline-none text-ink"
                             />
                             <button
                               type="button"
                               onClick={() => setMockQuestions(mockQuestions.filter((_, i) => i !== qIdx))}
                               className="text-rose hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold"
                             >
                               Remove
                             </button>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {q.options.map((opt, oIdx) => (
                               <div key={oIdx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                 <input
                                   type="radio"
                                   name={`correct-${q.id}`}
                                   checked={q.correct_index === oIdx}
                                   onChange={() => updateQuestion(qIdx, 'correct_index', oIdx)}
                                   className="text-indigo-600 cursor-pointer"
                                   title="Select as correct answer"
                                 />
                                 <input
                                   type="text"
                                   placeholder={`Option ${oIdx + 1}`}
                                   value={opt}
                                   onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                   className="w-full text-xs font-medium bg-transparent focus:outline-none"
                                 />
                               </div>
                             ))}
                           </div>
                           <input
                             type="text"
                             placeholder="Explanation / AI Feedback rationale..."
                             value={q.explanation || ''}
                             onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                             className="w-full text-xs px-3 py-1.5 bg-indigo-50/50 text-indigo-900 rounded-lg border border-indigo-100 outline-none placeholder-indigo-300"
                           />
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-semibold text-xs text-ink-light hover:bg-cream"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={creating || totalWeight !== 100}
                className="bg-sage hover:bg-sage/90 text-white px-8 py-3 rounded-xl text-sm font-black tracking-wide shadow-lg shadow-sage/20 disabled:opacity-50 transition-all"
              >
                {creating ? 'Publishing Opportunity...' : '🚀 Publish & Activate AI Engine'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {recruitments.length === 0 ? (
          <div className="soft-card rounded-2xl p-16 text-center text-ink-faint border border-dashed border-border-soft">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30 text-sage" />
            <p className="text-base font-bold text-ink mb-1">No recruitment opportunities published yet</p>
            <p className="text-xs text-ink-light max-w-sm mx-auto">
              Click the 'Post New Opportunity' button above to launch your first job opening and let our AI engine curate your talent pipeline.
            </p>
          </div>
        ) : (
          recruitments.map(rec => (
            <motion.div 
              key={rec.id} 
              whileHover={{ y: -2 }}
              className="soft-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-ink/20 bg-white"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-ink truncate">{rec.title}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    rec.status === 'open' ? 'badge-emerald' : 'badge-rose'
                  }`}>
                    {rec.status}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 bg-cream-dark text-ink rounded-xl">
                    {rec.role_type} ({rec.posting_type})
                  </span>
                  {rec.mock_test?.enabled && (
                    <span className="text-xs font-black px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" /> Qualification Assessment: Active ({rec.mock_test.questions.length} Qs)
                    </span>
                  )}
                </div>

                {rec.description && (
                  <p className="text-sm text-ink-light line-clamp-2 leading-relaxed max-w-3xl">
                    {rec.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-faint pt-1">
                  <span className="flex items-center gap-1 font-bold text-sage">
                    <Users className="w-4 h-4" /> {rec.applicant_count} Applicant{rec.applicant_count !== 1 ? 's' : ''} in pool
                  </span>
                  {rec.deadline && (
                    <span className="flex items-center gap-1 font-semibold text-ink-light">
                      <Calendar className="w-3.5 h-3.5 text-rose" /> Deadline: {new Date(rec.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {rec.cgpa_cutoff && (
                    <span className="bg-amber-light text-amber-dark px-2.5 py-0.5 rounded font-bold">
                      Min CGPA: {rec.cgpa_cutoff}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(rec)}
                  className={`text-xs px-5 py-2.5 rounded-xl font-bold tracking-wide transition-all shadow-sm ${
                    rec.status === 'open'
                      ? 'bg-cream text-ink-light border border-border-soft hover:bg-rose-light hover:text-rose hover:border-rose/30'
                      : 'bg-sage text-white hover:bg-sage/90'
                  }`}
                >
                  {rec.status === 'open' ? 'Close Opportunity' : 'Reopen Opportunity'}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
