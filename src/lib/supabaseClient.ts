import { createClient } from '@supabase/supabase-js';
import type { User, Mission, ForumPost, ForumComment } from './types';

// Re-exporting types for convenience
export type { User, Mission, ForumPost, ForumComment };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
