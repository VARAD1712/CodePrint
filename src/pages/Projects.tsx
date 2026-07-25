import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FolderGit2 } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectsProps {
  repos: any[];
  githubUsername: string;
}

export function Projects({ repos, githubUsername }: ProjectsProps) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars');

  // Extract unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => { if (r.language) langs.add(r.language); });
    return Array.from(langs).sort();
  }, [repos]);

  // Filter & sort
  const filteredRepos = useMemo(() => {
    let filtered = repos.filter(r => {
      const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesLang = !langFilter || r.language === langFilter;
      return matchesSearch && matchesLang;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    });

    return filtered;
  }, [repos, search, langFilter, sortBy]);

  if (repos.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <h1 className="text-2xl font-bold text-ink tracking-tight">Projects</h1>
          <p className="text-ink-light text-sm mt-1">Your GitHub repositories</p>
        </motion.div>
        <div className="soft-card rounded-xl p-10 text-center">
          <FolderGit2 className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-ink mb-1">No projects yet</h3>
          <p className="text-sm text-ink-light">
            Connect your GitHub on the Profile page to see your repositories here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-2xl font-bold text-ink tracking-tight">Projects</h1>
        <p className="text-ink-light text-sm mt-1">
          {filteredRepos.length} repositories from <span className="font-medium text-ink">@{githubUsername}</span>
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border-soft rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
            <select
              value={langFilter}
              onChange={e => setLangFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-white border border-border-soft rounded-xl text-sm text-ink appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'stars' | 'updated')}
            className="px-4 py-2.5 bg-white border border-border-soft rounded-xl text-sm text-ink appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage/40 transition-all"
          >
            <option value="stars">Most Stars</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo: any, i: number) => (
          <ProjectCard
            key={repo.name}
            name={repo.name}
            description={repo.description}
            language={repo.language}
            stars={repo.stargazers_count || 0}
            forks={repo.forks_count || 0}
            url={repo.html_url}
            updatedAt={repo.updated_at}
            index={i}
          />
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-10 text-ink-faint text-sm">
          No projects match your search criteria.
        </div>
      )}
    </div>
  );
}
