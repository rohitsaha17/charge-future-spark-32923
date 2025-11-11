import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlexusBackground from "@/components/PlexusBackground";
import uspFirstMover from "@/assets/usp-first-mover.jpg";
import uspAssetLight from "@/assets/usp-asset-light.jpg";
import uspHybridInvestment from "@/assets/usp-hybrid-investment.jpg";
import uspTerrain from "@/assets/usp-terrain.jpg";
import uspLocalLanguage from "@/assets/usp-local-language.jpg";
import uspNortheast from "@/assets/usp-northeast.jpg";
import uspLocalWorkforce from "@/assets/usp-local-workforce.jpg";
import uspMultiSegment from "@/assets/usp-multi-segment.jpg";
import uspPartnerships from "@/assets/usp-partnerships.jpg";

const slides = [
  { 
    image: uspFirstMover,
    title: "First-Mover Advantage", 
    description: "Leading EV charging in Northeast India with proven market presence"
  },
  { 
    image: uspAssetLight,
    title: "Asset-Light Model", 
    description: "Efficient scalable deployment strategy that maximizes ROI"
  },
  { 
    image: uspHybridInvestment,
    title: "Hybrid Investment", 
    description: "Flexible CAPEX/OPEX partnership models tailored to your needs"
  },
  { 
    image: uspTerrain,
    title: "Challenging Terrain Execution", 
    description: "Proven deployment in difficult locations across Northeast"
  },
  { 
    image: uspLocalLanguage,
    title: "Local Language Proficiency", 
    description: "Regional expertise and deep understanding of local markets"
  },
  { 
    image: uspNortheast,
    title: "Northeast Project Experience", 
    description: "Deep regional market knowledge and operational excellence"
  },
  { 
    image: uspLocalWorkforce,
    title: "Local Workforce Engagement", 
    description: "Community-driven approach with strong local partnerships"
  },
  { 
    image: uspMultiSegment,
    title: "Multi-Segment Deployment", 
    description: "Residential, commercial, and highway charging solutions"
  },
  { 
    image: uspPartnerships,
    title: "Strong Partnerships", 
    description: "Collaborations with Ather Energy, MG, Tata, and GMDA"
  },
];

const USPCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full py-20 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      <PlexusBackground opacity={0.1} particleCount={35} speed={0.2} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Partner With Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the advantages that make us the ideal choice for your EV charging infrastructure needs
          </p>
        </div>

        {/* 3D Parallax Carousel */}
        <div className="relative max-w-6xl mx-auto perspective-1000">
          <div className="relative h-[400px] md:h-[500px]" style={{ perspective: '1000px' }}>
            {slides.map((slide, index) => {
              const offset = index - currentSlide;
              const absOffset = Math.abs(offset);
              
              // Calculate 3D transform values
              const isActive = offset === 0;
              const translateX = offset * 85; // Percentage
              const translateZ = isActive ? 0 : -absOffset * 100;
              const rotateY = offset * 15; // Degrees
              const scale = isActive ? 1 : Math.max(0.7, 1 - absOffset * 0.15);
              const opacity = absOffset > 2 ? 0 : Math.max(0.3, 1 - absOffset * 0.3);
              const zIndex = 10 - absOffset;

              return (
                <div
                  key={index}
                  className="absolute inset-0 transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transformStyle: 'preserve-3d',
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <div className="w-full h-full max-w-2xl mx-auto">
                    <div 
                      className={`group relative rounded-2xl overflow-hidden shadow-2xl h-full transition-all duration-500 ${
                        isActive ? 'shadow-[0_25px_60px_rgba(0,0,0,0.4)]' : ''
                      }`}
                    >
                      {/* Image Background */}
                      <div className="relative h-full">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/20" />
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300 drop-shadow-lg">
                          {slide.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed drop-shadow-md">
                          {slide.description}
                        </p>
                      </div>

                      {/* Hover Accent */}
                      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-2xl transition-all duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 backdrop-blur-md border-2 border-primary-glow hover:bg-primary hover:scale-110 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 backdrop-blur-md border-2 border-primary-glow hover:bg-primary hover:scale-110 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default USPCarousel;
