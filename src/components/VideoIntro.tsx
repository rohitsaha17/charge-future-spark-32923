import { useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

// Intro behaviour:
//  - Try to play the intro video.
//  - If the video hasn't started within 3s, bail to the site immediately
//    (no "Loading..." screen).
//  - On success, play the first ~4.5s then fade to the site.
//  - Absolute upper bound of 6s — whatever happens (tab backgrounded,
//    playback paused by the browser, stall), we always land the user on
//    the site by 6s.
//  - On slow connections / save-data / errors, skip straight to the site.
const LOAD_TIMEOUT_MS = 3000;
const MAX_INTRO_MS = 6000;
const CLIP_SECONDS = 4.5;

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const playAttemptedRef = useRef(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompletedRef = useRef(false);

  const triggerExit = (immediate = false) => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (immediate) {
      onComplete();
      return;
    }
    setIsExiting(true);
    setTimeout(onComplete, 350);
  };

  useEffect(() => {
    const video = videoRef.current;

    // Skip intro on slow / data-saver connections — no fallback screen.
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g' || connection.saveData === true) {
        triggerExit(true);
        return;
      }
    }

    if (!video) return;

    // If the video hasn't even started playing within LOAD_TIMEOUT_MS,
    // drop the intro and land the user on the site.
    loadTimeoutRef.current = setTimeout(() => {
      triggerExit(true);
    }, LOAD_TIMEOUT_MS);

    // Absolute upper bound — covers the case where the video plays,
    // `timeupdate` fires (clearing the load timeout), and then the browser
    // pauses playback (backgrounded tab, battery saver, etc.) so we'd never
    // reach 4.5s to exit on our own.
    maxTimeoutRef.current = setTimeout(() => {
      triggerExit();
    }, MAX_INTRO_MS);

    const clearLoadTimeout = () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };

    const handleTimeUpdate = () => {
      // First time a frame renders → we're definitely playing, keep it.
      clearLoadTimeout();
      if (video.currentTime >= CLIP_SECONDS && !hasCompletedRef.current) {
        triggerExit();
      }
    };

    const handlePlaying = () => clearLoadTimeout();

    const handleError = () => triggerExit(true);

    const forcePlay = async () => {
      if (!video || hasCompletedRef.current) return;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
        return;
      } catch {
        // Autoplay blocked. Fall through — timeout will carry us to the site.
      }
    };

    const handleCanPlay = () => {
      if (!playAttemptedRef.current) {
        playAttemptedRef.current = true;
        forcePlay();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('error', handleError);

    if (video.readyState >= 2) handleCanPlay();

    const delayTimer = setTimeout(() => {
      if (!playAttemptedRef.current) {
        playAttemptedRef.current = true;
        forcePlay();
      }
    }, 50);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.removeEventListener('error', handleError);
      clearTimeout(delayTimer);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-300 ${
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
          transform: 'translateZ(0)',
        }}
      >
        <source src="/intro-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoIntro;
