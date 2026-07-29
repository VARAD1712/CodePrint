import React from 'react';
import { Shield, Terminal, BookOpen, GitPullRequest, Layers } from 'lucide-react';

export const AuthSideGraphic: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'ProjectPilot AI Supervision Portal',
  subtitle = 'A clean, professional engineering workspace for students and supervisory mentors to track real project milestones, GitHub commit velocity, and architecture appraisals.',
}) => {
  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-10 border-r border-slate-800 text-slate-200">
      {/* Top Header & Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
          <Terminal className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          ProjectPilot <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded ml-1">v3.5</span>
        </span>
      </div>

      {/* Center Informational Card */}
      <div className="my-auto space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">{title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>

        {/* Feature summary table/grid */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <Layers className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Student-Driven Architecture</h3>
              <p className="text-xs text-slate-400 mt-0.5">Students fill in real custom project specifications, target stacks, and problem statements directly in real-time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <BookOpen className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Dynamic AI Evaluation Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated appraisal of engineering rigor, architectural originality, and technical gaps based on authentic student input text.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <GitPullRequest className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Real-Time Milestone Tracking</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live Gantt milestone roadmap and synchronized GitHub commit monitoring for supervisor transparency.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <span>Real-Time Engine: ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span>Secure Dual-Token Sessions</span>
        </div>
      </div>
    </div>
  );
};
