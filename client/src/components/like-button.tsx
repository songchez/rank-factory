import { useState, useEffect } from "react";
import { toggleLike, checkLikeStatus } from "../lib/api";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  topicId: string;
  initialLikeCount?: number;
  className?: string;
  showCount?: boolean;
  compact?: boolean;
}

export function LikeButton({
  topicId,
  initialLikeCount = 0,
  className = "",
  showCount = true,
  compact = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Check like status on mount
  useEffect(() => {
    checkLikeStatus(topicId)
      .then((res) => {
        if (res.success) {
          setLiked(res.liked);
        }
      })
      .catch((err) => {
        console.error("Failed to check like status:", err);
      });
  }, [topicId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (loading) return;

    setLoading(true);
    setAnimating(true);

    try {
      const res = await toggleLike(topicId);
      if (res.success) {
        setLiked(res.liked);
        setLikeCount(res.likeCount);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-1 transition-all hover:scale-110 active:scale-95 ${className}`}
      style={{
        filter: "drop-shadow(2px 2px 0px rgba(0, 0, 0, 1))",
        transition: "all 0.2s ease",
      }}
    >
      <Heart
        className={`${compact ? "w-6 h-6" : "w-7 h-7"} transition-all ${
          animating ? "animate-ping-once" : ""
        } ${
          liked
            ? "fill-red-500 stroke-red-600 stroke-2"
            : "stroke-[#fbf8cc] stroke-2"
        }`}
        style={{
          fill: liked ? "#ef4444" : "#fbf8cc",
        }}
      />
      {showCount && (
        <span
          className={`${compact ? "text-xs" : "text-sm"} font-fixel font-bold`}
          style={{
            color: liked ? "#ef4444" : "#fbf8cc",
            textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
          }}
        >
          {likeCount}
        </span>
      )}
      <style>{`
        @keyframes ping-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5) rotate(15deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-ping-once {
          animation: ping-once 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
    </button>
  );
}
