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

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden ${className ?? ''}`}
    >
      {/* Fixed Parallax Background - Full page, stays in place */}
      {backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
      )}
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-blue-600/40 to-primary/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.3)_100%)]" />

      {/* Content */}
      <div 
        className={`relative z-10 container mx-auto px-4 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
          {title}
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium">
          {description}
        </p>
      </div>
    </section>
  );
};

export default StorytellingSection;

