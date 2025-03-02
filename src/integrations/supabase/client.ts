
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

console.log('Initializing Supabase client with:');
console.log('URL length:', supabaseUrl?.length || 0);
console.log('Key available:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Check if client is initialized properly
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase session error:', error);
  } else {
    console.log('Supabase client initialized successfully');
  }
});
