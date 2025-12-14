import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTopic } from '../hooks/useTopic';
import { NeoButton } from '../components/neo-button';

export default function Fact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error, reload } = useTopic(id);

  const meta = (topic?.meta || {}) as any;
  const items = topic?.items ?? [];
  const body = meta?.body || '';
  const tags: string[] = Array.isArray(meta?.tags) ? meta.tags : [topic?.category].filter(Boolean) as string[];
  const coverImage = meta?.cover || meta?.coverUrl || meta?.cover_url || items[0]?.imageUrl || items[0]?.image_url;

  const publishedAt = meta?.lastSyncedAt
    ? new Date(meta.lastSyncedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '업데이트 예정';
  const source = meta?.source || '출처 미등록';

  const rankedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.rankOrder ?? a.rank_order ?? 999) - (b.rankOrder ?? b.rank_order ?? 999));
  }, [items]);

  const recommended = rankedItems.slice(0, 3);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '-');

  const headings = useMemo(() => {
    return body
      .split('\n')
      .map((line) => {
        const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
        if (!match) return null;
        const level = match[1].length;
        const text = match[2].trim();
        return { id: slugify(text), text, level };
      })
      .filter(Boolean) as Array<{ id: string; text: string; level: number }>;
  }, [body]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">팩트 시트 로딩 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">데이터를 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={reload}>
          다시 시도
        </NeoButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">랭킹공장 · Fact</p>
            <h1 className="font-heading text-2xl md:text-3xl">{topic.title}</h1>
          </div>
          <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
            홈으로
          </NeoButton>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8 items-start">
          <article className="max-w-4xl space-y-8">
            {/* 커버 이미지 */}
            {coverImage && (
              <div className="overflow-hidden rounded-2xl border border-black/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]">
                <img src={coverImage} alt={topic.title} className="w-full h-64 md:h-80 object-cover" />
              </div>
            )}

            {/* 제목/메타/태그 */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-muted-foreground tracking-wide">
                <span className="px-2 py-1 rounded-full border border-black/10 bg-muted">{topic.category}</span>
                <span className="px-2 py-1 rounded-full border border-black/10 bg-muted/60">{source}</span>
                <span className="text-[11px] text-muted-foreground">{publishedAt}</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl leading-snug">{topic.title}</h2>
              {meta?.description && (
                <p className="text-base md:text-lg text-foreground/80 leading-relaxed">{meta.description}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full border border-black/10 bg-muted text-sm text-foreground/80">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 본문/마크다운 */}
            {body && (
              <section className="p-1 md:p-2 space-y-3 bg-transparent border-0 shadow-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, children, ...props }) => {
                      const text = String(children ?? '');
                      const id = slugify(text);
                      return React.createElement('h1', { id, ...props, className: 'mt-8 mb-3 text-2xl font-heading' }, children);
                    },
                    h2: ({ node, children, ...props }) => {
                      const text = String(children ?? '');
                      const id = slugify(text);
                      return React.createElement('h2', { id, ...props, className: 'mt-6 mb-2 text-xl font-heading' }, children);
                    },
                    h3: ({ node, children, ...props }) => {
                      const text = String(children ?? '');
                      const id = slugify(text);
                      return React.createElement('h3', { id, ...props, className: 'mt-5 mb-2 text-lg font-heading' }, children);
                    },
                  }}
                  className="blog-markdown text-base leading-relaxed space-y-4"
                >
                  {body}
                </ReactMarkdown>
              </section>
            )}

            {/* 랭킹 리스트 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-wide">
                <span className="px-2 py-1 bg-primary border border-black/20 text-foreground font-bold rounded-full">Ranking</span>
                <span>상위 리스트</span>
              </div>
              <ol className="space-y-3">
                {rankedItems.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-black/10 bg-white/80 p-3 md:p-4 hover:border-black/20 transition-colors"
                  >
                    <div className="font-heading text-lg w-10 text-center text-muted-foreground">#{index + 1}</div>
                    <div className="w-16 h-16 md:w-20 md:h-20 border border-black/10 overflow-hidden bg-muted flex-shrink-0 rounded-lg">
                      <img src={item.imageUrl || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-heading text-base md:text-lg">{item.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {item.description || '설명이 곧 추가됩니다.'}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 추천 / 다음·이전 */}
            {recommended.length > 0 && (
              <section className="space-y-4 border-t border-black/10 pt-6">
                <div className="text-xs uppercase text-muted-foreground tracking-wide">추천</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {recommended.map((item) => (
                    <div key={item.id} className="rounded-xl border border-black/10 bg-white/80 p-3 space-y-2 hover:border-black/20 transition-colors">
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-muted border border-black/10">
                        <img src={item.imageUrl || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="font-heading text-sm">{item.name}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description || '설명이 곧 추가됩니다.'}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border border-black/10 rounded-lg bg-white/80 p-3">
                  <div className="text-sm text-muted-foreground">이전 글</div>
                  <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
                    목록으로
                  </NeoButton>
                  <div className="text-sm text-muted-foreground">다음 글</div>
                </div>
              </section>
            )}
          </article>

          {/* 사이드 TOC */}
          <aside className="hidden lg:block sticky top-20 space-y-4">
            <div className="rounded-xl border border-black/10 bg-white/70 p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)]">
              <div className="text-xs uppercase text-muted-foreground tracking-wide mb-3">목차</div>
              {headings.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {headings.map((h) => (
                    <li
                      key={h.id}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      style={{ paddingLeft: `${(Math.min(3, h.level) - 1) * 10}px` }}
                    >
                      <a href={`#${h.id}`} className="inline-block">{h.text}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">헤딩이 없습니다.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
