import { useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

// Intro behaviour:
//  - Try to play the full intro video from start to finish.
//  - Begin the fade-out FADE_LEAD_MS before the video ends so the transition
//    into the site is smooth instead of a harsh cut on the `ended` event.
//  - If the video hasn't started playing within LOAD_TIMEOUT_MS, assume
//    autoplay is blocked / network is too slow and land the user on the
//    site rather than leaving them on a black screen.
//  - HARD_MAX_MS is a last-resort ceiling so no matter what (tab back-
//    grounded mid-play, battery saver, corrupted video), the user always
//    reaches the site within this bound.
//  - On slow connections / save-data, skip straight to the site.
const LOAD_TIMEOUT_MS = 4000;
const HARD_MAX_MS = 12000;
const FADE_LEAD_MS = 1000;   // start fading 1s before the video's natural end
const FADE_DURATION_MS = 900; // how long the fade itself lasts

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const playAttemptedRef = useRef(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  /** Kick off the opacity fade. Doesn't finish the intro immediately —
   *  `onComplete` is called after the fade duration elapses, unmounting
   *  the overlay and revealing the site underneath. */
  const startFade = () => {
    if (fadeStartedRef.current || hasCompletedRef.current) return;
    fadeStartedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
      onComplete();
    }, FADE_DURATION_MS);
  };

  /** Bail immediately without the fade (errors, slow networks, safety
   *  ceilings). */
  const bailImmediately = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    onComplete();
  };

  useEffect(() => {
    const video = videoRef.current;

    // Skip intro on slow / data-saver connections — no fallback screen.
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g' || connection.saveData === true) {
        bailImmediately();
        return;
      }
    }

    if (!video) return;

    // If the video hasn't started by LOAD_TIMEOUT_MS, bail.
    loadTimeoutRef.current = setTimeout(() => bailImmediately(), LOAD_TIMEOUT_MS);

    // Hard safety ceiling — if the video somehow stalls mid-play we still
    // release the user after HARD_MAX_MS.
    maxTimeoutRef.current = setTimeout(() => startFade(), HARD_MAX_MS);

    const clearLoadTimeout = () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };

    const handlePlaying = () => clearLoadTimeout();

    const handleTimeUpdate = () => {
      clearLoadTimeout();
      if (fadeStartedRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      // Start fading FADE_LEAD_MS before the video's natural end so the
      // transition into the site overlaps the last second of the clip.
      const lead = FADE_LEAD_MS / 1000;
      if (video.currentTime >= Math.max(0, video.duration - lead)) {
        startFade();
      }
    };

    // `ended` is a safety net — if timeupdate throttling means we never
    // cross the fade threshold, the natural end of the clip still exits.
    const handleEnded = () => startFade();

    const handleError = () => bailImmediately();

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
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        willChange: 'opacity',
        transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
      }}
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
