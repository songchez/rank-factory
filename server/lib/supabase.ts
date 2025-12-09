import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

export function createClient(c: Context) {
  const env = c.env as any;
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const supabaseKey = env?.SUPABASE_PUBLISHABLE_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        // Get all cookies from Hono context
        const cookies: { name: string; value: string }[] = [];
        // Hono doesn't provide getAll, so we need to handle cookies differently
        // For now, return empty array and handle auth differently
        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, options);
        });
      },
    },
  });
}

export function createAdminClient(env?: any) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY);

  if (serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  const supabaseKey = env?.SUPABASE_PUBLISHABLE_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
