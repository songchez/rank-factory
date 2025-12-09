import { useState } from "react";
import { RankingItem } from "../lib/types";
import { updateItemAction } from "../lib/actions";
import { NeoButton } from "../neo-button";
import { ImageUpload } from "../image-upload";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface EditItemDialogProps {
  item: RankingItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ item, open, onOpenChange }: EditItemDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [description, setDescription] = useState(item.description || "");
  const [rankOrder, setRankOrder] = useState<number | "">(item.rankOrder ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await updateItemAction(
      item.id,
      name,
      imageUrl,
      description,
      typeof rankOrder === "number" ? rankOrder : undefined
    );
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      ;
    } else {
      alert("수정 실패: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">항목 수정</DialogTitle>
          <DialogDescription>
            항목의 이름과 이미지를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="항목 이름"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">이미지</label>
            <ImageUpload
              onUploadComplete={setImageUrl}
              defaultImage={imageUrl}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary min-h-[90px]"
              placeholder="항목에 대한 설명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">순위 (팩트형)</label>
            <input
              type="number"
              value={rankOrder}
              onChange={(e) => setRankOrder(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="예: 1"
              min={0}
            />
          </div>
          <DialogFooter>
            <NeoButton
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </NeoButton>
            <NeoButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "저장"}
            </NeoButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
