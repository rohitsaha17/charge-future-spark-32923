import { useEffect, useRef, useState } from 'react';

interface StorytellingSectionProps {
  title: string;
  description: string;
  backgroundImage?: string;
  theme?: "light" | "dark";
  className?: string;
  noTopPadding?: boolean;
}

const StorytellingSection = ({
  title,
  description,
  backgroundImage,
  theme = "light",
  className,
  noTopPadding = false,
}: StorytellingSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85) {
          setIsVisible(true);
        }

        // Calculate parallax offset based on scroll position
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
        setParallaxOffset(clampedProgress * 50 - 25); // -25 to 25 range for subtle effect
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[35vh] md:h-[35vh] flex items-center justify-center overflow-hidden -my-px ${className ?? ''}`}
    >
      {/* Parallax Background - Responsive sizing */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          }}
        />
      )}
      
      {/* Blue gradient overlay - full opacity at top, fading to transparent at bottom */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to bottom, hsl(217 91% 60% / 0.85) 0%, hsl(217 91% 60% / 0.5) 40%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div 
        className={`relative z-10 container mx-auto px-4 py-8 md:py-0 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white drop-shadow-2xl">
          {title}
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium">
          {description}
        </p>
      </div>
    </section>
  );
};

export default StorytellingSection;

