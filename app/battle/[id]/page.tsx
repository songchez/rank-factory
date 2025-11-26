import { getTopicById, getComments } from "@/lib/data";
import BattleClient from "@/components/battle-client";

export const runtime = "edge";

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopicById(id);
  const comments = await getComments(id);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-heading text-2xl">주제를 찾을 수 없습니다</p>
      </div>
    );
  }

  return <BattleClient topic={topic} initialComments={comments} />;
}
