import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { createClient } from "@/lib/supabase/server";
import { ReactionClient } from "@/components/games/reaction-client";

export const runtime = "edge";
const GAME_ID = "reaction";

export default async function ReactionPage() {
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
            <h1 className="font-heading text-4xl">반응 속도 테스트</h1>
            <p className="text-sm text-muted-foreground">신호가 초록색으로 바뀌면 바로 탭하세요. 빠를수록 높은 점수!</p>
          </div>
        </div>

        <NeoCard className="p-6 bg-white border-3 border-black">
          <ReactionClient leaderboard={leaderboard} />
        </NeoCard>
      </main>
    </div>
  );
}
