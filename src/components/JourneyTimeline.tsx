import { useEffect, useRef, useState } from "react";
import { Zap, Building2, FileCheck, Users, Battery, Handshake, ParkingCircle, Trophy, Plane, MapPin, Car, Rocket, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const timelineEvents = [
  {
    year: "2023",
    title: "Installed the First Charger",
    description: "The journey began with our very first EV charging station deployment",
    icon: Zap,
    color: "from-blue-500 to-cyan-500"
  },
  {
    year: "2024",
    title: "1st 30 kW DC Fast Charger on Guwahati–Kaziranga Route",
    description: "Unlocking long-distance EV travel across Northeast India with high-speed charging",
    icon: Battery,
    color: "from-green-500 to-emerald-500"
  },
  {
    year: "2024",
    title: "Partnership with ChargeMOD",
    description: "Strategic collaboration to enhance charging network capabilities",
    icon: Handshake,
    color: "from-purple-500 to-pink-500"
  },
  {
    year: "2024",
    title: "Onboarded Lubi EV as Hardware Partner",
    description: "Strengthened hardware supply chain with quality equipment partnership",
    icon: Building2,
    color: "from-yellow-500 to-amber-500"
  },
  {
    year: "2024",
    title: "Crossed 20 Live EV Charging Stations",
    description: "Milestone achievement across Northeast India's charging infrastructure",
    icon: Trophy,
    color: "from-orange-500 to-red-500"
  },
  {
    year: "2025",
    title: "Strategic Collaboration with AAI",
    description: "Exclusive partnership with Airport Authority of India for airport charging infrastructure",
    icon: Plane,
    color: "from-blue-600 to-indigo-600"
  },
  {
    year: "2025",
    title: "2nd DC Fast Charger at GMDA Multi-Level Parking",
    description: "Premium public site secured in Guwahati's high-traffic parking facility",
    icon: ParkingCircle,
    color: "from-rose-500 to-pink-600"
  },
  {
    year: "2025",
    title: "Expanded to West Bengal & Tripura",
    description: "Geographic expansion into new Eastern India markets",
    icon: MapPin,
    color: "from-teal-500 to-cyan-500"
  },
  {
    year: "2025",
    title: "Partnerships with Tata SCV & MG India",
    description: "OEM partnerships for charger visibility on vehicle dashboards",
    icon: Car,
    color: "from-indigo-500 to-purple-500"
  },
  {
    year: "2025",
    title: "Strategic Partnership with Ather Energy",
    description: "Formalized alliance with leading EV manufacturer",
    icon: Handshake,
    color: "from-emerald-500 to-green-600"
  },
  {
    year: "2025",
    title: "Launched NE.EV Initiative",
    description: "Dedicated program for DC Charger deployment across Northeast",
    icon: Rocket,
    color: "from-amber-500 to-yellow-600"
  },
  {
    year: "2025",
    title: "Crossed 40 Chargers Milestone",
    description: "Doubled our network with 40+ live charging stations",
    icon: Trophy,
    color: "from-cyan-500 to-blue-600"
  },
  {
    year: "2025",
    title: "40 Additional DC Sites Identified",
    description: "Strategic expansion pipeline for next phase of growth",
    icon: Target,
    color: "from-violet-500 to-purple-600"
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
          threshold: 0.5,
          rootMargin: "-15% 0px -15% 0px"
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
    <div className="relative py-16 overflow-hidden">
      {/* Enhanced animated electrical circuit background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(191, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
            <filter id="glow-effect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Animated circuit paths */}
          <path 
            d="M 50 0 L 50 100 M 50 200 L 50 300 M 50 400 L 50 500 M 50 600 L 50 700 M 50 800 L 50 900 M 50 1000 L 50 1200 M 50 1300 L 50 1500" 
            stroke="url(#circuit-gradient)" 
            strokeWidth="2" 
            fill="none"
            filter="url(#glow-effect)"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <path 
            d="M 150 50 L 150 150 M 150 250 L 150 350 M 150 450 L 150 550 M 150 650 L 150 750 M 150 850 L 150 950 M 150 1050 L 150 1150" 
            stroke="url(#circuit-gradient)" 
            strokeWidth="1" 
            fill="none"
            opacity="0.5"
          />
          {/* Horizontal connectors */}
          <path 
            d="M 50 100 L 150 150 M 50 300 L 150 350 M 50 500 L 150 550 M 50 700 L 150 750" 
            stroke="url(#circuit-gradient)" 
            strokeWidth="1" 
            fill="none"
            opacity="0.3"
            strokeDasharray="5,10"
            style={{ animation: "dashMove 3s linear infinite" }}
          />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `floatParticle ${4 + i % 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dashMove {
          to { stroke-dashoffset: -30; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
      `}</style>

      {/* Animated progress line along the timeline */}
      <div className="hidden md:block absolute left-1/2 w-1 h-full -translate-x-1/2">
        {/* Background line with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-border via-border to-border/50 rounded-full" />
        {/* Animated progress with glow */}
        <div 
          className="absolute top-0 left-0 w-full rounded-full transition-all duration-700 ease-out"
          style={{
            height: `${(activeIndex / (timelineEvents.length - 1)) * 100}%`,
            background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(191, 100%, 50%) 50%, hsl(var(--primary-glow)) 100%)',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)'
          }}
        />
      </div>

      <div ref={timelineRef} className="relative max-w-6xl mx-auto px-4">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon;
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          
          return (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`relative flex items-center mb-12 md:mb-20 transition-all duration-500 ease-out ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
              }`}
              style={{
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Timeline connector */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full hidden md:block">
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

              {/* Content card - stacked on mobile, alternating sides on desktop */}
              <div className={`w-full ${index % 2 === 0 ? 'md:w-[45%] md:pr-12 md:text-right' : 'md:w-[45%] md:ml-auto md:pl-12'}`}>
                <Card 
                  className={`p-5 md:p-6 transition-all duration-500 ease-out backdrop-blur-sm ${
                    isActive 
                      ? 'shadow-2xl border-primary/60 bg-gradient-to-br from-primary/10 to-cyan-500/5 scale-100' 
                      : isPast 
                        ? 'shadow-lg border-primary/30 bg-primary/5' 
                        : 'shadow-md border-border bg-card/80'
                  }`}
                  style={{
                    transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : 'flex-row'}`}>
                    <div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center transition-all duration-500 ${
                        isActive ? 'scale-110 shadow-lg rotate-3' : 'scale-100 rotate-0'
                      }`}
                      style={{
                        boxShadow: isActive ? `0 10px 30px -5px rgba(0,0,0,0.3)` : 'none'
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {event.year}
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {event.description}
                  </p>
                </Card>
              </div>

              {/* Center node with enhanced electrical effect - hidden on mobile, shown on md+ */}
              <div className="hidden md:block absolute left-1/2 top-6 -translate-x-1/2 z-10">
                <div 
                  className={`relative w-6 h-6 rounded-full transition-all duration-500 ease-out ${
                    isActive 
                      ? 'bg-primary scale-150' 
                      : isPast
                        ? 'bg-primary/70 scale-125'
                        : 'bg-border scale-100'
                  }`}
                  style={{
                    boxShadow: isActive 
                      ? '0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary) / 0.5)' 
                      : isPast 
                        ? '0 0 15px hsl(var(--primary) / 0.5)' 
                        : 'none',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                      <div className="absolute inset-[-4px] rounded-full border-2 border-primary/50 animate-pulse" />
                      <div className="absolute inset-[-8px] rounded-full border border-primary/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
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
