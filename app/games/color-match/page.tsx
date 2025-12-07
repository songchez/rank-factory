import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { createClient } from "@/lib/supabase/server";
import { ColorMatchClient } from "@/components/games/color-match-client";

export const runtime = "edge";
const GAME_ID = "color-match";

export default async function ColorMatchPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_scores")
    .select("*")
    .eq("game_id", GAME_ID)
    .order("score", { ascending: false })
    .limit(20);

  const leaderboard = data || [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">순위 게임</p>
            <h1 className="font-heading text-4xl">컬러 매칭 퀴즈</h1>
            <p className="text-sm text-muted-foreground">HEX 코드에 맞는 색상을 빠르게 선택하세요. 10라운드 점수로 랭킹!</p>
          </div>
        </div>

        <NeoCard className="p-6 bg-white border-3 border-black">
          <ColorMatchClient leaderboard={leaderboard} />
        </NeoCard>
      </main>
    </div>
  );
}
