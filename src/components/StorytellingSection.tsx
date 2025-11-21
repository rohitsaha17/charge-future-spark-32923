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
  return (
    <section 
      className="relative py-16 md:py-20 overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(to bottom, rgba(240,245,255,0.75), rgba(230,240,255,0.85), rgba(245,250,255,0.80)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      } : undefined}
    >
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent drop-shadow-lg">
          {title}
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed drop-shadow-sm">
          {description}
        </p>
      </div>
    </section>
  );
};

export default StorytellingSection;
