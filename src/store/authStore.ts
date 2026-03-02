import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthUser, Profile } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchProfile(session.user.id);
        set({
          session,
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            firstName: profile?.first_name ?? undefined,
            lastName: profile?.last_name ?? undefined,
            avatarUrl: profile?.avatar_url ?? undefined,
          },
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isInitialized: true });
    }

    // Écouter les changements de session
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        set({
          session,
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            firstName: profile?.first_name ?? undefined,
            lastName: profile?.last_name ?? undefined,
            avatarUrl: profile?.avatar_url ?? undefined,
          },
        });
      } else {
        set({ session: null, user: null });
      }
    });
  },

  signUp: async (email, password, firstName, lastName) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Créer le profil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
          });
        if (profileError) console.error('Profile creation error:', profileError);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setSession: (session) => {
    set({ session });
  },
}));

// Helper
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data as Profile | null;
}
