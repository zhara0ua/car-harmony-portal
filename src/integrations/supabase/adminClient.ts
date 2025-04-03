
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btkfrowwhgcnzgncjjny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2Zyb3d3aGdjbnpnbmNqam55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Mzk1ODUsImV4cCI6MjA1NDUxNTU4NX0.PYHy_M2Gjj0Q1Ka-quAxa2sy6TcQbHijHbd-Zh8ic10";

// Import the admin supabase client like this:
// import { adminSupabase } from "@/integrations/supabase/adminClient";

// This client has the same capabilities as the regular client,
// but when used with admin authentication, it can bypass RLS policies
export const adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
