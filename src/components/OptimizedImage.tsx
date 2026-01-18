import { useState, useEffect, useRef, ImgHTMLAttributes, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean; // For above-fold images
  placeholder?: "blur" | "empty" | "skeleton";
  wrapperClassName?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
}

// Check if browser supports WebP
const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Convert image path to WebP if available
const getOptimizedSrc = (src: string): { webp?: string; original: string } => {
  // If it's already a data URL or external URL, return as-is
  if (src.startsWith('data:') || src.startsWith('http')) {
    return { original: src };
  }
  
  // For local images, we could check for WebP versions
  // This would require WebP versions to be pre-generated
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return {
    webp: webpSrc !== src ? webpSrc : undefined,
    original: src
  };
};

const OptimizedImage = memo(({
  src,
  alt,
  priority = false,
  placeholder = "skeleton",
  className,
  wrapperClassName,
  aspectRatio,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: "300px", // Start loading 300px before entering viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Still mark as loaded to remove skeleton
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        wrapperClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton/blur placeholder */}
      {!isLoaded && (
        <div 
          className={cn(
            "absolute inset-0",
            placeholder === "skeleton" && "bg-muted animate-pulse",
            placeholder === "blur" && "bg-gradient-to-br from-muted/60 to-muted/40 backdrop-blur-sm"
          )}
          aria-hidden="true"
        />
      )}
      
      {isInView && !hasError && (
        <picture>
          {/* WebP source for browsers that support it */}
          {optimizedSrc.webp && supportsWebP && (
            <source srcSet={optimizedSrc.webp} type="image/webp" />
          )}
          {/* Original image as fallback */}
          <img
            src={optimizedSrc.original}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            {...props}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;

