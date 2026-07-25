import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Star, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Profile } from '../../types';

interface CompanyInterviewsProps {
  profile: Profile;
}

export function CompanyInterviews(_props: CompanyInterviewsProps) {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);

  // Simulated mock interview data
  const mockInterviews = [
    {
      id: 'inv-1',
      candidateName: 'Alice Johnson',
      role: 'Frontend Engineer',
      date: '2023-10-15',
      confidenceScore: 92,
      technicalRating: 88,
      communicationRating: 95,
      hiringRecommendation: 'Strong Hire',
      transcript: [
        { speaker: 'AI', text: 'Can you explain the virtual DOM in React and why it is useful?' },
        { speaker: 'Candidate', text: 'The virtual DOM is a lightweight copy of the actual DOM. React uses it to diff changes and only update the real DOM where necessary, which drastically improves performance for dynamic UIs.' },
        { speaker: 'AI', text: 'Great. How would you optimize a large list of items rendering in React?' },
        { speaker: 'Candidate', text: 'I would use windowing or virtualization libraries like react-window. This ensures only the items currently visible in the viewport are rendered to the DOM.' },
      ]
    },
    {
      id: 'inv-2',
      candidateName: 'Bob Smith',
      role: 'Backend Engineer',
      date: '2023-10-14',
      confidenceScore: 78,
      technicalRating: 85,
      communicationRating: 70,
      hiringRecommendation: 'Hire',
      transcript: [
        { speaker: 'AI', text: 'How do you handle database migrations in a production environment?' },
        { speaker: 'Candidate', text: 'I usually test them on a staging replica first, then run them during low-traffic hours.' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-ink">AI Interview Reports</h1>
        <p className="text-sm text-ink-light mt-1">Review automated technical and behavioral assessments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Interviews */}
        <div className="lg:col-span-1 space-y-4">
          {mockInterviews.map((inv) => (
            <motion.button
              key={inv.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedInterview(inv.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selectedInterview === inv.id 
                  ? 'bg-ink text-white border-ink' 
                  : 'bg-white border-border-soft hover:border-ink/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Video className={`w-5 h-5 ${selectedInterview === inv.id ? 'text-sage' : 'text-ink-light'}`} />
                <h3 className="font-bold">{inv.candidateName}</h3>
              </div>
              <p className={`text-xs ${selectedInterview === inv.id ? 'text-white/70' : 'text-ink-light'}`}>
                {inv.role} • {inv.date}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  inv.hiringRecommendation.includes('Strong') ? 'bg-sage/20 text-sage' : 'bg-sky/20 text-sky'
                }`}>
                  {inv.hiringRecommendation}
                </span>
                <span className="text-sm font-bold">{inv.confidenceScore}% Match</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right Column: Detailed Report */}
        <div className="lg:col-span-2">
          {selectedInterview ? (
            <div className="soft-card p-6 overflow-hidden bg-white/95">
              {(() => {
                const inv = mockInterviews.find(i => i.id === selectedInterview)!;
                return (
                  <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border-soft">
                      <div>
                        <div className="flex items-center gap-2">
                           <h2 className="text-2xl font-black text-ink tracking-tight">{inv.candidateName}</h2>
                           <span className="badge-sage">Verified AI Transcript</span>
                        </div>
                        <p className="text-sm font-semibold text-ink-light mt-1">{inv.role} Technical & Behavioral Assessment</p>
                      </div>
                      <div className="bg-sage/10 border border-sage/20 text-sage px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-xs">
                         <CheckCircle2 className="w-5 h-5" />
                         <span className="font-extrabold text-sm tracking-wide uppercase">{inv.hiringRecommendation}</span>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-cream p-4 rounded-xl text-center">
                        <ShieldCheck className="w-6 h-6 text-sage mx-auto mb-2" />
                        <div className="text-2xl font-black text-ink">{inv.confidenceScore}</div>
                        <div className="text-xs text-ink-light font-semibold uppercase tracking-wider">Confidence</div>
                      </div>
                      <div className="bg-cream p-4 rounded-xl text-center">
                        <Star className="w-6 h-6 text-sky mx-auto mb-2" />
                        <div className="text-2xl font-black text-ink">{inv.technicalRating}</div>
                        <div className="text-xs text-ink-light font-semibold uppercase tracking-wider">Technical</div>
                      </div>
                      <div className="bg-cream p-4 rounded-xl text-center">
                        <MessageSquare className="w-6 h-6 text-lavender mx-auto mb-2" />
                        <div className="text-2xl font-black text-ink">{inv.communicationRating}</div>
                        <div className="text-xs text-ink-light font-semibold uppercase tracking-wider">Communication</div>
                      </div>
                    </div>

                    {/* Transcript */}
                    <div>
                      <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-ink-faint" /> Interview Transcript
                      </h3>
                      <div className="space-y-4 bg-cream-dark/30 p-4 rounded-xl border border-border">
                        {inv.transcript.map((msg, idx) => (
                          <div key={idx} className={`flex flex-col ${msg.speaker === 'AI' ? 'items-start' : 'items-end'}`}>
                            <span className="text-xs font-bold text-ink-faint mb-1">{msg.speaker}</span>
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                              msg.speaker === 'AI' 
                                ? 'bg-white border border-border-soft text-ink' 
                                : 'bg-ink text-white'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-cream/50 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center h-full min-h-[400px] text-ink-faint">
              <Video className="w-12 h-12 mb-3 opacity-20" />
              <p>Select an interview to view the detailed AI report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
