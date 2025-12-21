import { useState } from "react";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

export function ShareButton({
  url,
  title = "랭크팩토리",
  text = "재밌는 랭킹 콘텐츠를 확인해보세요!",
  className = "",
  compact = false,
  showLabel = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Get URL from environment or fallback to window location
  const getAppUrl = () => {
    if (import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://rank-factory.com"; // fallback
  };

  const shareUrl = url || window.location.href;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Mobile share API 지원 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled or failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1 transition-all hover:scale-110 active:scale-95 ${className}`}
      style={{
        filter: "drop-shadow(2px 2px 0px rgba(0, 0, 0, 1))",
        transition: "all 0.2s ease",
      }}
    >
      <Share2
        className={`${
          compact ? "w-6 h-6" : "w-7 h-7"
        } transition-all stroke-[#fbf8cc] stroke-2`}
        style={{
          fill: copied ? "#8c52ff" : "#fbf8cc",
        }}
      />
      {showLabel && (
        <span
          className={`${compact ? "text-xs" : "text-sm"} font-fixel font-bold`}
          style={{
            color: copied ? "#8c52ff" : "#fbf8cc",
            textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
          }}
        >
          {copied ? "복사됨!" : "공유"}
        </span>
      )}
    </button>
  );
}
