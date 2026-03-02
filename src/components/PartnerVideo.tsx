import { useRef, useEffect, useState, useCallback } from "react";
import { Play } from "lucide-react";

const PartnerVideo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const resetAndPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting;
        setIsVisible(nowVisible);

        const video = videoRef.current;
        if (!video) return;

        if (nowVisible) {
          // Reset to start and autoplay every time section is reached
          video.currentTime = 0;
          video.muted = !hasInteracted;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasInteracted]);

  const handleUserPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasInteracted(true);
    video.muted = false;
    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
      onClick={handleUserPlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        preload="metadata"
        controls={hasInteracted}
      >
        <source src="/partner-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Unmute / play overlay — shown when autoplaying muted */}
      {isVisible && !hasInteracted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
          </div>
          <span className="absolute bottom-4 text-white/80 text-sm font-medium">
            Tap to unmute
          </span>
        </div>
      )}
    </div>
  );
};

export default PartnerVideo;
