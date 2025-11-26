"use client";

import { useState } from "react";
import { RankingItem } from "@/lib/types";
import { createItemAction } from "@/lib/actions";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { ImageUpload } from "@/components/image-upload";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface ItemManagerProps {
  topicId: string;
  initialItems: RankingItem[];
}

export function ItemManager({ topicId, initialItems }: ItemManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    const result = await createItemAction(topicId, newItemName, newItemImage);
    setIsSubmitting(false);

    if (result.success) {
      setNewItemName("");
      setNewItemImage("");
      // Ideally, we'd fetch the new list or optimistic update. 
      // For now, we rely on page refresh or simple state append if we returned the item.
      // Since createItemAction revalidates, a router.refresh() would be best, 
      // but let's just alert for now or assume the user refreshes.
      window.location.reload(); 
    } else {
      alert("항목 추가 실패: " + result.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Item Form */}
      <NeoCard className="p-6 bg-white">
        <h3 className="font-heading text-xl mb-4">새 항목 추가</h3>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">이름</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="항목 이름 (예: 신라면)"
                  required
                />
              </div>
              <NeoButton type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "추가하기"}
              </NeoButton>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-1">이미지</label>
              <ImageUpload 
                onUploadComplete={setNewItemImage} 
                defaultImage={newItemImage}
              />
            </div>
          </div>
        </form>
      </NeoCard>

      {/* Item List */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl">등록된 항목 ({items.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <NeoCard key={item.id} className="p-3 flex flex-col gap-2">
              <div className="relative w-full aspect-square bg-gray-100 border border-black overflow-hidden">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="font-bold text-center truncate">{item.name}</div>
              <div className="text-xs text-center text-muted-foreground">ELO {item.eloScore}</div>
            </NeoCard>
          ))}
        </div>
      </div>
    </div>
  );
}
