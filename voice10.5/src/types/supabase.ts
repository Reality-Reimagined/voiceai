import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User extends SupabaseUser {
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date: string | null;
} 