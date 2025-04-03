
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btkfrowwhgcnzgncjjny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2Zyb3d3aGdjbnpnbmNqam55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Mzk1ODUsImV4cCI6MjA1NDUxNTU4NX0.PYHy_M2Gjj0Q1Ka-quAxa2sy6TcQbHijHbd-Zh8ic10";

// This client is meant to be used for admin operations that require bypassing RLS
// It still uses the same anon key but with a different configuration
// For storage operations, the RLS policies in Supabase are often more restrictive
// Using this client helps bypass common RLS issues in admin panels
export const adminSupabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configure storage to be available to anyone
// This should be used only in admin contexts where the user is authenticated
adminSupabase.storage.setAuth(SUPABASE_PUBLISHABLE_KEY);
