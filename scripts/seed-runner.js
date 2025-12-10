/**
 * Simple seed runner to hydrate Supabase directly (bypasses wrangler dev).
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually if present
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8');
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
}

const topics = [
  {
    title: '출근길 음료 월드컵',
    category: 'Food',
    mode: 'A',
    view_type: 'battle',
    items: [
      { name: '아메리카노', image_url: 'https://placehold.co/400x400/ffde59/000000?text=%EC%95%84%EB%A9%94%EB%A6%AC%EC%B9%B4%EB%85%B8' },
      { name: '라떼', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=%EB%9D%BC%EB%96%BC' },
      { name: '에너지 드링크', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=%EC%97%90%EB%84%88%EC%A7%80' },
      { name: '그릭요거트', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=%EA%B7%B8%EB%A6%AD%EC%9A%94%EA%B1%B0%ED%8A%B8' },
      { name: '프로틴 쉐이크', image_url: 'https://placehold.co/400x400/00cc00/000000?text=%EC%89%90%EC%9D%B4%ED%81%AC' },
      { name: '비타민 워터', image_url: 'https://placehold.co/400x400/00bcd4/000000?text=%EB%B9%84%ED%83%80%EB%AF%BC' },
      { name: '미숫가루', image_url: 'https://placehold.co/400x400/dcc7aa/000000?text=%EB%AF%B8%EC%88%AB%EA%B0%80%EB%A3%A8' },
      { name: '핫초코', image_url: 'https://placehold.co/400x400/b5651d/ffffff?text=%ED%95%8F%EC%B4%88%EC%BD%94' },
    ],
  },
  {
    title: 'AI 시대 적성 테스트',
    category: 'Tech',
    mode: 'B',
    view_type: 'test',
    meta: {
      questions: [
        {
          id: 'q1',
          prompt: '프로젝트 킥오프 때 나는?',
          choices: [
            { text: '로드맵 먼저', weight: 3 },
            { text: '실험부터', weight: 5 },
            { text: '레퍼런스 조사', weight: 2 },
            { text: '팀 의견 모음', weight: 4 },
          ],
        },
        {
          id: 'q2',
          prompt: '새로운 도구가 나왔다면?',
          choices: [
            { text: '바로 적용', weight: 5 },
            { text: '문서/리뷰 숙독', weight: 3 },
            { text: '팀 데모', weight: 4 },
            { text: '현행 유지', weight: 2 },
          ],
        },
      ],
      results: [
        { threshold: 10, label: '프롬프트 레이서', summary: '빠른 실험형' },
        { threshold: 7, label: '시스템 빌더', summary: '틀을 설계하는 타입' },
        { threshold: 4, label: '리서치 러버', summary: '자료형' },
        { threshold: 0, label: '미니멀 메이커', summary: '실용형' },
      ],
    },
    items: [
      { name: '프롬프트 레이서', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Prompt+Racer' },
      { name: '시스템 빌더', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=System+Builder' },
      { name: '리서치 러버', image_url: 'https://placehold.co/400x400/00bcd4/000000?text=Research+Lover' },
      { name: '미니멀 메이커', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=Minimal+Maker' },
    ],
  },
  {
    title: '출근 생존템 티어',
    category: 'General',
    mode: 'C',
    view_type: 'tier',
    items: [
      { name: '노이즈 캔슬링 이어폰', image_url: 'https://placehold.co/400x400/000000/ffffff?text=ANC', rank_order: 1 },
      { name: '텀블러', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Tumbler', rank_order: 2 },
      { name: '휴대용 충전기', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=Battery', rank_order: 1 },
      { name: '거치대', image_url: 'https://placehold.co/400x400/00cc00/000000?text=Stand', rank_order: 3 },
      { name: '휴대용 립밤', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=Lip', rank_order: 4 },
      { name: '손난로', image_url: 'https://placehold.co/400x400/dcc7aa/000000?text=Warm', rank_order: 3 },
    ],
  },
  {
    title: '2024 라면 사실 체크',
    category: 'Food',
    mode: 'D',
    view_type: 'fact',
    meta: {
      source: '편의점 판매량·커뮤니티 리뷰 취합',
      lastSyncedAt: new Date().toISOString(),
      body: `2024년 상반기 라면 판매/커뮤니티 데이터를 묶어 간단 정리했습니다.
- 얼큰·담백 투톱은 여전히 진라면/신라면 라인.
- 컵라면 시장은 가성비와 든든함으로 양극화.
- 에어프라이어 조리법이 기본값이 되며 면발 식감이 화두.`,
    },
    items: [
      { name: '신라면 블랙', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=Shin+Black', description: '국물 진하게, 건더기 풍성', rank_order: 1 },
      { name: '튀김우동 큰사발', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=Udon', description: '든든한 우동', rank_order: 2 },
      { name: '불닭볶음면 쿨링', image_url: 'https://placehold.co/400x400/000000/ffffff?text=Fire+Cool', description: '매운맛 변주', rank_order: 3 },
      { name: '안성탕면 컵', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Anseong', description: '스테디셀러', rank_order: 4 },
      { name: '진짬뽕', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=Jjambbong', description: '불맛/해물맛', rank_order: 5 },
    ],
  },
];

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
}

async function main() {
  const url = requireEnv('SUPABASE_URL');
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY');

  const supabase = createClient(url, serviceKey);
  const results = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];

    // Upsert topic (by title)
    const { data: existing, error: fetchError } = await supabase
      .from('ranking_topics')
      .select('id')
      .eq('title', topic.title)
      .limit(1)
      .maybeSingle();
    if (fetchError) throw fetchError;

    let topicId = existing?.id;
    if (topicId) {
      const { data, error } = await supabase
        .from('ranking_topics')
        .update({
          category: topic.category,
          mode: topic.mode,
          view_type: topic.view_type,
          meta: topic.meta || {},
          display_order: i + 1,
        })
        .eq('id', topicId)
        .select()
        .single();
      if (error) throw error;
      topicId = data.id;
    } else {
      const { data, error } = await supabase
        .from('ranking_topics')
        .insert({
          title: topic.title,
          category: topic.category,
          mode: topic.mode,
          view_type: topic.view_type,
          meta: topic.meta || {},
          display_order: i + 1,
        })
        .select()
        .single();
      if (error) throw error;
      topicId = data.id;
    }

    // Replace items
    await supabase.from('ranking_items').delete().eq('topic_id', topicId);
    const itemsToInsert = topic.items.map((item, idx) => ({
      topic_id: topicId,
      name: item.name,
      image_url: item.image_url,
      description: item.description || '',
      meta: item.meta || {},
      rank_order: item.rank_order ?? idx + 1,
      elo_score: item.elo_score ?? 1200,
      win_count: item.win_count ?? 0,
      loss_count: item.loss_count ?? 0,
      match_count: item.match_count ?? 0,
    }));
    const { error: itemsError } = await supabase.from('ranking_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // Seed quiz questions for mode B
    if (topic.mode === 'B' && topic.meta?.questions) {
      await supabase.from('quiz_questions').delete().eq('topic_id', topicId);
      const questions = topic.meta.questions.map((q) => ({
        topic_id: topicId,
        prompt: q.prompt,
        choices: q.choices,
        answer: '',
        weight: 1,
        question_type: 'MCQ',
      }));
      const { error } = await supabase.from('quiz_questions').insert(questions);
      if (error) throw error;
    }

    results.push({ title: topic.title, topicId });
  }

  console.log('Seed completed:', JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
