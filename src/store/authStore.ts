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
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; birthDate?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
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
            phone: profile?.phone ?? undefined,
            birthDate: profile?.birth_date ?? undefined,
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
            phone: profile?.phone ?? undefined,
            birthDate: profile?.birth_date ?? undefined,
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
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;

      // Si Supabase ne retourne pas de session (confirmation email activée),
      // on connecte directement l'utilisateur
      if (!data.session && data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
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

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('Non connecté');

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw error;

    set({
      user: {
        ...user,
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        phone: data.phone ?? user.phone,
        birthDate: data.birthDate ?? user.birthDate,
      },
    });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    if (profile) {
      set({
        user: {
          ...user,
          firstName: profile.first_name ?? undefined,
          lastName: profile.last_name ?? undefined,
          avatarUrl: profile.avatar_url ?? undefined,
          phone: profile.phone ?? undefined,
          birthDate: profile.birth_date ?? undefined,
        },
      });
    }
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
