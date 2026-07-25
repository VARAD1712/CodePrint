
import { SquareCode } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-border pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-graphite mb-8 tracking-tight">
            Ready to deploy verification-first hiring?
          </h2>
          <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="work@email.com" 
              className="flex-1 px-4 py-3 rounded-md border border-stone-border bg-warm-white text-deep-graphite placeholder:text-slate-gray/60 focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal transition-all"
              required
            />
            <button 
              type="submit" 
              className="bg-charcoal text-white px-6 py-3 rounded-md font-medium hover:bg-deep-graphite transition-colors whitespace-nowrap"
            >
              Request Sandbox Access
            </button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-stone-border text-sm text-slate-gray">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <SquareCode className="w-5 h-5 text-deep-graphite" strokeWidth={1.5} />
            <span className="font-bold text-deep-graphite">Codeprint</span>
            <span className="ml-2">© 2026. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-deep-graphite transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-deep-graphite transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#" className="hover:text-deep-graphite transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
