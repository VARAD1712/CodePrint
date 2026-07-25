import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Plus, X, Building, Users, MessageSquare, Sparkles, CheckCircle2, UserCheck, Globe } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types';

interface CompanyProfileProps {
  profile: Profile;
}

export function CompanyProfile({ profile }: CompanyProfileProps) {
  const [saving, setSaving] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  
  // Basic Info
  const [companyName, setCompanyName] = useState(profile.company_name || profile.full_name || '');
  const [managerName, setManagerName] = useState(profile.full_name || '');
  
  // Culture & values
  const [culture, setCulture] = useState(profile.company_culture || '');
  const [values, setValues] = useState(profile.company_values?.join(', ') || '');
  
  // Testimonials & alumni stories
  const [testimonials, setTestimonials] = useState<{name: string, role: string, text: string}[]>(
    profile.testimonials || []
  );
  const [alumniStories, setAlumniStories] = useState<{name: string, role: string, story: string}[]>(
    profile.alumni_stories || []
  );

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    const valuesArray = values.split(',').map(v => v.trim()).filter(Boolean);
    
    await supabase.from('profiles').update({
      company_name: companyName,
      full_name: managerName,
      company_culture: culture,
      company_values: valuesArray,
      testimonials,
      alumni_stories: alumniStories,
    }).eq('id', profile.id);
    
    setSaving(false);
    showNotification('Company Profile and Employer Branding updated successfully!');
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { name: '', role: '', text: '' }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const addAlumniStory = () => {
    setAlumniStories([...alumniStories, { name: '', role: '', story: '' }]);
  };

  const removeAlumniStory = (index: number) => {
    setAlumniStories(alumniStories.filter((_, i) => i !== index));
  };

  const updateAlumniStory = (index: number, field: string, value: string) => {
    const updated = [...alumniStories];
    updated[index] = { ...updated[index], [field]: value };
    setAlumniStories(updated);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-24 relative">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border-soft shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Globe className="w-5 h-5 text-sage" /> Employer Branding & Portal Setup
          </h1>
          <p className="text-ink-light text-xs mt-1">
            Showcase your brand identity, workplace culture, and employee success stories to attract elite campus talent.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-sage hover:bg-sage/90 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide disabled:opacity-50 transition-all shadow-lg shadow-sage/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Organization Profile */}
        <section className="soft-card rounded-2xl p-6 bg-white shadow-sm border border-border-soft space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="p-2 bg-sage/10 text-sage rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Organization Details</h2>
              <p className="text-xs text-ink-light">Primary corporate title and point of contact.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1.5">Company Display Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-4 py-3 rounded-xl bg-cream border border-border-soft focus:outline-none focus:border-ink text-sm font-semibold text-ink transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1.5">Hiring Manager Name</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Jane Doe (Lead Technical Recruiter)"
                className="w-full px-4 py-3 rounded-xl bg-cream border border-border-soft focus:outline-none focus:border-ink text-sm font-semibold text-ink transition-all"
              />
            </div>
          </div>
        </section>

        {/* Culture & Values */}
        <section className="soft-card rounded-2xl p-6 bg-white shadow-sm border border-border-soft space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="p-2 bg-amber/10 text-amber-dark rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Workplace Culture & Core Values</h2>
              <p className="text-xs text-ink-light">Give students a compelling reason to choose your engineering teams.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1.5">Company Culture Statement</label>
              <textarea
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                placeholder="Describe your collaborative engineering rituals, remote flexibility, learning stipends, and what makes working here special..."
                className="w-full px-4 py-3.5 rounded-xl bg-cream border border-border-soft focus:outline-none focus:border-ink text-sm transition-all resize-none leading-relaxed"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-light mb-1.5">Core Values (Comma Separated Tag Pillars)</label>
              <input
                type="text"
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder="Innovation, Ownership, Psychological Safety, Continuous Learning..."
                className="w-full px-4 py-3 rounded-xl bg-cream border border-border-soft focus:outline-none focus:border-ink text-sm font-medium transition-all"
              />
              {values && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {values.split(',').map((v, i) => v.trim() && (
                    <span key={i} className="px-3 py-1 bg-ink text-white rounded-lg text-xs font-semibold shadow-sm">
                      ✨ {v.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Employee Testimonials */}
        <section className="soft-card rounded-2xl p-6 bg-white shadow-sm border border-border-soft space-y-5">
          <div className="flex items-center justify-between border-b border-border-soft pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-lavender/10 text-lavender rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Employee Testimonials</h2>
                <p className="text-xs text-ink-light">Real perspectives from mentors and software developers.</p>
              </div>
            </div>
            <button
              onClick={addTestimonial}
              className="text-xs font-bold bg-lavender text-white px-4 py-2 rounded-xl hover:bg-lavender-dark transition-all flex items-center gap-1.5 shadow-md shadow-lavender/10"
            >
              <Plus className="w-3.5 h-3.5" /> Add Quote
            </button>
          </div>
          
          <div className="space-y-4">
            {testimonials.length === 0 && (
              <p className="text-xs text-ink-faint italic bg-cream p-6 rounded-xl text-center border border-dashed border-border-soft">
                No testimonials configured. Click 'Add Quote' above to showcase developer reviews.
              </p>
            )}
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl border border-border-soft bg-cream/50 relative space-y-3 shadow-inner"
              >
                <button
                  onClick={() => removeTestimonial(index)}
                  className="absolute top-4 right-4 text-ink-faint hover:text-rose p-1 rounded-lg transition-colors"
                  title="Delete testimonial"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                  <input
                    type="text"
                    placeholder="Employee Name (e.g. Alex Chen)"
                    value={t.name}
                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-border-soft font-semibold text-ink focus:outline-none focus:border-ink"
                  />
                  <input
                    type="text"
                    placeholder="Role & Team (e.g. Senior Staff Engineer, Core Infrastructure)"
                    value={t.role}
                    onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-border-soft font-medium text-ink-light focus:outline-none focus:border-ink"
                  />
                </div>
                <textarea
                  placeholder="Testimonial quote about career mentorship, growth, or impactful engineering culture..."
                  value={t.text}
                  onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-border-soft focus:outline-none focus:border-ink resize-none leading-relaxed"
                  rows={2}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Alumni Stories */}
        <section className="soft-card rounded-2xl p-6 bg-white shadow-sm border border-border-soft space-y-5">
          <div className="flex items-center justify-between border-b border-border-soft pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky/10 text-sky rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Campus Alumni Success Stories</h2>
                <p className="text-xs text-ink-light">Highlight former interns or fresh grads who achieved rapid growth in your firm.</p>
              </div>
            </div>
            <button
              onClick={addAlumniStory}
              className="text-xs font-bold bg-sky text-white px-4 py-2 rounded-xl hover:bg-sky-dark transition-all flex items-center gap-1.5 shadow-md shadow-sky/10"
            >
              <Plus className="w-3.5 h-3.5" /> Add Story
            </button>
          </div>
          
          <div className="space-y-4">
             {alumniStories.length === 0 && (
              <p className="text-xs text-ink-faint italic bg-cream p-6 rounded-xl text-center border border-dashed border-border-soft">
                No alumni stories added yet. Feature inspiring student-to-leader journeys here!
              </p>
            )}
            {alumniStories.map((s, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl border border-border-soft bg-sky-light/15 relative space-y-3 shadow-inner"
              >
                <button
                  onClick={() => removeAlumniStory(index)}
                  className="absolute top-4 right-4 text-ink-faint hover:text-rose p-1 rounded-lg transition-colors"
                  title="Delete story"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                  <input
                    type="text"
                    placeholder="Alumni Name (e.g. Maya Patel)"
                    value={s.name}
                    onChange={(e) => updateAlumniStory(index, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-border-soft font-semibold text-ink focus:outline-none focus:border-ink"
                  />
                  <input
                    type="text"
                    placeholder="Current Title (e.g. Promoted to VP of Engineering in 3 years)"
                    value={s.role}
                    onChange={(e) => updateAlumniStory(index, 'role', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-white border border-border-soft font-medium text-ink-light focus:outline-none focus:border-ink"
                  />
                </div>
                <textarea
                  placeholder="Share their inspiring journey from campus recruit to engineering leadership..."
                  value={s.story}
                  onChange={(e) => updateAlumniStory(index, 'story', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-border-soft focus:outline-none focus:border-ink resize-none leading-relaxed"
                  rows={2}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
