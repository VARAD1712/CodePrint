import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FolderGit2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProjectCard } from '../components/ProjectCard';
import { GithubIcon } from '../components/BrandIcons';

interface ProjectsProps {
  repos: any[];
  githubUsername: string;
}

export function Projects({ repos: initialRepos, githubUsername }: ProjectsProps) {
  const navigate = useNavigate();
  const [repos, setRepos] = useState<any[]>(initialRepos);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars');

  useEffect(() => {
    setRepos(initialRepos);
    if (initialRepos.length === 0 && githubUsername) {
      setLoading(true);
      axios.get(`/api/github-repos/${githubUsername}`)
        .then(res => {
          if (res.data?.repos) setRepos(res.data.repos);
        })
        .catch(err => console.warn('Projects fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [initialRepos, githubUsername]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage mb-3" />
        <p className="text-sm font-semibold text-ink-light">Fetching GitHub repositories for @{githubUsername}...</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <h1 className="text-2xl font-bold text-ink tracking-tight">Code & Projects</h1>
          <p className="text-ink-light text-sm mt-1">Your public GitHub repositories</p>
        </motion.div>
        <div className="soft-card rounded-2xl p-12 text-center flex flex-col items-center space-y-4 border border-dashed border-border-soft">
          <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center">
            <FolderGit2 className="w-8 h-8 text-sage" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">No GitHub repositories linked yet</h3>
            <p className="text-sm text-ink-light max-w-sm mx-auto mt-1">
              Connect your GitHub username on your Profile page to view your repositories and automatic skill analysis.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-ink text-cream rounded-xl text-xs font-bold hover:bg-ink/90 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <GithubIcon className="w-4 h-4" /> Connect GitHub on Profile <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
