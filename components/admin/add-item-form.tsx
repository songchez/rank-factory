"use client";

import { useState } from "react";
import { createItemAction } from "@/lib/actions";
import { NeoButton } from "@/components/neo-button";
import { Loader2, Plus } from "lucide-react";

interface AddItemFormProps {
  topicId: string;
  topicMode: string;
}

export function AddItemForm({ topicId, topicMode }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [rankOrder, setRankOrder] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const result = await createItemAction(
      topicId,
      name,
      imageUrl,
      description,
      typeof rankOrder === "number" ? rankOrder : undefined
    );
    setIsLoading(false);

    if (result.success) {
      setName("");
      setImageUrl("");
      setDescription("");
      setRankOrder("");
    } else {
      alert("추가 실패: " + result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid md:grid-cols-[1.8fr_1.8fr_2.4fr_auto] grid-cols-1 gap-2 items-end"
    >
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="항목 이름"
          required
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="이미지 URL (선택)"
        />
      </div>
      <div className="flex-1 md:flex-[1.5]">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          placeholder="설명 (선택)"
        />
      </div>
      {topicMode === "D" && (
        <div className="flex items-end">
          <input
            type="number"
            value={rankOrder}
            onChange={(e) => setRankOrder(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-24 px-3 py-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="순위"
            min={0}
          />
        </div>
      )}
      <NeoButton type="submit" disabled={isLoading} size="sm" className="px-3">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </NeoButton>
    </form>
  );
}
