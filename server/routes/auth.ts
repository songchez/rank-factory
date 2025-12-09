import { Hono } from 'hono';
import { createClient } from '../lib/supabase';

const auth = new Hono();

// Supabase OAuth callback
auth.get('/callback', async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient(c);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const origin = url.origin;
      const forwardedHost = c.req.header('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return c.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return c.redirect(`https://${forwardedHost}${next}`);
      } else {
        return c.redirect(`${origin}${next}`);
      }
    }
  }

  return c.redirect('/auth/auth-code-error');
});

export default auth;
