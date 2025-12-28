import { useEffect, useRef, useState } from 'react';

interface StorytellingSectionProps {
  title: string;
  description: string;
  backgroundImage?: string;
  theme?: "light" | "dark";
}

const StorytellingSection = ({ 
  title, 
  description, 
  backgroundImage,
  theme = "light" 
}: StorytellingSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Calculate parallax offset based on section position
        const offset = (rect.top - windowHeight) * 0.3;
        setScrollY(offset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: `center ${50 + scrollY * 0.05}%`,
        backgroundAttachment: "scroll",
      } : undefined}
    >
      {/* Enhanced gradient overlay - top has low transparency, bottom fully transparent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-blue-600/30 to-transparent"></div>
      {/* Additional vignette effect for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.2)_100%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
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
