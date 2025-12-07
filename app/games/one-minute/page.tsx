import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { createClient } from "@/lib/supabase/server";
import { OneMinuteClient } from "@/components/games/one-minute-client";

export const runtime = "edge";
const GAME_ID = "one-minute";

export default async function OneMinutePage() {
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
            <h1 className="font-heading text-4xl">10초 정확히 맞추기</h1>
            <p className="text-sm text-muted-foreground">타이머 숨김 · 한 번의 터치로 10초에 얼마나 근접한지 경쟁</p>
          </div>
        </div>

        <NeoCard className="p-6 bg-white border-3 border-black">
          <OneMinuteClient leaderboard={leaderboard} />
        </NeoCard>
      </main>
    </div>
  );
}
