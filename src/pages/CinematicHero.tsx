import { useState } from 'react';
import {
  Search,
  User,
  Menu,
  X,
  Star,
  Clock,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * Full-Viewport Cinematic Movie / Streaming Hero Section
 * Implements:
 * - Liquid glass pill controls & buttons with custom glowing border gradients
 * - Staggered blur-fade-up entry animation (0ms to 900ms delays)
 * - Pure blur backdrop overlay with vertical CSS gradient mask (no dark gradient darkening)
 * - Responsive navigation with mobile slide-in menu
 */
export function CinematicHero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items for desktop & mobile dropdown
  const navLinks = [
    'Movies',
    'TV Series',
    "Editor's Pick",
    'Interviews',
    'User Reviews',
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans flex flex-col selection:bg-white/20 select-none">
      {/* ── BACKGROUND VIDEO (Fixed at z-index 0) ── */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* ── BOTTOM BLUR OVERLAY (z-index 1, no dark gradient, pure blur with mask) ── */}
      <div
        className="fixed inset-0 z-1 pointer-events-none backdrop-blur-xl"
        style={{
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
        }}
      />

      {/* ── NAVBAR (z-index 50, relative positioned) ── */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6 w-full flex-shrink-0">
        {/* Left: Brand Logo (0ms delay) */}
        <a
          href="#"
          className="h-8 md:h-10 flex items-center font-bold text-xl sm:text-2xl tracking-[0.2em] text-white animate-blur-fade-up transition-opacity hover:opacity-90"
          style={{ animationDelay: '0ms' }}
        >
          CINEMATIC
        </a>

        {/* Center: Desktop Navigation Links (100ms to 300ms delays in 50ms increments) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link, index) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200 animate-blur-fade-up"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: Controls & Mobile Hamburger Trigger */}
        <div className="flex items-center gap-3">
          {/* Search Button (Visible sm and up, 350ms delay) */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-2 rounded-full liquid-glass text-white text-sm font-medium px-4 md:px-6 py-2 hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer shadow-sm"
            style={{ animationDelay: '350ms' }}
            aria-label="Search entertainment directory"
          >
            <span>Search</span>
            <Search size={18} className="text-white flex-shrink-0" />
          </button>

          {/* User / Profile Button (Visible sm and up, 400ms delay) */}
          <button
            type="button"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer shadow-sm"
            style={{ animationDelay: '400ms' }}
            aria-label="User account profile"
          >
            <User size={18} className="text-white flex-shrink-0" />
          </button>

          {/* Hamburger Menu Button (Below lg breakpoint, 350ms delay) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full liquid-glass text-white hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer relative shadow-sm"
            style={{ animationDelay: '350ms' }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Menu
                size={20}
                className={`absolute transition-all duration-500 ease-out transform ${
                  isMobileMenuOpen
                    ? 'rotate-180 opacity-0 scale-50 pointer-events-none'
                    : 'rotate-0 opacity-100 scale-100'
                }`}
              />
              <X
                size={20}
                className={`absolute transition-all duration-500 ease-out transform ${
                  isMobileMenuOpen
                    ? 'rotate-0 opacity-100 scale-100'
                    : '-rotate-180 opacity-0 scale-50 pointer-events-none'
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU DROPDOWN (Below lg breakpoint, absolutely positioned below nav at top-[72px], z-index 40) ── */}
      <div
        className={`absolute left-4 right-4 sm:left-6 sm:right-6 md:left-12 md:right-12 top-[72px] z-40 lg:hidden rounded-2xl bg-gray-900/95 backdrop-blur-lg border border-gray-800 shadow-2xl transition-all duration-500 ease-out transform overflow-hidden ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-3 gap-1">
          {navLinks.map((link, idx) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 px-3 rounded-lg hover:bg-gray-800/50 text-white font-medium text-sm sm:text-base transition-all duration-300 transform ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${idx * 50}ms` : '0ms' }}
            >
              {link}
            </a>
          ))}

          {/* Below sm (< 640px), show Search and Profile buttons inside the mobile dropdown */}
          <div className="sm:hidden mt-2 pt-3 pb-1 px-1 border-t border-gray-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full liquid-glass text-white text-sm font-medium hover:bg-white/10 active:scale-95 transition-all"
            >
              <span>Search</span>
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full liquid-glass text-white hover:bg-white/10 active:scale-95 transition-all flex-shrink-0"
              aria-label="User profile"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO CONTENT (Bottom of viewport, flex-1 justify-end, z-index 10) ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16 overflow-y-auto sm:overflow-visible">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8">
          {/* Left side: Metadata, Title, Description, CTA buttons */}
          <div className="flex-1 w-full">
            {/* Metadata row (300ms delay) */}
            <div
              className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm text-white animate-blur-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 font-medium">
                <Star size={16} className="fill-white text-white w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>8.7/10 IMDB</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-500/80 hidden sm:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 font-normal text-gray-300">
                <Clock size={16} className="text-white w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>132 min</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-500/80 hidden sm:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 font-normal text-gray-300">
                <Calendar size={16} className="text-white w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>April, 2025</span>
              </div>
            </div>

            {/* Main Title (400ms delay) */}
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white tracking-[-0.04em] leading-[1.08] mb-3 sm:mb-4 md:mb-6 animate-blur-fade-up max-w-4xl"
              style={{ animationDelay: '400ms' }}
            >
              Step Through. Work Smarter.
            </h1>

            {/* Description (500ms delay) */}
            <p
              className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl font-normal leading-relaxed animate-blur-fade-up"
              style={{ animationDelay: '500ms' }}
            >
              A voyage through forgotten realms, where past and future intertwine.
            </p>

            {/* CTA Buttons (600ms & 700ms delays) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Only solid element: White background, black text */}
              <button
                type="button"
                className="bg-white text-black hover:bg-gray-200 rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 transition-colors duration-200 active:scale-95 animate-blur-fade-up cursor-pointer shadow-lg"
                style={{ animationDelay: '600ms' }}
              >
                <Play size={18} className="fill-black text-black flex-shrink-0" />
                <span>Watch Now</span>
              </button>

              {/* Liquid glass secondary action */}
              <button
                type="button"
                className="rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 text-white hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer"
                style={{ animationDelay: '700ms' }}
              >
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* Right side: Navigation Arrows (800ms & 900ms delays) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end flex-shrink-0">
            <button
              type="button"
              className="rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-white text-sm font-medium hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer"
              style={{ animationDelay: '800ms' }}
              aria-label="Previous feature preview"
            >
              <ChevronLeft size={18} className="text-white flex-shrink-0" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-white text-sm font-medium hover:bg-white/10 active:scale-95 transition-all duration-200 animate-blur-fade-up cursor-pointer"
              style={{ animationDelay: '900ms' }}
              aria-label="Next feature preview"
            >
              <span>Next</span>
              <ChevronRight size={18} className="text-white flex-shrink-0" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
