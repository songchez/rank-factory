;

import { useEffect, useState } from "react";
import { RankingItem, RankingTopic } from "../lib/types";
import { NeoCard } from "./neo-card";
import { NeoButton } from "./neo-button";
import { saveTierPlacementsAction } from "../lib/actions";
import { cn } from "../lib/utils";

type TierKey = "S" | "A" | "B" | "C" | "F";

const TIER_LABELS: Record<TierKey, { name: string; color: string }> = {
  S: { name: "S급", color: "bg-primary" },
  A: { name: "A급", color: "bg-secondary text-white" },
  B: { name: "B급", color: "bg-accent" },
  C: { name: "C급", color: "bg-yellow-200" },
  F: { name: "F급", color: "bg-gray-200" },
};

export function TierClient({ topic }: { topic: RankingTopic }) {
  const [pool, setPool] = useState<RankingItem[]>(topic.items);
  const [lanes, setLanes] = useState<Record<TierKey, RankingItem[]>>({
    S: [],
    A: [],
    B: [],
    C: [],
    F: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `session-${Date.now()}`;
      setSessionId(id);
    }
  }, [sessionId]);

  const moveItem = (itemId: string, targetTier: TierKey | "POOL") => {
    let movingItem: RankingItem | undefined;

    const updatedLanes: Record<TierKey, RankingItem[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      F: [],
    };

    (Object.keys(lanes) as TierKey[]).forEach((tier) => {
      const filtered = lanes[tier].filter((item) => item.id !== itemId);
      const removed = lanes[tier].find((item) => item.id === itemId);
      if (removed) movingItem = removed;
      updatedLanes[tier] = filtered;
    });

    const filteredPool = pool.filter((item) => item.id !== itemId);
    if (!movingItem) {
      movingItem = pool.find((item) => item.id === itemId);
    }

    if (!movingItem) return;

    if (targetTier === "POOL") {
      setPool([...filteredPool, movingItem]);
      setLanes(updatedLanes);
      return;
    }

    updatedLanes[targetTier] = [...updatedLanes[targetTier], movingItem];
    setPool(filteredPool);
    setLanes(updatedLanes);
    setJustSaved(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, target: TierKey | "POOL") => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain");
    if (!itemId) return;
    moveItem(itemId, target);
    setActiveId(null);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string) => {
    event.dataTransfer.setData("text/plain", itemId);
    setActiveId(itemId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const placements = (Object.keys(lanes) as TierKey[]).flatMap((tier) =>
      lanes[tier].map((item) => ({ itemId: item.id, tier }))
    );
    const response = await saveTierPlacementsAction(topic.id, placements, sessionId);
    setIsSaving(false);
    setJustSaved(response.success);
  };

  const reset = () => {
    setPool(topic.items);
    setLanes({ S: [], A: [], B: [], C: [], F: [] });
    setJustSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Type C · 티어형</p>
          <h1 className="font-heading text-3xl">{topic.title}</h1>
          <p className="text-sm text-muted-foreground">{topic.category}</p>
        </div>
        <div className="flex gap-2">
          <NeoButton variant="outline" onClick={reset} size="sm">
            초기화
          </NeoButton>
          <NeoButton onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? "저장 중..." : justSaved ? "저장됨" : "저장"}
          </NeoButton>
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(TIER_LABELS) as TierKey[]).map((tier) => (
          <div key={tier} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("px-3 py-1 border-2 border-black font-bold", TIER_LABELS[tier].color)}>
                {TIER_LABELS[tier].name}
              </span>
              <span className="text-xs text-muted-foreground">
                드래그해서 넣어주세요
              </span>
            </div>
            <NeoCard
              className={cn(
                "min-h-[140px] border-dashed border-2 border-black p-3",
                activeId ? "bg-background" : "bg-white"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, tier)}
            >
              {lanes[tier].length === 0 ? (
                <p className="text-sm text-muted-foreground">아직 배치된 항목이 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {lanes[tier].map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="w-32 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing"
                    >
                      <div className="relative w-full h-24 border-b-2 border-black overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="px-2 py-1 text-sm font-bold truncate">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </NeoCard>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-heading text-xl mb-2">아이템 풀</h3>
        <NeoCard
          className="min-h-[140px] border-dashed border-2 border-black p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "POOL")}
        >
          {pool.length === 0 ? (
            <p className="text-sm text-muted-foreground">모두 배치되었습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {pool.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="w-32 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing"
                >
                  <div className="relative w-full h-24 border-b-2 border-black overflow-hidden">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="px-2 py-1 text-sm font-bold truncate">{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </NeoCard>
      </div>
    </div>
  );
}
