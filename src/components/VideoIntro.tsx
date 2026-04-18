import { useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

// Intro behaviour:
//  - Try to play the full intro video from start to finish.
//  - Exit when the video's `ended` event fires (natural completion).
//  - If the video hasn't started playing within LOAD_TIMEOUT_MS, assume
//    autoplay is blocked / network is too slow and land the user on the
//    site rather than leaving them on a black screen.
//  - HARD_MAX_MS is a last-resort ceiling so no matter what (tab back-
//    grounded mid-play, battery saver, corrupted video), the user always
//    reaches the site within this bound.
//  - On slow connections / save-data, skip straight to the site.
const LOAD_TIMEOUT_MS = 4000;
const HARD_MAX_MS = 12000;

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

    // If the video hasn't started by LOAD_TIMEOUT_MS, bail.
    loadTimeoutRef.current = setTimeout(() => {
      triggerExit(true);
    }, LOAD_TIMEOUT_MS);

    // Hard safety ceiling — if the video somehow stalls mid-play we still
    // release the user after HARD_MAX_MS.
    maxTimeoutRef.current = setTimeout(() => {
      triggerExit();
    }, HARD_MAX_MS);

    const clearLoadTimeout = () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };

    // Once frames are rendering, relax the load-timeout watchdog.
    const handlePlaying = () => clearLoadTimeout();
    const handleTimeUpdate = () => clearLoadTimeout();

    // Natural completion — exit with fade.
    const handleEnded = () => triggerExit();

    const handleError = () => triggerExit(true);

    const forcePlay = async () => {
      if (!video || hasCompletedRef.current) return;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch {
        // Autoplay blocked — the timeout will carry the user through.
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
    video.addEventListener('ended', handleEnded);
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
      video.removeEventListener('ended', handleEnded);
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
