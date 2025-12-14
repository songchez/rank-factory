import { Hono } from 'hono';
import { createClient } from '../lib/supabase';

const comments = new Hono();

comments.get('/', async (c) => {
  const topicId = c.req.query('topicId');
  if (!topicId) {
    return c.json({ success: false, error: 'topicId is required' }, 400);
  }

  try {
    const supabase = createClient(c);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

comments.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const topicId = body.topicId || body.topic_id;
  const content = (body.content || '').trim();

  if (!topicId || !content) {
    return c.json({ success: false, error: 'topicId and content are required' }, 400);
  }

  try {
    const supabase = createClient(c);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return c.json({ success: false, error: '로그인이 필요합니다.' }, 401);
    }

    const user = userData.user;
    const nickname = user.email || user.user_metadata?.name || '사용자';

    const { data, error } = await supabase
      .from('comments')
      .insert({
        topic_id: topicId,
        nickname,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({
      success: true,
      data: {
        ...data,
        author: nickname,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

export default comments;
