

const steps = [
  {
    num: "01",
    title: "Multi-Source Ingestion",
    desc: "Upload Resume, GitHub username, and PPT deck."
  },
  {
    num: "02",
    title: "AI Profile Engine",
    desc: "Shared data model extracting real demonstrated work."
  },
  {
    num: "03",
    title: "Explainable Scoring",
    desc: "Weighted sub-scores with transparent reasoning logs."
  },
  {
    num: "04",
    title: "Fraud & Authenticity Check",
    desc: "Cross-verifying claims vs. actual repo activity."
  },
  {
    num: "05",
    title: "Recruiter Copilot",
    desc: "Natural-language search over verified candidates."
  }
];

export function Workflow() {
  return (
    <section id="pipeline" className="py-24 md:py-32 bg-warm-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-graphite mb-4 tracking-tight">The End-to-End Pipeline</h2>
          <p className="text-slate-gray max-w-xl text-lg">
            A continuous candidate verification journey, entirely automated from ingestion to recruiter handoff.
          </p>
        </div>

        <div className="relative border-l border-stone-border ml-4 md:ml-6 space-y-12 pb-8">
          {steps.map((step) => (
            <div key={step.num} className="relative pl-8 md:pl-12 group">
              <div className="absolute -left-[17px] top-1 bg-warm-white border border-stone-border w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-deep-graphite group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors">
                {step.num}
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-deep-graphite mb-2">{step.title}</h3>
                <p className="text-slate-gray">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
