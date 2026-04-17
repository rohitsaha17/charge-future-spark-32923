import { useEffect, useRef, useState } from "react";
import logomark from "@/assets/logomark.png";

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const playAttemptedRef = useRef(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompletedRef = useRef(false);

  const triggerExit = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsExiting(true);
    setTimeout(onComplete, 500);
  };

  useEffect(() => {
    const video = videoRef.current;
    
    // Check connection speed - skip video on slow connections
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      // Skip video on 2G or slow 3G
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        console.log("Slow connection detected - showing fallback");
        setShowFallback(true);
        setTimeout(triggerExit, 1500);
        return;
      }
    }

    if (!video) return;

    // Set a 3-second timeout - reduced from 4s for faster fallback
    loadTimeoutRef.current = setTimeout(() => {
      console.log("Video load timeout - showing fallback");
      setShowFallback(true);
      setTimeout(triggerExit, 1000);
    }, 3000);

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
      console.log("Video error - showing fallback");
      setShowFallback(true);
      setTimeout(triggerExit, 1000);
    };

    const handleStalled = () => {
      console.log("Video stalled - starting fallback timer");
      // If video stalls, give it 1.5 more seconds before showing fallback
      setTimeout(() => {
        if (video.paused || video.readyState < 3) {
          setShowFallback(true);
          setTimeout(triggerExit, 1000);
        }
      }, 1500);
    };

    const handleWaiting = () => {
      // Video is buffering - if it takes too long, show fallback
      setTimeout(() => {
        if (!hasCompletedRef.current && video.readyState < 3) {
          console.log("Video buffering too long - showing fallback");
          setShowFallback(true);
          setTimeout(triggerExit, 1000);
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
      
      // On mobile, if autoplay fails, show fallback immediately
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log("Mobile autoplay failed - showing fallback");
        setShowFallback(true);
        setTimeout(triggerExit, 1000);
        return;
      }
      
      // Desktop fallback - wait for interaction briefly then skip
      setTimeout(() => {
        if (!hasCompletedRef.current && (video.paused || video.readyState < 3)) {
          console.log("Autoplay not working - showing fallback");
          setShowFallback(true);
          setTimeout(triggerExit, 1000);
        }
      }, 1500);
    };

    // Set up event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    
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
      video.removeEventListener('waiting', handleWaiting);
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
      {/* Fallback animation when video can't load */}
      {showFallback ? (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <img 
            src={logomark} 
            alt="A+ Charge" 
            className="w-24 h-24 md:w-32 md:h-32 animate-bounce"
            loading="eager"
          />
          <div className="mt-4 text-white text-lg font-semibold">Loading...</div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default VideoIntro;
