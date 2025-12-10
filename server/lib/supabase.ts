import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import { setCookie } from 'hono/cookie';

export function createClient(c: Context) {
  const env = c.env as any;
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const supabaseKey = env?.SUPABASE_PUBLISHABLE_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  const parseCookies = () => {
    const raw = c.req.header('Cookie');
    if (!raw) return [] as { name: string; value: string }[];

    return raw
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...valueParts] = cookie.split('=');
        return { name, value: valueParts.join('=') };
      });
  };

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return parseCookies();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            sameSite: options?.sameSite ?? 'Lax',
            path: '/',
          });
        });
      },
    },
  });
}

export function createAdminClient(env?: any) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const serviceRoleKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    env?.SUPABASE_SECRET_KEY ||
    (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_SECRET_KEY));

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
