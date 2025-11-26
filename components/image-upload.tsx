"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NeoButton } from "@/components/neo-button";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
}

export function ImageUpload({ onUploadComplete, defaultImage }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(defaultImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ranking-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("ranking-images").getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
      onUploadComplete(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("이미지 업로드 실패");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    onUploadComplete("");
  };

  return (
    <div className="w-full">
      {imageUrl ? (
        <div className="relative w-32 h-32 border-2 border-black">
          <Image src={imageUrl} alt="Uploaded" fill className="object-cover" />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full border-2 border-black hover:bg-red-600"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <NeoButton
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white text-black"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                이미지 업로드
              </>
            )}
          </NeoButton>
        </div>
      )}
    </div>
  );
}
