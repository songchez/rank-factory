import { createAdminClient } from './supabase';

export type SeedItem = {
  name: string;
  image_url: string;
  description?: string;
  rank_order?: number;
  meta?: Record<string, unknown>;
  elo_score?: number;
  win_count?: number;
  loss_count?: number;
  match_count?: number;
};

export type SeedTopic = {
  title: string;
  category: string;
  mode: 'A' | 'B' | 'C' | 'D';
  view_type: 'battle' | 'test' | 'tier' | 'fact';
  meta?: Record<string, unknown>;
  items: SeedItem[];
};

export const seedTopics: SeedTopic[] = [
  {
    title: '출근길 음료 월드컵',
    category: 'Food',
    mode: 'A',
    view_type: 'battle',
    meta: { description: '아침마다 고민되는 음료 조합, 단 하나를 뽑아주세요.' },
    items: [
      { name: '아메리카노', image_url: 'https://placehold.co/400x400/ffde59/000000?text=%EC%95%84%EB%A9%94%EB%A6%AC%EC%B9%B4%EB%85%B8', elo_score: 1200 },
      { name: '라떼', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=%EB%9D%BC%EB%96%BC', elo_score: 1200 },
      { name: '에너지 드링크', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=%EC%97%90%EB%84%88%EC%A7%80', elo_score: 1200 },
      { name: '그릭요거트', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=%EA%B7%B8%EB%A6%AD%EC%9A%94%EA%B1%B0%ED%8A%B8', elo_score: 1200 },
      { name: '프로틴 쉐이크', image_url: 'https://placehold.co/400x400/00cc00/000000?text=%EC%89%90%EC%9D%B4%ED%81%AC', elo_score: 1200 },
      { name: '비타민 워터', image_url: 'https://placehold.co/400x400/00bcd4/000000?text=%EB%B9%84%ED%83%80%EB%AF%BC', elo_score: 1200 },
      { name: '미숫가루', image_url: 'https://placehold.co/400x400/dcc7aa/000000?text=%EB%AF%B8%EC%88%AB%EA%B0%80%EB%A3%A8', elo_score: 1200 },
      { name: '핫초코', image_url: 'https://placehold.co/400x400/b5651d/ffffff?text=%ED%95%8F%EC%B4%88%EC%BD%94', elo_score: 1200 },
    ],
  },
  {
    title: 'AI 시대 적성 테스트',
    category: 'Tech',
    mode: 'B',
    view_type: 'test',
    meta: {
      description: '업무 스타일을 통해 AI와 최고의 궁합을 찾아보세요.',
      questions: [
        {
          id: 'q1',
          prompt: '프로젝트 킥오프 때 나는?',
          choices: [
            { text: '전체 로드맵을 먼저 그린다', weight: 3 },
            { text: '작은 실험을 바로 돌린다', weight: 5 },
            { text: '기존 사례를 폭풍 검색한다', weight: 2 },
            { text: '팀원 의견을 모아본다', weight: 4 },
          ],
        },
        {
          id: 'q2',
          prompt: '새로운 도구가 나왔다면?',
          choices: [
            { text: '일단 적용부터 해본다', weight: 5 },
            { text: '문서와 리뷰를 끝까지 읽는다', weight: 3 },
            { text: '팀에 데모를 열어본다', weight: 4 },
            { text: '현행 프로세스를 유지한다', weight: 2 },
          ],
        },
        {
          id: 'q3',
          prompt: '내가 원하는 워크플로는',
          choices: [
            { text: '자동화된 빌드와 테스트', weight: 4 },
            { text: '재사용 가능한 템플릿', weight: 3 },
            { text: '실시간 협업 보드', weight: 5 },
            { text: '최소 도구로 심플하게', weight: 2 },
          ],
        },
      ],
      results: [
        { threshold: 12, label: '프롬프트 레이서', summary: '빠른 실험과 적용으로 팀을 끌어가는 타입' },
        { threshold: 9, label: '시스템 빌더', summary: '틀을 설계하고 안정적으로 확장하는 타입' },
        { threshold: 6, label: '리서치 러버', summary: '자료를 깊게 파고드는 조사 전문형' },
        { threshold: 0, label: '미니멀 메이커', summary: '본질에 집중하는 실용주의자' },
      ],
    },
    items: [
      { name: '프롬프트 레이서', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Prompt+Racer', description: '아이디어를 즉시 실험하고 피드백을 받는 유형', elo_score: 1200 },
      { name: '시스템 빌더', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=System+Builder', description: '도구를 엮어 팀 생산성을 높이는 유형', elo_score: 1200 },
      { name: '리서치 러버', image_url: 'https://placehold.co/400x400/00bcd4/000000?text=Research+Lover', description: '자료를 모아 인사이트를 정리하는 유형', elo_score: 1200 },
      { name: '미니멀 메이커', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=Minimal+Maker', description: '불필요한 것을 덜어내고 본질을 지키는 유형', elo_score: 1200 },
    ],
  },
  {
    title: '출근 생존템 티어',
    category: 'General',
    mode: 'C',
    view_type: 'tier',
    meta: {
      tiers: ['S', 'A', 'B', 'C', 'F'],
      description: '지하철부터 사무실까지 생존을 책임지는 아이템 티어 정하기',
    },
    items: [
      { name: '노이즈 캔슬링 이어폰', image_url: 'https://placehold.co/400x400/000000/ffffff?text=ANC', rank_order: 1, description: '출근길 평온함을 책임지는 필수템' },
      { name: '텀블러', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Tumbler', rank_order: 2, description: '미지근한 물과 커피, 모두 지켜주는 동료' },
      { name: '휴대용 충전기', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=Battery', rank_order: 1, description: '배터리 불안감을 없애주는 안정제' },
      { name: '거치대', image_url: 'https://placehold.co/400x400/00cc00/000000?text=Stand', rank_order: 3, description: '목과 손목을 지켜주는 자세 교정 도구' },
      { name: '휴대용 립밤', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=Lip', rank_order: 4, description: '건조한 사무실 공기에 맞서는 방패' },
      { name: '손난로', image_url: 'https://placehold.co/400x400/dcc7aa/000000?text=Warm', rank_order: 3, description: '겨울 출근길 구원자' },
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
      { name: '신라면 블랙', image_url: 'https://placehold.co/400x400/ff5757/ffffff?text=Shin+Black', description: '국물 진하게, 건더기 풍성함으로 인기', rank_order: 1 },
      { name: '튀김우동 큰사발', image_url: 'https://placehold.co/400x400/f0f0f0/000000?text=Udon', description: '출출할 때 든든한 국물 우동', rank_order: 2 },
      { name: '불닭볶음면 쿨링', image_url: 'https://placehold.co/400x400/000000/ffffff?text=Fire+Cool', description: '매운맛과 청량감을 동시에 노린 변주', rank_order: 3 },
      { name: '안성탕면 컵', image_url: 'https://placehold.co/400x400/ffde59/000000?text=Anseong', description: '꾸준한 스테디셀러, 컵라면 강자', rank_order: 4 },
      { name: '진짬뽕', image_url: 'https://placehold.co/400x400/8c52ff/ffffff?text=Jjambbong', description: '불맛과 해물맛을 살린 프리미엄 라인', rank_order: 5 },
    ],
  },
];

type OfflineTopic = {
  id: string;
  title: string;
  category: string;
  mode: SeedTopic['mode'];
  view_type: SeedTopic['view_type'];
  meta?: Record<string, unknown>;
  display_order: number;
  created_at: string;
  items: Array<
    SeedItem & {
      id: string;
      topic_id: string;
    }
  >;
};

export function buildOfflineSeed(): OfflineTopic[] {
  return seedTopics.map((topic, topicIdx) => {
    const topicId = `seed-${topicIdx + 1}`;
    const createdAt = new Date(Date.now() - topicIdx * 1000 * 60).toISOString();
    return {
      id: topicId,
      title: topic.title,
      category: topic.category,
      mode: topic.mode,
      view_type: topic.view_type,
      meta: topic.meta || {},
      display_order: topicIdx + 1,
      created_at: createdAt,
      items: topic.items.map((item, itemIdx) => ({
        ...item,
        id: `${topicId}-${itemIdx + 1}`,
        topic_id: topicId,
        rank_order: item.rank_order ?? itemIdx + 1,
        elo_score: item.elo_score ?? 1200,
        win_count: item.win_count ?? 0,
        loss_count: item.loss_count ?? 0,
        match_count: item.match_count ?? 0,
      })),
    };
  });
}

async function upsertTopic(supabase: ReturnType<typeof createAdminClient>, topic: SeedTopic, displayOrder: number) {
  const { data: existingList, error: fetchError } = await supabase
    .from('ranking_topics')
    .select('id')
    .eq('title', topic.title);

  if (fetchError) {
    throw fetchError;
  }

  const existing = existingList?.[0];

  let topicId = existing?.id as string | undefined;
  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from('ranking_topics')
      .update({
        category: topic.category,
        mode: topic.mode,
        view_type: topic.view_type,
        meta: topic.meta || {},
        display_order: displayOrder,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) throw updateError;
    topicId = updated.id;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('ranking_topics')
      .insert({
        title: topic.title,
        category: topic.category,
        mode: topic.mode,
        view_type: topic.view_type,
        meta: topic.meta || {},
        display_order: displayOrder,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    topicId = inserted.id;
  }

  // Refresh items for this topic
  await supabase.from('ranking_items').delete().eq('topic_id', topicId);

  const itemsToInsert = topic.items.map((item, idx) => ({
    topic_id: topicId,
    name: item.name,
    image_url: item.image_url,
    description: item.description ?? '',
    meta: item.meta ?? {},
    rank_order: item.rank_order ?? idx + 1,
    elo_score: item.elo_score ?? 1200,
    win_count: item.win_count ?? 0,
    loss_count: item.loss_count ?? 0,
    match_count: item.match_count ?? 0,
  }));

  const { error: insertItemsError } = await supabase
    .from('ranking_items')
    .insert(itemsToInsert);

  if (insertItemsError) throw insertItemsError;

  // Also hydrate quiz questions for mode B
  if (topic.mode === 'B' && topic.meta?.questions) {
    await supabase.from('quiz_questions').delete().eq('topic_id', topicId);

    const questions = (topic.meta.questions as any[]).map((q) => ({
      topic_id: topicId,
      prompt: q.prompt,
      choices: q.choices,
      answer: '',
      weight: 1,
      question_type: 'MCQ',
    }));

    const { error: questionError } = await supabase
      .from('quiz_questions')
      .insert(questions);

    if (questionError) throw questionError;
  }

  return { topicId, status: existing ? 'updated' : 'created' };
}

export async function seedAll(env: any) {
  const supabase = createAdminClient(env);
  const results = [];

  for (const [idx, topic] of seedTopics.entries()) {
    const result = await upsertTopic(supabase, topic, idx + 1);
    results.push({ title: topic.title, ...result });
  }

  return { topics: results };
}

export async function ensureSeeded(env: any) {
  try {
    const supabase = createAdminClient(env);
    const { data, error } = await supabase.from('ranking_topics').select('id');
    if (error) {
      throw error;
    }
    if (!data || data.length === 0) {
      return seedAll(env);
    }
    return { topics: [] };
  } catch (error) {
    console.warn('Supabase unavailable, serving offline seed data:', (error as Error).message);
    return { topics: [], offlineData: buildOfflineSeed() };
  }
}
