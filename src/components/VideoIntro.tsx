import { useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const playAttemptedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Play only first 4.5 seconds then exit
      if (video.currentTime >= 4.5 && !isExiting) {
        setIsExiting(true);
        setTimeout(onComplete, 500);
      }
    };

    const handleCanPlay = () => {
      // As soon as video can play, start it
      if (!playAttemptedRef.current) {
        playAttemptedRef.current = true;
        forcePlay();
      }
    };

    // Ultra-aggressive autoplay for mobile
    const forcePlay = async () => {
      if (!video) return;
      
      // Ensure muted and inline
      video.muted = true;
      video.playsInline = true;
      
      // Attempt 1: Immediate play
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Video autoplay successful");
          return;
        }
      } catch (error) {
        console.warn("Initial autoplay blocked:", error);
      }
      
      // Attempt 2: Load and retry
      try {
        video.load();
        video.muted = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        await video.play();
        console.log("Video autoplay successful on retry");
        return;
      } catch (retryError) {
        console.warn("Retry autoplay blocked:", retryError);
      }
      
      // Attempt 3: Play on any interaction
      const playOnInteraction = async () => {
        try {
          video.muted = true;
          await video.play();
          console.log("Video playing after interaction");
        } catch (e) {
          console.error("All autoplay attempts failed:", e);
        }
      };
      
      // Listen for multiple interaction types
      const events = ['touchstart', 'touchend', 'click', 'scroll', 'keydown'];
      events.forEach(event => {
        document.addEventListener(event, playOnInteraction, { once: true, passive: true });
      });
      
      // Auto-cleanup after 5 seconds
      setTimeout(() => {
        events.forEach(event => {
          document.removeEventListener(event, playOnInteraction);
        });
      }, 5000);
    };

    // Set up event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    
    // Try to play immediately on mount
    if (video.readyState >= 2) {
      handleCanPlay();
    }

    // Also try after a brief delay
    const delayTimer = setTimeout(() => {
      if (!playAttemptedRef.current) {
        playAttemptedRef.current = true;
        forcePlay();
      }
    }, 100);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      clearTimeout(delayTimer);
    };
  }, [onComplete, isExiting]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-500 ${
        isExiting ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
      }`}
      style={{ willChange: 'transform, opacity' }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        muted
        autoPlay
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate nofullscreen"
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoIntro;
