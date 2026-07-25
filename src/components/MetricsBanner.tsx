

const metrics = [
  {
    value: "40%",
    label: "Focus on Innovation & AI Implementation"
  },
  {
    value: "100%",
    label: "Explainable, Auditable Reasoning"
  },
  {
    value: "0",
    label: "Black-Box AI Decisions"
  }
];

export function MetricsBanner() {
  return (
    <section className="bg-warm-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-stone-border pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {metrics.map((metric, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-5xl md:text-6xl font-bold text-deep-graphite mb-2 tracking-tighter">
                  {metric.value}
                </span>
                <span className="text-sm font-medium text-slate-gray max-w-[200px]">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
