import { useState, useEffect } from "react";
import { 
  Rocket, 
  Layers, 
  CircleDollarSign, 
  Mountain, 
  Languages, 
  MapPinned, 
  Users, 
  Grid3X3, 
  Handshake,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { 
    icon: Rocket,
    title: "First-Mover Advantage", 
    description: "Leading EV charging in Northeast India with proven market presence",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Layers,
    title: "Asset-Light Model", 
    description: "Efficient scalable deployment strategy that maximizes ROI",
    color: "from-violet-500 to-purple-500"
  },
  { 
    icon: CircleDollarSign,
    title: "Hybrid Investment", 
    description: "Flexible CAPEX/OPEX partnership models tailored to your needs",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    icon: Mountain,
    title: "Challenging Terrain", 
    description: "Proven deployment in difficult locations across Northeast",
    color: "from-orange-500 to-amber-500"
  },
  { 
    icon: Languages,
    title: "Local Language Expertise", 
    description: "Regional expertise and deep understanding of local markets",
    color: "from-pink-500 to-rose-500"
  },
  { 
    icon: MapPinned,
    title: "Northeast Experience", 
    description: "Deep regional market knowledge and operational excellence",
    color: "from-primary to-cyan-500"
  },
  { 
    icon: Users,
    title: "Local Workforce", 
    description: "Community-driven approach with strong local partnerships",
    color: "from-indigo-500 to-blue-500"
  },
  { 
    icon: Grid3X3,
    title: "Multi-Segment", 
    description: "Residential, commercial, and highway charging solutions",
    color: "from-cyan-500 to-teal-500"
  },
  { 
    icon: Handshake,
    title: "Strong Partnerships", 
    description: "Collaborations with Ather, MG, Tata, and GMDA",
    color: "from-blue-600 to-primary"
  },
];

const USPCarousel = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedIndex, setAnimatedIndex] = useState(0);

  // Subtle animation cycling through cards
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-cyan-500/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-blue-500/20 to-violet-500/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px"
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatParticle ${5 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(38, 116, 236, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 198, 255, 0.5); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-cyan-400 text-sm font-semibold mb-4 backdrop-blur-sm border border-white/10">
            ✨ Why Partner With Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            The A Plus{" "}
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Advantage
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Partner with Northeast India's leading EV charging infrastructure company
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;
            const isAnimated = animatedIndex === index && hoveredIndex === null;
            
            return (
              <div
                key={index}
                className={`group relative p-4 md:p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                  index === 0 || index === 5 ? 'md:col-span-1' : ''
                } ${
                  isHovered || isAnimated
                    ? 'bg-gradient-to-br from-white/15 to-white/5 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10'
                } backdrop-blur-sm border border-white/10 hover:border-white/30`}
                style={{
                  animation: isAnimated ? 'cardGlow 2s ease-in-out' : undefined
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon with gradient background */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-4 transition-transform duration-300 ${isHovered || isAnimated ? 'scale-110 rotate-3' : ''}`}>
                  <div className="w-full h-full bg-slate-900/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-base md:text-lg font-bold mb-2 transition-colors duration-300 ${
                  isHovered || isAnimated ? 'text-cyan-400' : 'text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect - glowing border */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                  isHovered || isAnimated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20 blur-xl`} />
                </div>

                {/* Corner accent */}
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${feature.color} transition-all duration-300 ${
                  isHovered || isAnimated ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
                }`} />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/partner"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(38,116,236,0.4)] hover:shadow-[0_0_50px_rgba(0,198,255,0.6)] transition-all duration-300 hover:scale-105"
          >
            <span>Start Your Partnership</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default USPCarousel;