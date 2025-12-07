import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { createClient } from "@/lib/supabase/server";
import { TetrisClient } from "@/components/games/tetris-client";

export const runtime = "edge";
const GAME_ID = "tetris";

export default async function TetrisPage() {
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
            <h1 className="font-heading text-4xl">테트리스 러시</h1>
            <p className="text-sm text-muted-foreground">클래식 테트리스 · 라인/레벨/시간으로 점수 경쟁</p>
          </div>
        </div>

        <NeoCard className="p-6 bg-white border-3 border-black">
          <TetrisClient leaderboard={leaderboard} />
        </NeoCard>
      </main>
    </div>
  );
}
