import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Smooth parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const contentY = useTransform(scrollYProgress, [0, 0.5, 1], ["30px", "0px", "-30px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-center justify-center overflow-hidden ${className ?? ''}`}
    >
      {/* Parallax background with smooth motion */}
      {backgroundImage && (
        <motion.div 
          className="absolute inset-0 w-full h-[130%]"
          style={{
            y: backgroundY,
            scale,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      {/* Animated gradient overlay with subtle shimmer */}
      <div className="absolute inset-0 z-[1]">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, hsl(217 91% 60% / 0.88) 0%, hsl(217 91% 60% / 0.65) 40%, hsl(217 91% 60% / 0.35) 70%, transparent 100%)'
          }}
        />
        {/* Subtle animated glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content with smooth parallax motion */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 sm:px-6 py-10 md:py-14 lg:py-16 text-center"
        style={{
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        <motion.h2 
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-5 text-white drop-shadow-2xl leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {title}
        </motion.h2>
        <motion.p 
          className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {description}
        </motion.p>
      </motion.div>

      {/* Bottom fade for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-[2]" />
    </section>
  );
};

export default StorytellingSection;
