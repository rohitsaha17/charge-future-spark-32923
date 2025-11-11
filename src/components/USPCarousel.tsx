import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Grid3x3, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  useEffect(() => {
    if (viewMode === "carousel") {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [viewMode]);

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
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Partner With Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover the advantages that make us the ideal choice for your EV charging infrastructure needs
          </p>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={viewMode === "carousel" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("carousel")}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Carousel View
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Grid View
            </Button>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {viewMode === "carousel" ? (
            <>
              {/* Carousel View - Responsive */}
              <div className="relative rounded-2xl overflow-visible">
                <div className="relative">
                  <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`
                    }}
                  >
                    {slides.map((slide, index) => (
                      <div
                        key={index}
                        className="min-w-full"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2">
                          {/* Show 1 on mobile, 2 on tablet, 3 on desktop */}
                          {[0, 1, 2].map((offset) => {
                            const slideIndex = (index + offset) % slides.length;
                            const slideData = slides[slideIndex];
                            return (
                              <div
                                key={slideIndex}
                                className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-out ${
                                  offset === 2 ? 'hidden lg:block' : offset === 1 ? 'hidden md:block' : ''
                                }`}
                                style={{
                                  transform: 'scale(1)',
                                  transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                }}
                              >
                                {/* Image Background */}
                                <div className="relative h-64 md:h-80">
                                  <img
                                    src={slideData.image}
                                    alt={slideData.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
                                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 text-foreground group-hover:text-primary transition-colors duration-300 drop-shadow-lg">
                                    {slideData.title}
                                  </h3>
                                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed drop-shadow-md">
                                    {slideData.description}
                                  </p>
                                </div>

                                {/* Hover Accent */}
                                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/40 rounded-xl transition-all duration-300 pointer-events-none" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                </button>
              </div>
            </>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Background */}
                  <div className="relative h-64">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors drop-shadow-lg">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed drop-shadow-md">
                      {slide.description}
                    </p>
                  </div>

                  {/* Hover Accent */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-colors duration-500 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default USPCarousel;
