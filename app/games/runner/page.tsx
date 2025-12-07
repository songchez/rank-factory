import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { createClient } from "@/lib/supabase/server";
import { RunnerClient } from "@/components/games/runner-client";

export const runtime = "edge";
const GAME_ID = "runner";

export default async function RunnerPage() {
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
            <h1 className="font-heading text-4xl">러너 회피</h1>
            <p className="text-sm text-muted-foreground">좌/우 이동 + 점프로 장애물을 피해 오래 살아남으세요.</p>
          </div>
        </div>

        <NeoCard className="p-6 bg-white border-3 border-black">
          <RunnerClient leaderboard={leaderboard} />
        </NeoCard>
      </main>
    </div>
  );
}
