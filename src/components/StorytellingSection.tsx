import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section 
      ref={ref}
      className="relative py-20 md:py-28 overflow-hidden my-8 rounded-2xl"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      } : undefined}
    >
      {/* Enhanced blue gradient overlay with animated texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-blue-600/90 to-cyan-600/85"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
        }}></div>
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className={`relative z-10 container mx-auto px-4 text-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Quote marks */}
        <div className="text-6xl md:text-8xl text-white/20 font-serif leading-none mb-4">"</div>
        
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 text-white drop-shadow-2xl leading-tight">
          {title}
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg">
          {description}
        </p>
        
        {/* Bottom decorative element */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-12 h-0.5 bg-white/40 rounded-full"></div>
          <div className="w-3 h-3 bg-cyan-300/80 rounded-full"></div>
          <div className="w-12 h-0.5 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default StorytellingSection;
