import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { microFeedback } from "@/lib/microFeedback";
import { MapPin, Users, Zap, ChevronDown, ArrowRight, Settings, Wrench, Megaphone, DollarSign, Monitor, HeadphonesIcon } from "lucide-react";
import { useState } from "react";
import heroIllustration from "@/assets/hero-illustration.png";
import logomark from "@/assets/a-plus-logomark.png";
import heroEvCharging from "@/assets/hero-ev-charging-v2.png";
import trustBg from "@/assets/trust-bg.jpg";
import northeastHillsLandscape from "@/assets/northeast-hills-landscape.jpg";
import brahmaputraSunset from "@/assets/brahmaputra-sunset.jpg";
import NetworkVisualization from "@/components/NetworkVisualization";
import atherLogo from "@/assets/partners/ather-logo-new.png";
import mgLogo from "@/assets/partners/mg-logo-new.png";
import tataLogo from "@/assets/partners/tata-logo-new.png";
import gmdaLogo from "@/assets/partners/gmda-logo-new.png";
import aaiLogo from "@/assets/partners/aai-logo.png";
import imperiaVistaLogo from "@/assets/partners/imperia-vista-logo.png";
import osmLogo from "@/assets/partners/osm-logo.png";
import appSectionBg from "@/assets/app-section-bg.jpg";
import phoneMockup from "@/assets/phone-mockup-dual.png";
import googlePlayBadge from "@/assets/google-play-official.png";
import appStoreBadge from "@/assets/app-store-official.png";
import StorytellingSection from "@/components/StorytellingSection";
import chargingStationIllustration from "@/assets/charging-station-illustration.png";
import GoogleMapsCharging from "@/components/GoogleMapsCharging";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ChatBot from "@/components/ChatBot";
import FloatingFindCharger from "@/components/FloatingFindCharger";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedDownloadCounter from "@/components/AnimatedDownloadCounter";

const Home = () => {
  const [activeService, setActiveService] = useState<number | null>(null);
  const mapSection = useScrollReveal();
  const statsSection = useScrollReveal();
  const benefitsSection = useScrollReveal();
  const trustSection = useScrollReveal();
  const partnersSection = useScrollReveal();
  const appSection = useScrollReveal();
  const testimonialsSection = useScrollReveal();
  const faqSection = useScrollReveal();
  
  const servicePointers = [
    { icon: Settings, title: "Installation & Commissioning", description: "End-to-end setup of charging infrastructure with certified technicians" },
    { icon: Wrench, title: "Operations & Maintenance (O&M)", description: "24/7 monitoring, preventive maintenance, and rapid issue resolution" },
    { icon: Megaphone, title: "Location Promotion & Marketing", description: "Strategic visibility campaigns to maximize station footfall" },
    { icon: DollarSign, title: "Revenue Sharing & Monetization", description: "Transparent revenue models with attractive partner returns" },
    { icon: Monitor, title: "Charging Management Platform", description: "Real-time analytics, remote monitoring, and smart charging controls" },
    { icon: HeadphonesIcon, title: "Issue Resolution & Support", description: "Dedicated support team for swift problem resolution" },
  ];
  const faqs = [
    {
      question: "What types of EV chargers do you offer?",
      answer:
        "We offer Residential chargers, AC Public chargers, and DC Fast chargers (30kW and 60kW) to meet various charging needs.",
    },
    {
      question: "How can I become a charging station partner?",
      answer:
        "Visit our 'Become Our Partner' page to explore partnership opportunities. We offer both CAPEX and OPEX models with attractive ROI.",
    },
    {
      question: "Where are your charging stations located?",
      answer:
        "We have a strong presence in Northeast India, particularly in Guwahati, with expansion plans across major highways and urban centers.",
    },
    {
      question: "What is the typical ROI for charging station partners?",
      answer:
        "ROI varies based on location, charger type, and utilization. Use our ROI Calculator on the partner page to get customized projections.",
    },
    {
      question: "Do you offer maintenance and support?",
      answer:
        "Yes, we provide comprehensive O&M services, 24/7 monitoring, and technical support to ensure maximum uptime.",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Energetic & Electric */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Dynamic Electric Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-cyan-50/40">
          {/* Animated Electric Energy Field */}
          <div className="absolute inset-0">
            {/* Primary Energy Orb */}
            <div
              className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(216, 83%, 56%, 0.15) 0%, hsl(191, 100%, 50%, 0.08) 40%, transparent 70%)',
                animation: "energyPulse 6s ease-in-out infinite",
              }}
            />
            {/* Secondary Energy Orb */}
            <div
              className="absolute bottom-[-25%] left-[-15%] w-[800px] h-[800px] rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(191, 100%, 50%, 0.12) 0%, hsl(160, 84%, 50%, 0.06) 50%, transparent 70%)',
                animation: "energyPulse 8s ease-in-out infinite reverse",
              }}
            />
            {/* Central Glow */}
            <div
              className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(216, 83%, 56%, 0.08) 0%, transparent 60%)',
                animation: "energyPulse 10s ease-in-out infinite",
                animationDelay: "2s"
              }}
            />
          </div>

          {/* Electric Lightning Network */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(216, 83%, 56%)" stopOpacity="0.9">
                  <animate attributeName="stop-opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
                </stop>
                <stop offset="50%" stopColor="hsl(191, 100%, 50%)" stopOpacity="0.7">
                  <animate attributeName="stop-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="hsl(160, 84%, 50%)" stopOpacity="0.5">
                  <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite"/>
                </stop>
              </linearGradient>
              <filter id="electricGlow2">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Dynamic Connection Lines */}
            <g filter="url(#electricGlow2)" opacity="0.6">
              <path d="M 0,200 Q 150,180 300,220 T 600,200" stroke="url(#lightningGrad)" strokeWidth="2" fill="none" className="animate-pulse"/>
              <path d="M 100,400 Q 300,350 500,420 T 900,380" stroke="url(#lightningGrad)" strokeWidth="1.5" fill="none" style={{ animationDelay: '0.5s' }} className="animate-pulse"/>
              <path d="M 200,600 Q 400,550 600,620 T 1000,580" stroke="url(#lightningGrad)" strokeWidth="1" fill="none" style={{ animationDelay: '1s' }} className="animate-pulse"/>
            </g>
            
            {/* Energy Nodes */}
            <g>
              {[
                { cx: "8%", cy: "25%", r: 8, delay: 0 },
                { cx: "22%", cy: "35%", r: 10, delay: 0.3 },
                { cx: "42%", cy: "22%", r: 7, delay: 0.6 },
                { cx: "65%", cy: "40%", r: 12, delay: 0.9 },
                { cx: "18%", cy: "60%", r: 6, delay: 0.2 },
                { cx: "38%", cy: "52%", r: 9, delay: 0.5 },
                { cx: "58%", cy: "68%", r: 7, delay: 0.8 },
                { cx: "78%", cy: "55%", r: 11, delay: 1.1 },
                { cx: "12%", cy: "78%", r: 6, delay: 0.4 },
                { cx: "88%", cy: "32%", r: 8, delay: 0.7 },
              ].map((node, i) => (
                <g key={i}>
                  <circle 
                    cx={node.cx} 
                    cy={node.cy} 
                    r={node.r} 
                    fill="url(#lightningGrad)" 
                    opacity="0.6"
                    style={{ 
                      animation: `nodePulse 2.5s ease-in-out ${node.delay}s infinite`,
                    }}
                  />
                  <circle 
                    cx={node.cx} 
                    cy={node.cy} 
                    r={node.r * 2} 
                    fill="none"
                    stroke="url(#lightningGrad)" 
                    strokeWidth="1"
                    opacity="0.3"
                    style={{ 
                      animation: `nodeRipple 3s ease-out ${node.delay}s infinite`,
                    }}
                  />
                </g>
              ))}
            </g>
          </svg>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${3 + (i % 4)}px`,
                  height: `${3 + (i % 4)}px`,
                  left: `${3 + (i * 3.8)}%`,
                  top: `${10 + (i % 7) * 12}%`,
                  background: i % 4 === 0 
                    ? 'linear-gradient(135deg, hsl(216, 83%, 56%), hsl(191, 100%, 50%))'
                    : i % 4 === 1
                    ? 'linear-gradient(135deg, hsl(191, 100%, 50%), hsl(160, 84%, 50%))'
                    : i % 4 === 2
                    ? 'hsl(216, 83%, 56%)'
                    : 'hsl(160, 84%, 50%)',
                  boxShadow: `0 0 ${8 + (i % 4) * 4}px hsl(216, 83%, 56%, 0.6)`,
                  animation: `sparkFloat ${4 + (i % 5)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0.5 + (i % 3) * 0.15,
                }}
              />
            ))}
          </div>

          {/* Circuit Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40h20l5-5h10l5 5h20l5-5h15' stroke='%232674EC' stroke-width='0.8' fill='none'/%3E%3Cpath d='M40 0v20l-5 5v10l5 5v20l-5 5v15' stroke='%232674EC' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='40' cy='40' r='3' fill='%232674EC'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />
          
          {/* Readability Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/30"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-[18%] left-[8%] text-primary/20"
            style={{ animation: "iconFloat 6s ease-in-out infinite" }}
          >
            <Zap className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <div 
            className="absolute top-[55%] left-[4%] text-cyan-500/20"
            style={{ animation: "iconFloat 8s ease-in-out infinite", animationDelay: "1.5s" }}
          >
            <MapPin className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div 
            className="absolute top-[12%] right-[20%] text-primary/15 hidden md:block"
            style={{ animation: "iconFloat 7s ease-in-out infinite", animationDelay: "2.5s" }}
          >
            <Zap className="w-20 h-20" />
          </div>
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes energyPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes nodePulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 1; }
          }
          @keyframes nodeRipple {
            0% { transform: scale(1); opacity: 0.4; }
            100% { transform: scale(3); opacity: 0; }
          }
          @keyframes sparkFloat {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
            25% { transform: translateY(-25px) translateX(12px) scale(1.2); opacity: 0.8; }
            50% { transform: translateY(-12px) translateX(-8px) scale(0.9); opacity: 0.5; }
            75% { transform: translateY(-35px) translateX(5px) scale(1.1); opacity: 0.7; }
          }
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
            50% { transform: translateY(-20px) rotate(8deg); opacity: 0.4; }
          }
          @keyframes textGlow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(38, 116, 236, 0.25)); }
            50% { filter: drop-shadow(0 0 20px rgba(38, 116, 236, 0.5)); }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        <div className="relative z-10 w-full py-12 md:py-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="relative flex flex-col md:flex-row items-center min-h-[85vh] md:min-h-[80vh]">
              {/* Left - Content */}
              <div className="relative z-20 w-full md:w-[48%] lg:w-[45%] md:ml-6 lg:ml-10 space-y-5 md:space-y-7 text-center md:text-left">
                {/* Badge with shimmer */}
                <div 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-cyan-500/15 border border-primary/40 backdrop-blur-sm shadow-lg mt-16 md:mt-0"
                  style={{ 
                    animation: "slideUp 0.6s ease-out both"
                  }}
                >
                  <img src={logomark} alt="A+ Charge" className="w-5 h-5" />
                  <span className="text-xs font-bold text-primary tracking-wide uppercase">Northeast India's Leading EV Network</span>
                </div>

                {/* Main Heading - Bold Two Lines */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.15] tracking-tight">
                  <span 
                    className="block bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent pb-1"
                    style={{ 
                      animation: "slideUp 0.6s ease-out 0.1s both, textGlow 3s ease-in-out infinite",
                      backgroundSize: "200% auto"
                    }}
                  >
                    Northeast India's Largest &
                  </span>
                  <span 
                    className="block bg-gradient-to-r from-cyan-500 via-primary to-blue-700 bg-clip-text text-transparent"
                    style={{ 
                      animation: "slideUp 0.6s ease-out 0.2s both, textGlow 3s ease-in-out 0.5s infinite",
                      backgroundSize: "200% auto"
                    }}
                  >
                    Most Trusted EV Network
                  </span>
                </h1>

                {/* Description */}
                <p 
                  className="text-base md:text-lg lg:text-xl text-foreground/75 leading-relaxed max-w-xl mx-auto md:mx-0"
                  style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
                >
                  Powering your journey across the hills and plains with smart, high-speed charging solutions. From daily commutes to highway adventures.
                </p>


                {/* CTAs */}
                <div 
                  className="flex flex-col sm:flex-row gap-3 pt-2 items-center md:items-start"
                  style={{ animation: "slideUp 0.6s ease-out 0.4s both" }}
                >
                  <Link
                    to="/find-charger"
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                      text-white bg-gradient-to-r from-[#2674EC] to-[#00C6FF]
                      shadow-[0_6px_24px_rgba(38,116,236,0.35)] 
                      transition-all duration-300 ease-out
                      hover:shadow-[0_10px_40px_rgba(0,198,255,0.6)] hover:scale-[1.05] hover:-translate-y-1
                      active:scale-95 w-full sm:w-auto whitespace-nowrap overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Zap className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative">Find a Charger</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>

                  <Link
                    to="/partner"
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                      text-primary border-2 border-primary/30 bg-white/80 backdrop-blur-sm
                      shadow-[0_4px_16px_rgba(38,116,236,0.1)]
                      transition-all duration-300 ease-out
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50
                      hover:border-primary/50 hover:shadow-[0_6px_24px_rgba(38,116,236,0.25)] 
                      hover:scale-[1.05] hover:-translate-y-1
                      active:scale-95 w-full sm:w-auto whitespace-nowrap"
                  >
                    <span>Become a Partner</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Right - Illustration - Much Larger, aligned with hero text */}
              <div
                className="absolute right-[-8%] lg:right-[-5%] top-[15%] md:top-[20%] w-[75%] md:w-[70%] lg:w-[72%] xl:w-[78%] hidden md:block"
                style={{ animation: "scaleIn 0.8s ease-out 0.3s both" }}
              >
                <img
                  src={heroEvCharging}
                  alt="A Plus Charge EV charging station - white electric car charging at branded A Plus charger"
                  className="relative w-full h-auto object-contain object-right drop-shadow-[0_25px_80px_rgba(38,116,236,0.3)]"
                  style={{ transform: 'scale(1.35)' }}
                  loading="eager"
                />
              </div>

              {/* Mobile Illustration */}
              <div
                className="relative w-full flex items-center justify-center md:hidden mt-8"
                style={{ animation: "scaleIn 0.6s ease-out 0.2s both" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent blur-2xl" />
                <img
                  src={heroEvCharging}
                  alt="A Plus Charge EV charging station - white electric car charging at branded A Plus charger"
                  className="relative w-full max-w-lg h-auto object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
          style={{ animation: "slideUp 0.6s ease-out 0.8s both" }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* Charging Stations Map with Sidebar */}
      <section
        ref={mapSection.ref}
        className={`py-20 relative overflow-visible transition-all duration-1000 ${mapSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Enhanced Radial Gradient Depth Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,_hsl(216_83%_56%_/_0.15),_transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(220_15%_97%)] to-background pointer-events-none"></div>
        
        {/* Animated floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-full blur-2xl animate-subtle-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-tl from-blue-500/10 to-primary/10 rounded-full blur-2xl animate-subtle-float" style={{ animationDelay: "2s" }}></div>
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, hsl(216 83% 56%) 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-2">
              <span className="text-primary font-semibold">Our Network at a Glance</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Live Network Pulse</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              45+ Live Public Stations • 100+ Locations by March 2026 • 97% Average Uptime for worry-free travel
            </p>
          </div>
          
          {/* Map with Sidebar Layout */}
          <div className="animate-fade-in max-w-7xl mx-auto grid md:grid-cols-4 gap-6" style={{ animationDelay: "0.2s" }}>
            {/* Sidebar - Quick Stats & Navigation Help */}
            <div className="md:col-span-1 order-2 md:order-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">Live Stations</span>
                    <span className="font-bold text-primary">45+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">By March 2026</span>
                    <span className="font-bold text-cyan-600">100+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">States Covered</span>
                    <span className="font-bold text-green-600">9</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground text-sm">Avg. Uptime</span>
                    <span className="font-bold text-emerald-600">97%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-3">📍 Map Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Click markers for station details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Hover for quick preview
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Get directions to any station
                  </li>
                </ul>
              </div>
              
              <Link
                to="/find-charger"
                className="block w-full text-center py-3 px-4 bg-gradient-to-r from-primary to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                View Full Map →
              </Link>
            </div>
            
            {/* Map Container */}
            <div className="md:col-span-3 order-1 md:order-2">
              <GoogleMapsCharging />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section - Redesigned with Full-Width Illustration and Service Pointers */}
      <section
        ref={statsSection.ref}
        className={`py-10 sm:py-12 md:py-16 lg:py-20 mb-0 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/20 transition-all duration-1000 ${statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Full-Width Illustration - Pinned to Right for desktop/tablet - FIXED CROPPING */}
        <div className="absolute inset-0 hidden md:flex items-center justify-end overflow-hidden pointer-events-none">
          <img
            src={chargingStationIllustration}
            alt="Modern A Plus Charge EV charging station with solar panels and white electric vehicle"
            className="relative h-[120%] w-auto max-w-none object-contain"
            style={{ 
              objectPosition: 'center right',
              marginRight: '-5%',
              transform: 'translateY(-5%)'
            }}
          />
          {/* Fade on left only, keep right and bottom fully visible */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(to right, white 0%, white 20%, rgba(255,255,255,0.8) 35%, rgba(255,255,255,0.4) 50%, transparent 65%)'
          }}></div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-cyan-500/5 rounded-full blur-3xl z-0"></div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 max-w-full md:max-w-[65%] lg:max-w-[60%] xl:max-w-[55%] md:ml-0">
            {/* Left Side - Heading and Service Pointers */}
            <div className="w-full space-y-6">
              {/* Heading */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    FAST & RELIABLE
                  </span>
                  <br />
                  <span className="text-foreground">EV CHARGING SOLUTION!</span>
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-cyan-500 rounded-full"></div>
              </div>

              {/* Interactive Service Pointers - Responsive Grid: 2x3 mobile, 2x3 tablet, 3x2 desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:max-w-2xl">
                {servicePointers.map((service, index) => {
                  const Icon = service.icon;
                  const isActive = activeService === index;
                  return (
                    <div
                      key={index}
                      className={`group relative p-3 md:p-4 rounded-xl cursor-pointer transition-colors duration-300 overflow-hidden h-[70px] sm:h-[80px] md:h-[90px] ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/30' 
                          : 'bg-white/90 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:shadow-md'
                      }`}
                      style={{
                        animation: statsSection.isVisible ? `slideUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                      }}
                      onMouseEnter={() => setActiveService(index)}
                      onMouseLeave={() => setActiveService(null)}
                      onClick={() => microFeedback({ vibratePattern: [12, 40, 12], frequencyHz: 720 })}
                      onTouchStart={() => microFeedback({ vibratePattern: 16, frequencyHz: 720 })}
                    >
                      <div className="flex items-start gap-2 md:gap-3 h-full">
                        <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-white/20 scale-90' : 'bg-primary/10'}`}>
                          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative h-full">
                          <h3 className={`font-semibold leading-snug transition-all duration-300 origin-top-left ${
                            isActive 
                              ? 'text-white text-[8px] sm:text-[9px] md:text-[10px] translate-y-0' 
                              : 'text-foreground text-[10px] sm:text-xs md:text-sm translate-y-2'
                          }`}>
                            {service.title}
                          </h3>
                          <p className={`text-[8px] sm:text-[9px] md:text-xs leading-tight transition-all duration-300 ${
                            isActive 
                              ? 'text-white/90 opacity-100 translate-y-0 mt-1' 
                              : 'text-muted-foreground opacity-0 translate-y-2 mt-0'
                          }`}>
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Mobile Image - Full width, edge to edge */}
          <div className="w-full md:hidden relative mt-6 sm:mt-8 overflow-hidden">
            <div className="relative w-full">
              <img
                src={chargingStationIllustration}
                alt="Modern A Plus Charge EV charging station with solar panels and white electric vehicle"
                className="w-full h-auto object-cover"
              />
              {/* Fade on top only */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 25%)'
              }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}

      {/* Benefits Section */}
      <div
        ref={benefitsSection.ref}
        className={`transition-all duration-1000 ${benefitsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <BenefitsSection />
      </div>

      {/* Trust Section - Northeast Hills */}
      <StorytellingSection
        title="Rooted in the Heart of Guwahati"
        description="Rooted in the heart of Guwahati and branching across the Seven Sisters with brother Sikkim and West Bengal. A Plus Charge was founded to solve a critical challenge: the EV infrastructure gap in East and North-East India. We are here to pioneer a lifestyle shift - replacing traditional fuel stops with smart, high-speed charging hubs."
        backgroundImage={northeastHillsLandscape}
      />

      {/* USP Section - Interactive Network */}
      <NetworkVisualization />


      {/* Storytelling Section - Our Edge */}
      <StorytellingSection
        title="Mastery of the Terrain"
        description="Local Expertise, Global Standards. While the geography of the Northeast can be a barrier for many, it is our home turf. From the high-altitude airstrips of Shillong to the remote roads of Upper Assam, we deploy technology that thrives in our unique landscape. Community-First Growth - powered by local talent."
        backgroundImage={brahmaputraSunset}
      />

      {/* Client Logos - Scrolling with Gradient Separator */}
      <section
        ref={partnersSection.ref}
        className={`py-8 pb-2 relative overflow-hidden transition-all duration-1000 ${partnersSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Gradient separator layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_15%_97%)] via-[hsl(216_83%_98%)] to-[hsl(220_15%_97%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-full blur-3xl animate-subtle-float opacity-50"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-l from-blue-500/10 to-primary/10 rounded-full blur-3xl animate-subtle-float opacity-50" style={{ animationDelay: "3s" }}></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-3">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
              Trusted Partners
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Collaborating with industry leaders to build India's most reliable EV charging network
            </p>
          </div>
          <div className="relative overflow-hidden mask-gradient py-8">
            <div className="flex gap-0 animate-scroll-left">
              {[
                {
                  src: atherLogo,
                  alt: "Ather Energy",
                },
                {
                  src: mgLogo,
                  alt: "MG Motors",
                },
                {
                  src: tataLogo,
                  alt: "Tata Motors",
                },
                {
                  src: gmdaLogo,
                  alt: "GMDA",
                },
                {
                  src: aaiLogo,
                  alt: "Airports Authority of India",
                },
                {
                  src: imperiaVistaLogo,
                  alt: "Imperia Vista",
                },
                {
                  src: osmLogo,
                  alt: "Omega Seiki Mobility",
                },
              ]
                .concat([
                  {
                    src: atherLogo,
                    alt: "Ather Energy",
                  },
                  {
                    src: mgLogo,
                    alt: "MG Motors",
                  },
                  {
                    src: tataLogo,
                    alt: "Tata Motors",
                  },
                  {
                    src: gmdaLogo,
                    alt: "GMDA",
                  },
                  {
                    src: aaiLogo,
                    alt: "Airports Authority of India",
                  },
                  {
                    src: imperiaVistaLogo,
                    alt: "Imperia Vista",
                  },
                  {
                    src: osmLogo,
                    alt: "Omega Seiki Mobility",
                  },
                ])
                .concat([
                  {
                    src: atherLogo,
                    alt: "Ather Energy",
                  },
                  {
                    src: mgLogo,
                    alt: "MG Motors",
                  },
                  {
                    src: tataLogo,
                    alt: "Tata Motors",
                  },
                  {
                    src: gmdaLogo,
                    alt: "GMDA",
                  },
                  {
                    src: aaiLogo,
                    alt: "Airports Authority of India",
                  },
                  {
                    src: imperiaVistaLogo,
                    alt: "Imperia Vista",
                  },
                  {
                    src: osmLogo,
                    alt: "Omega Seiki Mobility",
                  },
                ])
                .map((partner, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-12 transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-105 bg-transparent"
                  >
                    <img src={partner.src} alt={partner.alt} className="h-16 lg:h-20 w-auto object-contain mix-blend-multiply" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section - Creative Design */}
      <section
        ref={appSection.ref}
        className={`py-4 md:py-6 relative overflow-visible transition-all duration-1000 ${appSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Background Effects with Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>
        {/* Subtle Circuit Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232674EC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        {/* Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--primary)) 35px, hsl(var(--primary)) 36px)`,
        }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32 lg:pt-40">
          <div className="max-w-6xl mx-auto">
            {/* Blue Themed Box Container - Compact Height */}
            <div className="relative bg-gradient-to-br from-[#1a3a6e] via-[#2674EC] to-[#00C6FF] rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 lg:p-8 overflow-visible shadow-[0_20px_60px_-15px_rgba(38,116,236,0.4)]">
              {/* Decorative Elements Inside Box */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 rounded-3xl md:rounded-[2.5rem]"></div>
              {/* Hexagon Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 rounded-3xl md:rounded-[2.5rem] overflow-hidden" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>

              <div className="relative grid md:grid-cols-2 gap-4 md:gap-6 items-center min-h-[350px] md:min-h-[420px]">
                {/* Left side - Phone Mockup - Bigger size, 30% spilling from top */}
                <div className="flex justify-center md:justify-center order-1 md:order-1 relative h-full">
                  <div className="relative h-full flex items-end md:items-center animate-fade-in">
                    {/* Phone Image - Covers almost full box height, 30% spills out from top */}
                    <img
                      src={phoneMockup}
                      alt="A Plus Charge Mobile App Interface"
                      className="w-[400px] md:w-[500px] lg:w-[550px] h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500 md:-translate-y-[80px] lg:-translate-y-[90px]"
                    />
                    {/* Glow Effect Behind Phone */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent blur-3xl -z-10 scale-110"></div>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="text-center md:text-left space-y-4 order-2 md:order-2 py-4">
                  <div className="space-y-3">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                      📱 Available Now
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                      Download the <br className="hidden md:block" />
                      <span className="text-cyan-300">A Plus Charge</span> App
                    </h2>
                    <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-md">
                      Find chargers, start sessions, track usage, and pay - all from your pocket.
                    </p>
                  </div>

                  {/* Live Charging Indicator */}
                  <div className="flex items-center justify-center md:justify-start gap-3 py-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-sm text-white/90 font-medium">Live users charging now</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium border border-white/10">
                      ⚡ Real-time
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium border border-white/10">
                      📍 Navigation
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium border border-white/10">
                      💳 Payments
                    </span>
                  </div>

                  {/* Store Buttons - Aesthetic Design */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.bpm.aplus&hl=en_IN&pli=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#3DDC84]" fill="currentColor">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a2.5 2.5 0 0 1-.442-1.422V3.236a2.5 2.5 0 0 1 .441-1.422zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a2.5 2.5 0 0 1 0 4.33l-2.807 1.626L14.5 12l3.198-3.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Get it on</div>
                        <div className="text-sm font-bold text-gray-900 -mt-0.5">Google Play</div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3DDC84]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>

                    <a
                      href="https://apps.apple.com/us/app/a-plus-charge/id6502430979?l=es-MX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-900" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Download on the</div>
                        <div className="text-sm font-bold text-gray-900 -mt-0.5">App Store</div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Carousel */}
      <section
        ref={testimonialsSection.ref}
        className={`py-20 relative overflow-hidden transition-all duration-1000 ${testimonialsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Video background with parallax */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-5"
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <source src="/intro-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl animate-subtle-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-full blur-2xl animate-subtle-float" style={{ animationDelay: "1.5s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real experiences from EV owners and partners who trust A Plus Charge for their charging needs
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>


      <StorytellingSection
        title="The Roadmap: Scaling with Impact"
        description="Strategic Expansion: We are on a fast-track to activate 100+ marquee locations by 2026, turning the Northeast into one of India's most EV-friendly zones. Our eyes are set on 10,000+ EV stations by 2030, creating a seamless, sustainable corridor that connects every corner of our land."
        backgroundImage={trustBg}
      />

      

      {/* FAQ Section */}
      <section
        ref={faqSection.ref}
        className={`py-20 relative overflow-hidden transition-all duration-1000 ${faqSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background"></div>
        
        {/* Animated background orbs */}
        <div className="absolute top-1/4 right-10 w-40 h-40 bg-gradient-to-br from-primary/8 to-cyan-500/8 rounded-full blur-3xl animate-section-glow"></div>
        <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-gradient-to-tl from-blue-500/8 to-primary/8 rounded-full blur-3xl animate-section-glow" style={{ animationDelay: "2s" }}></div>
        
        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%232674EC' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom"
        }}></div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <h2 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-center text-muted-foreground mb-12">Everything you need to know about A Plus Charge</p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass-card rounded-lg px-6">
                <AccordionTrigger className="text-left hover:text-primary">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      {/* ChatBot */}
      <ChatBot />
      
      {/* Floating Find Charger Button - Mobile Only */}
      <FloatingFindCharger />
    </div>
  );
};
export default Home;
