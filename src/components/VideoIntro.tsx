import { useEffect, useRef, useState } from "react";
import logomark from "@/assets/logomark.png";

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
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

    // More generous timeout - 6 seconds for slow networks
    const loadTimeout = setTimeout(() => {
      if (!playStartedRef.current) {
        console.log("Video load timeout - showing fallback");
        setShowFallback(true);
        // Give fallback animation 2 seconds to show, then complete
        setTimeout(triggerExit, 2000);
      }
    }, 6000);

    // Quick fallback for very slow connections - show logo animation after 1.5s
    const quickFallback = setTimeout(() => {
      if (!isVideoReady && !playStartedRef.current) {
        setShowFallback(true);
      }
    }, 1500);

    const handleTimeUpdate = () => {
      // Play only first 4.5 seconds then exit
      if (video.currentTime >= 4.5 && !hasCompletedRef.current) {
        triggerExit();
      }
    };

    const handleCanPlayThrough = () => {
      // Video is fully buffered enough to play without interruption
      setIsVideoReady(true);
      setShowFallback(false);
      attemptPlay();
    };

    const handlePlaying = () => {
      // Video actually started playing
      playStartedRef.current = true;
      setShowFallback(false);
      clearTimeout(loadTimeout);
      clearTimeout(quickFallback);
    };

    const handleError = () => {
      console.log("Video error - showing fallback");
      setShowFallback(true);
      setTimeout(triggerExit, 2000);
    };

    const handleStalled = () => {
      console.log("Video stalled");
      // If video stalls and hasn't started, show fallback
      if (!playStartedRef.current) {
        setShowFallback(true);
      }
    };

    const handleWaiting = () => {
      // Video is buffering - show fallback if taking too long
      if (!playStartedRef.current) {
        setTimeout(() => {
          if (!playStartedRef.current) {
            setShowFallback(true);
          }
        }, 1000);
      }
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
        // Show fallback animation instead
        setShowFallback(true);
        setTimeout(triggerExit, 2000);
      }
    };

    // Set up event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    
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
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      clearTimeout(loadTimeout);
      clearTimeout(quickFallback);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-400 ${
        isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Fallback loading animation - shows while video loads or if it fails */}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(38,116,236,0.3) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,198,255,0.2) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite 0.5s'
              }}
            />
          </div>
          
          {/* Logo animation */}
          <div className="relative z-20 flex flex-col items-center">
            <div 
              className="relative w-24 h-24 md:w-32 md:h-32 mb-4"
              style={{ animation: 'logoEnter 0.6s ease-out forwards' }}
            >
              {/* Glow ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #2674EC, #00C6FF)',
                  filter: 'blur(20px)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
              {/* Logo */}
              <img 
                src={logomark} 
                alt="A Plus Charge" 
                className="relative w-full h-full object-contain drop-shadow-2xl"
                loading="eager"
              />
            </div>
            <div 
              className="text-white text-xl md:text-2xl font-bold tracking-wider"
              style={{ animation: 'fadeIn 0.5s ease-out 0.3s forwards', opacity: 0 }}
            >
              A<span className="text-primary">+</span> CHARGE
            </div>
            <div 
              className="text-white/60 text-sm mt-2"
              style={{ animation: 'fadeIn 0.5s ease-out 0.5s forwards', opacity: 0 }}
            >
              Powering the Future
            </div>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${showFallback ? 'opacity-0' : 'opacity-100'}`}
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
        @keyframes logoEnter {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoIntro;
