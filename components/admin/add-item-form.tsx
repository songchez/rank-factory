"use client";

import { useState } from "react";
import { createItemAction } from "@/lib/actions";
import { NeoButton } from "@/components/neo-button";
import { Loader2, Plus } from "lucide-react";

interface AddItemFormProps {
  topicId: string;
}

export function AddItemForm({ topicId }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const result = await createItemAction(topicId, name, imageUrl);
    setIsLoading(false);

    if (result.success) {
      setName("");
      setImageUrl("");
    } else {
      alert("추가 실패: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
      <NeoButton type="submit" disabled={isLoading} size="sm" className="px-3">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </NeoButton>
    </form>
  );
}
