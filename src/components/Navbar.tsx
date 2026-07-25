
import { SquareCode } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="w-full border-b border-stone-border bg-warm-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SquareCode className="w-6 h-6 text-deep-graphite" strokeWidth={1.5} />
          <span className="font-bold text-lg tracking-tight text-deep-graphite">Codeprint</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-gray">
          <a href="#pipeline" className="hover:text-deep-graphite transition-colors">The Pipeline</a>
          <a href="#features" className="hover:text-deep-graphite transition-colors">Flagship Features</a>
          <a href="#architecture" className="hover:text-deep-graphite transition-colors">Architecture</a>
          <a href="#demo" className="hover:text-deep-graphite transition-colors">Live Demo</a>
        </div>
        
        <div>
          <button className="bg-charcoal text-warm-white px-5 py-2 text-sm font-medium rounded-md hover:bg-deep-graphite transition-colors">
            Launch Demo
          </button>
        </div>
      </div>
    </nav>
  );
}
