import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Project, ProjectInsert, ProjectUpdate, ProjectFilter } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  filter: ProjectFilter;
  isLoading: boolean;

  // Actions
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (project: ProjectInsert) => Promise<Project>;
  updateProject: (id: string, updates: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  setFilter: (filter: ProjectFilter) => void;
  getFilteredProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  filter: 'all',
  isLoading: false,

  fetchProjects: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ projects: (data as Project[] | null) ?? [] });
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (input) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    const created = data as unknown as Project;
    set((state) => ({ projects: [created, ...state.projects] }));
    return created;
  },

  updateProject: async (id, updates) => {
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    }));
  },

  deleteProject: async (id) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  setCurrentProject: (project) => set({ currentProject: project }),
  setFilter: (filter) => set({ filter }),

  getFilteredProjects: () => {
    const { projects, filter } = get();
    switch (filter) {
      case 'in_progress':
        return projects.filter((p) => p.status === 'draft');
      case 'ordered':
        return projects.filter((p) => p.status === 'ordered' || p.status === 'delivered');
      default:
        return projects;
    }
  },
}));
