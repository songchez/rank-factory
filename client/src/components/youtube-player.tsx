interface YouTubePlayerProps {
  url: string;
  className?: string;
  fullHeight?: boolean;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({ url, className = "", fullHeight = false }: YouTubePlayerProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  if (fullHeight) {
    // 전체 높이 모드 (배틀 화면용)
    return (
      <iframe
        className={`w-full h-full ${className}`}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative pb-[56.25%]">
        {/* 16:9 aspect ratio */}
        <iframe
          className="absolute top-0 left-0 w-full h-full border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
