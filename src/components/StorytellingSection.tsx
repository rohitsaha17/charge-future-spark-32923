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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85) {
          setIsVisible(true);
        }

        // Calculate scroll progress for parallax (0 to 1 as section scrolls through viewport)
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax offset: moves background slower than scroll
  const parallaxOffset = (scrollProgress - 0.5) * 80; // -40 to 40 range

  return (
    <section
      ref={sectionRef}
      className={`relative w-full min-h-[25vh] md:min-h-[30vh] lg:min-h-[35vh] flex items-center justify-center overflow-hidden snap-start snap-always ${className ?? ''}`}
      style={{ margin: 0, padding: 0 }}
    >
      {/* Full-page parallax background with visible edges */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${parallaxOffset}px) scale(1.15)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
      
      {/* Blue gradient overlay - full opacity at top, fading to transparent at bottom */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to bottom, hsl(217 91% 60% / 0.9) 0%, hsl(217 91% 60% / 0.7) 30%, hsl(217 91% 60% / 0.4) 60%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div 
        className={`relative z-10 container mx-auto px-4 sm:px-6 py-8 md:py-10 lg:py-12 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-white drop-shadow-2xl leading-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
          {description}
        </p>
      </div>
    </section>
  );
};

export default StorytellingSection;
