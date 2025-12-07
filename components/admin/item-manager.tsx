"use client";

import { useState, useEffect } from "react";
import { RankingItem, type TopicMode } from "@/lib/types";
import { createItemAction, deleteItemAction, updateItemOrdersAction } from "@/lib/actions";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { ImageUpload } from "@/components/image-upload";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";
import { EditItemDialog } from "./edit-item-dialog";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ItemManagerProps {
  topicId: string;
  initialItems: RankingItem[];
  topicMode?: TopicMode;
}

export function ItemManager({ topicId, initialItems, topicMode = "A" }: ItemManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemOrder, setNewItemOrder] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<RankingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<RankingItem | null>(null);

  useEffect(() => {
    const sorted = [...initialItems].sort((a, b) => {
      const aOrder = a.rankOrder || 0;
      const bOrder = b.rankOrder || 0;
      if (aOrder !== bOrder && (aOrder > 0 || bOrder > 0)) {
        return (aOrder || Number.MAX_SAFE_INTEGER) - (bOrder || Number.MAX_SAFE_INTEGER);
      }
      return b.name.localeCompare(a.name);
    });
    setItems(sorted);
    setHasOrderChanges(false);
  }, [initialItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    const result = await createItemAction(
      topicId,
      newItemName,
      newItemImage,
      undefined,
      typeof newItemOrder === "number" ? newItemOrder : undefined
    );
    setIsSubmitting(false);

    if (result.success) {
      setNewItemName("");
      setNewItemImage("");
      setNewItemOrder("");
      router.refresh();
    } else {
      alert("항목 추가 실패: " + result.error);
    }
  };

  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    const updated = [...items];
    const fromIndex = updated.findIndex((it) => it.id === draggingId);
    const toIndex = updated.findIndex((it) => it.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    const payload = items.map((item, idx) => ({
      itemId: item.id,
      rankOrder: idx + 1,
    }));
    const result = await updateItemOrdersAction(topicId, payload);
    setIsSavingOrder(false);
    if (result.success) {
      setHasOrderChanges(false);
      router.refresh();
    } else {
      alert(result.error || "순위 저장 실패");
    }
  };

  const handleDeleteItem = async () => {
    console.log("handleDeleteItem called", deletingItem);
    if (!deletingItem) return;

    const result = await deleteItemAction(deletingItem.id);
    console.log("deleteItemAction result:", result);
    if (result.success) {
      setDeletingItem(null);
      router.refresh();
    } else {
      alert("삭제 실패: " + result.error);
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
          {topicMode === "D" && (
            <div>
              <label className="block text-sm font-bold mb-1">순위 (숫자 낮을수록 상위)</label>
              <input
                type="number"
                value={newItemOrder}
                onChange={(e) => setNewItemOrder(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="예: 1"
                min={0}
              />
            </div>
          )}
        </form>
        {topicMode === "D" && (
          <div className="mt-4 flex justify-end gap-2">
            <NeoButton
              variant="primary"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSavingOrder || !hasOrderChanges}
            >
              {isSavingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : "순위 저장"}
            </NeoButton>
          </div>
        )}
      </NeoCard>

      {/* Item List */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl">등록된 항목 ({items.length})</h3>
        {topicMode === "D" ? (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <NeoCard
                key={item.id}
                className="p-3 flex items-center gap-3 relative group cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDragOver(e, item.id)}
              >
                <div className="flex items-center gap-3 flex-1" onClick={() => setEditingItem(item)}>
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                  <div className="font-heading text-xl w-10 text-center">{idx + 1}</div>
                  <div className="relative w-16 h-16 border border-black flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-base">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NeoButton
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingItem(item);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <NeoCard
                key={item.id}
                className="p-3 flex flex-col gap-2 relative group cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setEditingItem(item)}
              >
                <div className="relative w-full aspect-square bg-gray-100 border border-black overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="font-bold text-center truncate">{item.name}</div>
                <div className="text-xs text-center text-muted-foreground">
                  {topicMode === "D" ? `순위 ${item.rankOrder ?? "-"}` : `ELO ${item.eloScore}`}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NeoButton
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingItem(item);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 항목이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-500 text-white border-2 border-black hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
