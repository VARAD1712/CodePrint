import React from 'react';
import Link from 'next/link';
import { Terminal, Shield, ArrowRight, CheckCircle2, GitBranch, FileText, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Professional Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
              <Terminal className="h-5 w-5 text-blue-400" />
            </div>
            <span className="font-bold text-lg text-white">
              ProjectPilot <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded ml-1">v3.5 Professional</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Professional Portal Presentation */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col gap-12">
        {/* Banner Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Real-Time Academic & Engineering Supervisory Workspace
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Professional Engineering Project Management & AI Architectural Advisory
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            ProjectPilot AI provides a centralized, professional workspace where software engineering students and development clients enter their real project specifications, technical milestones, and documentation notes. Our live inference engine evaluates architectural rigor and offers actionable engineering critique in real time.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm text-sm"
            >
              Open Supervisory Console <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Student / Mentor Registration
            </Link>
          </div>
        </div>

        {/* Feature Overview Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Real-Time Student Specifications</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No pre-filled artificial AI mock data. Students and clients explicitly define their real problem statement, technology stack, repository endpoints, and requirements through responsive creation forms.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-blue-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Dynamic AI Technical Advisory</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When a student submits their specifications for review, our AI engine dynamically computes originality scores and outputs tailored architectural recommendations specific to their entered dependencies.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-blue-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Synchronized Milestone Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Supervisors and students track execution velocity through custom interactive Gantt milestones and real-time GitHub commit velocity synchronization.
            </p>
          </div>
        </div>

        {/* System Technical Specifications */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Enterprise Security & Architecture</h4>
            <p className="text-xs text-slate-400">All sessions protected via dual-token JWT HttpOnly cookies with strict role-based access controls.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Next.js 15 App Router
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <Shield className="h-4 w-4" /> SQLite / PostgreSQL ORM
            </span>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 ProjectPilot AI Supervisory Platform — Professional Academic & Corporate Edition</p>
      </footer>
    </div>
  );
}
