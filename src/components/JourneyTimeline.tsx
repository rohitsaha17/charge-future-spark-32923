import { useEffect, useRef, useState } from "react";
import { Zap, Building2, FileCheck, Users, Battery, Handshake, ParkingCircle, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

const timelineEvents = [
  {
    year: "2021",
    title: "Ideation of A Plus Charge",
    description: "The vision to transform Northeast India's EV infrastructure was born",
    icon: Zap,
    color: "from-blue-500 to-cyan-500"
  },
  {
    year: "June 2022",
    title: "Company Legally Incorporated",
    description: "A Plus Charge was officially established to bring the vision to life",
    icon: Building2,
    color: "from-green-500 to-emerald-500"
  },
  {
    year: "Dec 2022",
    title: "Secured First PCC (Public Charging Compliance)",
    description: "Achieved regulatory approval to operate public charging infrastructure",
    icon: FileCheck,
    color: "from-yellow-500 to-amber-500"
  },
  {
    year: "2023",
    title: "Team Expansion and Operational Groundwork",
    description: "Built a talented team and laid the foundation for regional operations",
    icon: Users,
    color: "from-blue-600 to-indigo-600"
  },
  {
    year: "2024",
    title: "Launched First 30 kW DC Fast Charger",
    description: "Deployed our first high-speed charging station in Northeast India",
    icon: Battery,
    color: "from-purple-500 to-pink-500"
  },
  {
    year: "2025",
    title: "Partnered with Ather Energy",
    description: "Strategic partnership to expand EV charging accessibility",
    icon: Handshake,
    color: "from-orange-500 to-red-500"
  },
  {
    year: "2025",
    title: "Entered GMDA Multi-Level Parking, Guwahati",
    description: "Expanded infrastructure to major parking facilities in the region",
    icon: ParkingCircle,
    color: "from-rose-500 to-pink-600"
  },
  {
    year: "2025",
    title: "Emerged as Northeast India's Leading EV Charging Network",
    description: "Established market leadership with the region's most reliable charging network",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600"
  }
];

export const JourneyTimeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((item, index) => {
      if (!item) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        {
          threshold: 0.6,
          rootMargin: "-20% 0px -20% 0px"
        }
      );

      observer.observe(item);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div className="relative py-12 overflow-hidden">
      {/* Animated electrical circuit background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
          {/* Circuit paths */}
          <path 
            d="M 50 0 L 50 100 M 50 200 L 50 300 M 50 400 L 50 500 M 50 600 L 50 700 M 50 800 L 50 900" 
            stroke="url(#circuit-gradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
          />
          <path 
            d="M 150 50 L 150 150 M 150 250 L 150 350 M 150 450 L 150 550 M 150 650 L 150 750" 
            stroke="url(#circuit-gradient)" 
            strokeWidth="1" 
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Animated energy pulse along the timeline */}
      <div 
        className="absolute left-1/2 w-1 h-full -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(var(--primary) / 0.1) 0%, 
            hsl(var(--primary-glow) / 0.4) ${(activeIndex / (timelineEvents.length - 1)) * 100}%, 
            hsl(var(--primary) / 0.1) 100%)`
        }}
      />

      <div ref={timelineRef} className="relative max-w-5xl mx-auto px-4">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon;
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          
          return (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`relative flex items-center mb-24 transition-all duration-700 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Timeline connector */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full">
                <div 
                  className={`w-full transition-all duration-1000 ${
                    isPast || isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ 
                    height: isPast || isActive ? '100%' : '0%',
                    transition: 'height 0.8s ease-out'
                  }}
                />
              </div>

              {/* Content card - alternating sides */}
              <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                <Card 
                  className={`p-6 transition-all duration-700 ${
                    isActive 
                      ? 'shadow-xl border-primary/50 bg-primary/5' 
                      : isPast 
                        ? 'shadow-md border-primary/20' 
                        : 'shadow-sm border-muted'
                  }`}
                >
                  <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div 
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center transition-transform duration-500 ${
                        isActive ? 'scale-110 shadow-lg' : 'scale-100'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {event.year}
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {event.description}
                  </p>
                </Card>
              </div>

              {/* Center node with electrical effect */}
              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                <div 
                  className={`relative w-6 h-6 rounded-full transition-all duration-700 ${
                    isActive 
                      ? 'bg-primary shadow-lg shadow-primary/50 scale-150' 
                      : isPast
                        ? 'bg-primary/70 scale-110'
                        : 'bg-muted scale-100'
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                      <div className="absolute inset-0 rounded-full bg-primary-glow blur-md" />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
