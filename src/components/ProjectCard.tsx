import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink } from 'lucide-react';

const languageColors: Record<string, string> = {
  JavaScript: '#F7DF1E', TypeScript: '#3178C6', Python: '#3776AB', Java: '#ED8B00',
  'C++': '#00599C', C: '#A8B9CC', Go: '#00ADD8', Rust: '#DEA584', Ruby: '#CC342D',
  PHP: '#777BB4', Swift: '#FA7343', Kotlin: '#7F52FF', Dart: '#0175C2', Shell: '#89E051',
  HTML: '#E34F26', CSS: '#1572B6', Lua: '#000080', R: '#276DC3', Scala: '#DC322F',
  Haskell: '#5D4F85', Elixir: '#6E4A7E', Vue: '#4FC08D', Jupyter: '#F37626',
};

interface ProjectCardProps {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  url: string;
  updatedAt?: string;
  index: number;
}

export function ProjectCard({ name, description, language, stars, forks, url, updatedAt, index }: ProjectCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay: index * 0.06 }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="soft-card rounded-xl p-5 flex flex-col gap-3 group cursor-pointer hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-lavender/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink group-hover:text-sage transition-colors duration-200 truncate">
            {name}
          </h4>
          <ExternalLink className="w-3.5 h-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>

        {/* Description */}
        <p className="text-xs text-ink-light leading-relaxed mt-1.5 line-clamp-2 min-h-[2.5em]">
          {description || 'No description provided'}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-soft/60">
          {language && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-light">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: languageColors[language] || '#A3A3A3' }}
              />
              {language}
            </span>
          )}
          {stars > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
              <Star className="w-3 h-3" />
              {stars.toLocaleString()}
            </span>
          )}
          {forks > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
              <GitFork className="w-3 h-3" />
              {forks.toLocaleString()}
            </span>
          )}
          {updatedAt && (
            <span className="text-[10px] text-ink-faint ml-auto">
              {new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </motion.a>
  );
}
