import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComments, postComment } from '../lib/api';
import type { Comment } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { NeoButton } from './neo-button';

interface CommentsProps {
  topicId: string;
}

export function Comments({ topicId }: CommentsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    fetchComments(topicId)
      .then((res) => {
        if (res.success) {
          setComments(res.data || []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) {
      setError('내용을 입력하세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await postComment(topicId, content.trim());
      if (res.success && res.data) {
        setComments((prev) => [res.data as Comment, ...prev]);
        setContent('');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg">댓글</h3>
        {!user && (
          <NeoButton size="sm" variant="outline" onClick={() => navigate('/login')}>
            로그인 후 작성
          </NeoButton>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="space-y-3">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[80px] border-2 border-black rounded-md p-3 focus:ring-2 focus:ring-primary"
                placeholder="댓글을 입력하세요"
                disabled={submitting}
              />
              <div className="flex items-center justify-between">
                {error && <span className="text-xs text-red-600">{error}</span>}
                <NeoButton type="submit" size="sm" disabled={submitting}>
                  {submitting ? '작성 중...' : '댓글 등록'}
                </NeoButton>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">로그인 후 댓글을 남길 수 있습니다.</p>
          )}

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => {
                const author = comment.author || comment.nickname || comment.user_id || '익명';
                const createdAt = comment.created_at
                  ? new Date(comment.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <div key={comment.id} className="rounded-lg border border-black/10 bg-white/80 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{author}</span>
                      {createdAt && <span>· {createdAt}</span>}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Comments;
