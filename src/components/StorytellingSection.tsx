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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      } : undefined}
    >
      <div className={`absolute inset-0 ${
        theme === "dark" 
          ? "bg-gradient-to-b from-background/90 via-background/85 to-background/90" 
          : "bg-gradient-to-b from-background/95 via-background/90 to-background/95"
      }`}></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent drop-shadow-lg">
          {title}
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed drop-shadow-md">
          {description}
        </p>
      </div>
    </section>
  );
};

export default StorytellingSection;
