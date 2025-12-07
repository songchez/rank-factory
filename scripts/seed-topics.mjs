#!/usr/bin/env node

/**
 * JSON 파일을 읽어 Supabase에 토픽/아이템을 적재합니다.
 *
 * 사용법:
 *   node scripts/seed-topics.mjs scripts/seed-data.json
 *
 * 필요 env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (권장) 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 */

import { readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";

const modeToView = {
  A: "BATTLE",
  B: "TEST",
  C: "TIER",
  D: "FACT",
};

async function main() {
  const dataPath = process.argv[2] || "scripts/seed-data.json";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ 환경 변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY/ PUBLISHABLE_KEY)가 없습니다.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const raw = await readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw);
  const topics = parsed.topics || [];

  for (const topic of topics) {
    const mode = (topic.mode || "A").toUpperCase();
    const viewType = modeToView[mode] || "BATTLE";

    const { data: topicRow, error: topicError } = await supabase
      .from("ranking_topics")
      .insert({
        title: topic.title,
        category: topic.category || "General",
        mode,
        view_type: viewType,
        meta: topic.meta || {},
      })
      .select()
      .single();

    if (topicError || !topicRow) {
      console.error(`❌ 토픽 생성 실패: ${topic.title}`, topicError);
      continue;
    }

    console.log(`✅ 토픽 생성: ${topicRow.title} (${topicRow.id})`);

    const items = (topic.items || []).map((item) => ({
      topic_id: topicRow.id,
      name: item.name,
      image_url: item.imageUrl || "https://placehold.co/400x400?text=Rank+Factory",
      elo_score: item.eloScore || 1200,
      win_count: item.winCount || 0,
      loss_count: item.lossCount || 0,
      match_count: item.matchCount || 0,
    }));

    if (items.length === 0) {
      console.warn(`⚠️  항목이 없어 건너뜁니다: ${topic.title}`);
      continue;
    }

    const { error: itemsError } = await supabase.from("ranking_items").insert(items);
    if (itemsError) {
      console.error(`❌ 항목 생성 실패: ${topic.title}`, itemsError);
      continue;
    }

    console.log(`   ↳ 항목 ${items.length}개 추가 완료`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
