import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  getUserProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  getUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan_id, status, current_period_end')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error fetching subscription:', error);
      return;
    }
    
    set((state) => ({
      user: state.user ? {
        ...state.user,
        subscription_tier: subscription?.plan_id || 'free',
        subscription_status: subscription?.status || 'inactive',
        subscription_end_date: subscription?.current_period_end || null
      } : null
    }));
  },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuth.getState().setUser(session?.user ?? null);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuth.getState().setUser(session?.user ?? null);
});