import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  innovationScore: number;
  status: 'IDEATION' | 'PLANNING' | 'BUILDING' | string;
  userId: string;
  githubRepo?: string | null;
  createdAt?: string;
  milestones?: Milestone[];
  documents?: Document[];
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string | null;
  isCompleted: boolean;
}

export interface Document {
  id: string;
  projectId: string;
  type: 'RESEARCH_PAPER' | 'TECH_STACK' | 'API' | string;
  title: string;
  summary: string;
  url?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null });
    } catch (err) {
      console.error('Logout error in store:', err);
    }
  },
}));

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  fetchProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  setProjects: (projects) => set({ projects, activeProject: projects[0] || null }),
  setActiveProject: (activeProject) => set({ activeProject }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects], activeProject: project })),
  updateProject: (updated) =>
    set((state) => {
      const projects = state.projects.map((p) => (p.id === updated.id ? updated : p));
      return {
        projects,
        activeProject: state.activeProject?.id === updated.id ? updated : state.activeProject,
      };
    }),
  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        set({ projects: data.projects || [], activeProject: data.projects?.[0] || null, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
