import { useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const playAttemptedRef = useRef(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  const triggerExit = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsExiting(true);
    setTimeout(onComplete, 500);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set a 4-second timeout - if video hasn't started playing by then, skip intro
    loadTimeoutRef.current = setTimeout(() => {
      console.log("Video load timeout - skipping intro");
      triggerExit();
    }, 4000);

    const handleTimeUpdate = () => {
      // Clear load timeout once video is playing
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      // Play only first 4.5 seconds then exit
      if (video.currentTime >= 4.5 && !isExiting) {
        triggerExit();
      }
    };

    const handleCanPlay = () => {
      // As soon as video can play, start it
      if (!playAttemptedRef.current) {
        playAttemptedRef.current = true;
        forcePlay();
      }
    };

    const handleError = () => {
      console.log("Video error - skipping intro");
      triggerExit();
    };

    const handleStalled = () => {
      console.log("Video stalled - starting fallback timer");
      // If video stalls, give it 2 more seconds before skipping
      setTimeout(() => {
        if (video.paused || video.readyState < 3) {
          triggerExit();
        }
      }, 2000);
    };

    // Ultra-aggressive autoplay for mobile
    const forcePlay = async () => {
      if (!video || hasCompletedRef.current) return;
      
      // Ensure muted and inline
      video.muted = true;
      video.playsInline = true;
      
      // Attempt 1: Immediate play
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Video autoplay successful");
          // Clear load timeout on successful play
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
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
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        return;
      } catch (retryError) {
        console.warn("Retry autoplay blocked:", retryError);
      }
      
      // On mobile, if autoplay fails, skip the intro immediately
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log("Mobile autoplay failed - skipping intro");
        triggerExit();
        return;
      }
      
      // Desktop fallback - wait for interaction briefly then skip
      setTimeout(() => {
        if (!hasCompletedRef.current && (video.paused || video.readyState < 3)) {
          console.log("Autoplay not working - skipping intro");
          triggerExit();
        }
      }, 1500);
    };

    // Set up event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    
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
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      clearTimeout(delayTimer);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
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
