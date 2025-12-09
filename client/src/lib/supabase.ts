import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Available env vars:', import.meta.env);
  throw new Error('Missing Supabase environment variables. Check .env.local and restart dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
