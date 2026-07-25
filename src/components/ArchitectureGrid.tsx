
import { GitBranch, FileText, Search } from 'lucide-react';

const agents = [
  {
    icon: <GitBranch className="w-6 h-6 text-charcoal" />,
    title: "Verification Agent",
    description: "Pulls GitHub APIs and cross-checks resume claims against real commit history, verifying languages and active coding periods."
  },
  {
    icon: <FileText className="w-6 h-6 text-charcoal" />,
    title: "Presentation Agent",
    description: "Parses PPT/PDF uploads, scores innovation and feasibility, and flags AI-text patterns to detect generated boilerplate."
  },
  {
    icon: <Search className="w-6 h-6 text-charcoal" />,
    title: "Recruiter Copilot Agent",
    description: "Translates natural-language queries (e.g., 'Find React developers with hackathon experience') into ranked, explainable results."
  }
];

export function ArchitectureGrid() {
  return (
    <section id="architecture" className="py-24 md:py-32 bg-white border-b border-stone-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-graphite mb-4 tracking-tight">Multi-Agent AI Architecture</h2>
          <p className="text-slate-gray max-w-2xl text-lg">
            A modular network of specialized AI agents working in tandem to verify, analyze, and surface elite talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <div key={index} className="p-8 border border-stone-border rounded-xl hover:border-charcoal transition-colors bg-warm-white/30">
              <div className="mb-6 bg-white w-12 h-12 rounded-lg border border-stone-border flex items-center justify-center shadow-sm">
                {agent.icon}
              </div>
              <h3 className="text-xl font-bold text-deep-graphite mb-3">{agent.title}</h3>
              <p className="text-slate-gray leading-relaxed text-sm">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
