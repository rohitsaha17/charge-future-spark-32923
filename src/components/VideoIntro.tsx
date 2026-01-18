import { useEffect, useRef, useState } from "react";
import logomark from "@/assets/logomark.png";

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const hasCompletedRef = useRef(false);
  const playStartedRef = useRef(false);

  const triggerExit = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsExiting(true);
    setTimeout(onComplete, 400);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Extended timeout - 8 seconds for slow networks before skipping
    const loadTimeout = setTimeout(() => {
      if (!playStartedRef.current) {
        console.log("Video load timeout (8s) - skipping intro");
        triggerExit();
      }
    }, 8000);

    const handleTimeUpdate = () => {
      // Play only first 4.5 seconds then exit
      if (video.currentTime >= 4.5 && !hasCompletedRef.current) {
        triggerExit();
      }
    };

    const handleCanPlayThrough = () => {
      // Video is fully buffered enough to play without interruption
      attemptPlay();
    };

    const handlePlaying = () => {
      // Video actually started playing - show it
      playStartedRef.current = true;
      setIsVideoVisible(true);
      clearTimeout(loadTimeout);
    };

    const handleError = () => {
      console.log("Video error - skipping intro");
      triggerExit();
    };

    const attemptPlay = async () => {
      if (!video || hasCompletedRef.current || playStartedRef.current) return;
      
      // Ensure muted and inline for autoplay
      video.muted = true;
      video.playsInline = true;
      
      try {
        await video.play();
        console.log("Video autoplay successful");
      } catch (error) {
        console.warn("Autoplay blocked:", error);
        // Skip intro if autoplay fails
        triggerExit();
      }
    };

    // Set up event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    
    // If video is already ready (cached), play immediately
    if (video.readyState >= 4) {
      handleCanPlayThrough();
    } else if (video.readyState >= 3) {
      attemptPlay();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      clearTimeout(loadTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 flex items-center justify-center transition-all duration-400 ${
        isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Loading state - visible while video loads */}
      {!isVideoVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Animated background glow */}
          <div 
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(38,116,236,0.25) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
          
          {/* Logo */}
          <div className="relative z-20 flex flex-col items-center">
            <img 
              src={logomark} 
              alt="A Plus Charge" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain mb-4"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(38,116,236,0.5))',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            {/* Loading spinner */}
            <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm mt-4">Loading...</p>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover relative z-20 transition-opacity duration-300 ${
          isVideoVisible ? 'opacity-100' : 'opacity-0'
        }`}
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
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        <source src="/intro-video.mp4" type="video/mp4" />
      </video>

      {/* Skip button - always visible */}
      <button
        onClick={triggerExit}
        className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium transition-all duration-200 z-30 border border-white/20"
      >
        Skip →
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoIntro;
