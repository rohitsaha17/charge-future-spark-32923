import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

interface TimelineItem {
  year: string;
  month: string;
  event: string;
  description: string;
}

interface InteractiveTimelineProps {
  timeline: TimelineItem[];
}

const InteractiveTimeline = ({ timeline }: InteractiveTimelineProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const timelineTop = timelineRef.current.getBoundingClientRect().top;
      const timelineHeight = timelineRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollPosition = windowHeight / 2 - timelineTop;

      // Calculate overall progress (0 to 1)
      const totalProgress = Math.max(0, Math.min(1, scrollPosition / timelineHeight));
      setProgress(totalProgress);

      // Find active timeline item
      itemRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          
          if (itemCenter <= windowHeight / 2 && itemCenter >= 0) {
            setActiveIndex(index);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">A Plus Charge's Journey to EV Charging Leadership</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          From ideation to market leadership - witness our transformation into Northeast India's premier EV charging network
        </p>
      </div>
      
      <div ref={timelineRef} className="relative max-w-4xl mx-auto py-12">
        {/* Background line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-border/30"></div>
        
        {/* Animated progress line */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 top-0 w-1 bg-gradient-to-b from-primary via-primary-glow to-primary transition-all duration-300 ease-out"
          style={{ height: `${progress * 100}%` }}
        ></div>
        
        {/* Animated dot */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full z-20 transition-all duration-300 ease-out shadow-lg"
          style={{ 
            top: `${progress * 100}%`,
            boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)'
          }}
        >
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
        </div>

        {/* Timeline items */}
        <div className="space-y-16 relative">
          {timeline.map((item, index) => (
            <div 
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8 md:gap-12`}
            >
              {/* Content card */}
              <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'text-right md:pr-4' : 'text-left md:pl-4'}`}>
                <Card 
                  className={`p-6 transition-all duration-500 glass-card ${
                    activeIndex >= index 
                      ? 'opacity-100 scale-100 glow-effect' 
                      : 'opacity-40 scale-95'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-3xl font-bold text-primary">{item.year}</div>
                    {item.month && (
                      <div className="text-sm font-semibold text-primary/70">{item.month}</div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 leading-tight">{item.event}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </Card>
              </div>

              {/* Center dot */}
              <div className="flex-shrink-0 relative">
                <div 
                  className={`w-4 h-4 rounded-full border-4 border-background transition-all duration-500 ${
                    activeIndex >= index 
                      ? 'bg-primary scale-125' 
                      : 'bg-border scale-100'
                  }`}
                  style={{
                    boxShadow: activeIndex >= index ? '0 0 15px hsl(var(--primary) / 0.6)' : 'none'
                  }}
                ></div>
              </div>

              {/* Spacer */}
              <div className="w-full md:w-5/12"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm text-muted-foreground">
        Scroll to see our journey unfold
      </div>
    </div>
  );
};

export default InteractiveTimeline;
