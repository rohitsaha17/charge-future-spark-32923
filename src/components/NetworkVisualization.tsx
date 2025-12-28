import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  Rocket, 
  Layers, 
  CircleDollarSign, 
  Mountain, 
  Languages, 
  Users, 
  Grid3X3, 
  Handshake,
  ArrowRight
} from 'lucide-react';
import logomark from '@/assets/a-plus-logomark.png';
const features = [
  { 
    icon: Rocket,
    title: "First-Mover", 
    description: "Leading EV charging in Northeast India with proven market presence",
    color: "#2674EC"
  },
  { 
    icon: Layers,
    title: "Asset-Light", 
    description: "Efficient scalable deployment strategy that maximizes ROI",
    color: "#9333EA"
  },
  { 
    icon: CircleDollarSign,
    title: "Hybrid Model", 
    description: "Flexible CAPEX/OPEX partnership models tailored to your needs",
    color: "#10B981"
  },
  { 
    icon: Mountain,
    title: "Terrain Expert", 
    description: "Proven deployment in difficult locations across Northeast",
    color: "#F59E0B"
  },
  { 
    icon: Languages,
    title: "Local Expertise", 
    description: "Regional expertise and deep understanding of local markets",
    color: "#EC4899"
  },
  { 
    icon: Users,
    title: "Local Workforce", 
    description: "Community-driven approach with strong local partnerships",
    color: "#6366F1"
  },
  { 
    icon: Grid3X3,
    title: "Multi-Segment", 
    description: "Residential, commercial, and highway charging solutions",
    color: "#14B8A6"
  },
  { 
    icon: Handshake,
    title: "Strong Partners", 
    description: "Collaborations with Ather, MG, Tata, and GMDA",
    color: "#2674EC"
  },
];

const NetworkVisualization = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.min(rect.width * 0.75, 600) });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Calculate node positions in a circular layout around center
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(dimensions.width, dimensions.height) * 0.35;

  const nodePositions = features.map((_, index) => {
    const angle = (index / features.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef.ref} className={`relative w-full py-16 md:py-24 overflow-hidden transition-all duration-1000 ${sectionRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(38, 116, 236, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(0, 198, 255, 0.2) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
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
            A connected ecosystem of excellence powering Northeast India's EV revolution
          </p>
        </div>

        {/* Network Visualization */}
        <div 
          ref={containerRef}
          className="relative mx-auto max-w-4xl"
          style={{ height: dimensions.height }}
          onMouseMove={handleMouseMove}
        >
          <svg 
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(38, 116, 236, 0.3)" />
                <stop offset="50%" stopColor="rgba(0, 198, 255, 0.5)" />
                <stop offset="100%" stopColor="rgba(38, 116, 236, 0.3)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Connection lines from each node to center */}
            {nodePositions.map((pos, index) => (
              <g key={`line-${index}`}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#lineGradient)"
                  strokeWidth={activeNode === index ? "3" : "1.5"}
                  strokeDasharray={activeNode === index ? "0" : "5,5"}
                  className="transition-all duration-500"
                  style={{
                    animation: `dashMove 20s linear infinite`,
                    animationDelay: `${index * 0.5}s`
                  }}
                />
                {/* Animated dot on line */}
                <circle
                  r="3"
                  fill={features[index].color}
                  filter="url(#glow)"
                  className="transition-opacity duration-300"
                  style={{
                    opacity: activeNode === index ? 1 : 0.5,
                    animation: `moveDot 3s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M${centerX},${centerY} L${pos.x},${pos.y}`}
                  />
                </circle>
              </g>
            ))}

            {/* Connecting lines between adjacent nodes */}
            {nodePositions.map((pos, index) => {
              const nextIndex = (index + 1) % nodePositions.length;
              const nextPos = nodePositions[nextIndex];
              return (
                <line
                  key={`connect-${index}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={nextPos.x}
                  y2={nextPos.y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>

          {/* Center Node - A Plus Logo with Pulse */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: centerX, top: centerY }}
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-2xl group cursor-pointer"
              style={{
                boxShadow: '0 0 60px rgba(38, 116, 236, 0.5), 0 0 100px rgba(0, 198, 255, 0.3)',
                animation: 'centerPulse 3s ease-in-out infinite'
              }}
            >
              {/* Outer ring pulse */}
              <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
              <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-ping opacity-20" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              
              {/* Inner glow pulse */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-500 opacity-40" 
                style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
              
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden p-3 relative z-10">
                <img src={logomark} alt="A Plus Charge" className="w-14 h-14 md:w-20 md:h-20 object-contain" 
                  style={{ animation: 'logoPulse 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>

          {/* Feature Nodes */}
          {features.map((feature, index) => {
            const pos = nodePositions[index];
            const Icon = feature.icon;
            const isActive = activeNode === index;
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                style={{ 
                  left: pos.x, 
                  top: pos.y,
                  transition: 'all 0.3s ease-out'
                }}
                onMouseEnter={() => setActiveNode(index)}
                onMouseLeave={() => setActiveNode(null)}
              >
                {/* Node */}
                <div 
                  className={`relative transition-all duration-500 ${isActive ? 'scale-125' : 'scale-100'}`}
                  style={{
                    transform: isActive ? 'scale(1.25) rotate(5deg)' : 'scale(1) rotate(0deg)'
                  }}
                >
                  {/* Orbiting particles on hover */}
                  {isActive && (
                    <>
                      <div className="absolute w-2 h-2 rounded-full bg-white animate-spin" 
                        style={{ 
                          animation: 'orbit 1.5s linear infinite',
                          transformOrigin: '32px 32px',
                          left: '-4px',
                          top: '50%'
                        }} />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400" 
                        style={{ 
                          animation: 'orbit 2s linear infinite reverse',
                          transformOrigin: '36px 36px',
                          right: '-4px',
                          top: '50%'
                        }} />
                    </>
                  )}
                  
                  {/* Ripple effect on hover */}
                  <div 
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${isActive ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`}
                    style={{ 
                      backgroundColor: feature.color,
                      filter: 'blur(20px)'
                    }}
                  />
                  
                  {/* Secondary ripple */}
                  <div 
                    className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${isActive ? 'opacity-60 scale-[2]' : 'opacity-0 scale-100'}`}
                    style={{ borderColor: feature.color }}
                  />
                  
                  {/* Node circle with gradient fill on hover */}
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative overflow-hidden"
                    style={{ 
                      backgroundColor: isActive ? feature.color : 'rgba(30, 41, 59, 0.9)',
                      borderColor: feature.color,
                      boxShadow: isActive ? `0 0 40px ${feature.color}80, inset 0 0 20px rgba(255,255,255,0.2)` : 'none'
                    }}
                  >
                    {/* Shine effect */}
                    <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} 
                      style={{ transform: 'translateX(-100%)', animation: isActive ? 'shine 1s ease-out forwards' : 'none' }} />
                    
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 text-white transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                  </div>
                </div>

                {/* Label */}
                <div className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300 ${
                  pos.y > centerY ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}>
                  <span className={`text-xs md:text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-cyan-400' : 'text-white/70'
                  }`}>
                    {feature.title}
                  </span>
                </div>

                {/* Tooltip */}
                {isActive && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-48 p-3 bg-white rounded-xl shadow-2xl text-center z-30 animate-fade-in"
                    style={{
                      top: pos.y > centerY ? 'calc(100% + 24px)' : 'auto',
                      bottom: pos.y <= centerY ? 'calc(100% + 24px)' : 'auto'
                    }}
                  >
                    <h4 className="font-bold text-sm text-foreground mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Mouse follow effect */}
          <div 
            className="absolute w-64 h-64 rounded-full pointer-events-none transition-transform duration-100 ease-out"
            style={{
              left: mousePos.x - 128,
              top: mousePos.y - 128,
              background: 'radial-gradient(circle, rgba(0, 198, 255, 0.1) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to="/partner"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(38,116,236,0.4)] hover:shadow-[0_0_50px_rgba(0,198,255,0.6)] transition-all duration-300 hover:scale-105"
          >
            <span>Start Your Partnership</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes dashMove {
          to {
            stroke-dashoffset: -100;
          }
        }
        @keyframes moveDot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes centerPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(32px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(32px) rotate(-360deg); }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default NetworkVisualization;
