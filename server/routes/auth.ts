import { Hono } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { createClient } from '../lib/supabase';

const auth = new Hono();

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: '이메일과 비밀번호를 입력하세요.' }, 400);
    }

    const supabase = createClient(c);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      return c.json({ success: false, error: error?.message ?? '로그인 실패' }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

auth.post('/logout', async (c) => {
  try {
    const supabase = createClient(c);
    await supabase.auth.signOut();
    deleteCookie(c, 'sb-access-token');
    deleteCookie(c, 'sb-refresh-token');
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

auth.get('/session', async (c) => {
  try {
    const supabase = createClient(c);
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user ? { id: data.user.id, email: data.user.email } : null;

    // 세션이 없을 때도 200 응답으로 게스트 처리
    if (error) {
      return c.json({ success: true, user: null });
    }

    return c.json({ success: true, user });
  } catch (error) {
    // 환경변수 누락 등 모든 경우 게스트로 처리
    return c.json({ success: true, user: null, note: (error as Error).message });
  }
});

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
