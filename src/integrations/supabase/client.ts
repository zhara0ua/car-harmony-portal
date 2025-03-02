
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
  console.error('URL available:', !!supabaseUrl);
  console.error('Anon Key available:', !!supabaseAnonKey);
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

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
    console.log('Session available:', !!data.session);
  }
});

// Test a simple query to verify database connection
supabase
  .from('cars')
  .select('count(*)', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase database connection error:', error);
    } else {
      console.log('Supabase database connection working, cars count:', count);
    }
  });
