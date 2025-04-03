
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btkfrowwhgcnzgncjjny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2Zyb3d3aGdjbnpnbmNqam55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Mzk1ODUsImV4cCI6MjA1NDUxNTU4NX0.PYHy_M2Gjj0Q1Ka-quAxa2sy6TcQbHijHbd-Zh8ic10";

// Create a Supabase client with global authentication headers
export const adminSupabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    // Set global headers for all requests including storage
    global: {
      headers: {
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      }
    }
  }
);
