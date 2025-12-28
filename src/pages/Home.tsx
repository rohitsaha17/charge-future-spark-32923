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
      {/* Hero Section - Interactive & Creative */}
      <section id="hero" className="relative min-h-[85vh] flex items-center overflow-hidden pt-20">
        {/* Multi-layered Background with Network Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          {/* Animated Gradient Orbs */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
            style={{
              animation: "orbFloat 8s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary/10 to-blue-300/10 rounded-full blur-3xl"
            style={{
              animation: "orbFloat 10s ease-in-out infinite reverse",
            }}
          ></div>

          {/* Network Web Effect */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="networkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(216, 83%, 56%)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(186, 100%, 50%)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Network lines */}
            <line x1="10%" y1="20%" x2="30%" y2="35%" stroke="url(#networkGrad)" strokeWidth="1" className="animate-pulse" />
            <line x1="30%" y1="35%" x2="50%" y2="25%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "0.5s" }} className="animate-pulse" />
            <line x1="50%" y1="25%" x2="75%" y2="40%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "1s" }} className="animate-pulse" />
            <line x1="75%" y1="40%" x2="90%" y2="30%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "1.5s" }} className="animate-pulse" />
            <line x1="20%" y1="60%" x2="40%" y2="50%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "0.3s" }} className="animate-pulse" />
            <line x1="40%" y1="50%" x2="60%" y2="65%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "0.8s" }} className="animate-pulse" />
            <line x1="60%" y1="65%" x2="85%" y2="55%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "1.3s" }} className="animate-pulse" />
            <line x1="30%" y1="35%" x2="40%" y2="50%" stroke="url(#networkGrad)" strokeWidth="0.5" style={{ animationDelay: "0.2s" }} className="animate-pulse" />
            <line x1="50%" y1="25%" x2="60%" y2="65%" stroke="url(#networkGrad)" strokeWidth="0.5" style={{ animationDelay: "0.7s" }} className="animate-pulse" />
            <line x1="15%" y1="75%" x2="35%" y2="85%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "0.4s" }} className="animate-pulse" />
            <line x1="35%" y1="85%" x2="55%" y2="80%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "0.9s" }} className="animate-pulse" />
            <line x1="55%" y1="80%" x2="80%" y2="75%" stroke="url(#networkGrad)" strokeWidth="1" style={{ animationDelay: "1.4s" }} className="animate-pulse" />
            {/* Network nodes */}
            <circle cx="10%" cy="20%" r="4" fill="hsl(216, 83%, 56%)" opacity="0.5" className="animate-pulse" />
            <circle cx="30%" cy="35%" r="5" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "0.3s" }} className="animate-pulse" />
            <circle cx="50%" cy="25%" r="4" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "0.6s" }} className="animate-pulse" />
            <circle cx="75%" cy="40%" r="6" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "0.9s" }} className="animate-pulse" />
            <circle cx="90%" cy="30%" r="3" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "1.2s" }} className="animate-pulse" />
            <circle cx="20%" cy="60%" r="4" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "0.2s" }} className="animate-pulse" />
            <circle cx="40%" cy="50%" r="5" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "0.5s" }} className="animate-pulse" />
            <circle cx="60%" cy="65%" r="4" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "0.8s" }} className="animate-pulse" />
            <circle cx="85%" cy="55%" r="5" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "1.1s" }} className="animate-pulse" />
            <circle cx="15%" cy="75%" r="3" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "0.4s" }} className="animate-pulse" />
            <circle cx="35%" cy="85%" r="4" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "0.7s" }} className="animate-pulse" />
            <circle cx="55%" cy="80%" r="5" fill="hsl(186, 100%, 50%)" opacity="0.4" style={{ animationDelay: "1s" }} className="animate-pulse" />
            <circle cx="80%" cy="75%" r="4" fill="hsl(216, 83%, 56%)" opacity="0.5" style={{ animationDelay: "1.3s" }} className="animate-pulse" />
          </svg>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(216 83% 56%) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(216 83% 56%) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Floating animated icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-[20%] left-[10%] text-primary/20"
            style={{ animation: "floatIcon 5s ease-in-out infinite" }}
          >
            <Zap className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div 
            className="absolute top-[60%] left-[5%] text-cyan-500/20"
            style={{ animation: "floatIcon 7s ease-in-out infinite", animationDelay: "1s" }}
          >
            <MapPin className="w-6 h-6 md:w-10 md:h-10" />
          </div>
          <div 
            className="absolute top-[15%] right-[25%] text-blue-400/15 hidden md:block"
            style={{ animation: "floatIcon 6s ease-in-out infinite", animationDelay: "2s" }}
          >
            <Zap className="w-16 h-16" />
          </div>
          <div 
            className="absolute bottom-[25%] left-[15%] w-4 h-4 bg-gradient-to-r from-primary to-cyan-500 rounded-full opacity-30"
            style={{ animation: "floatIcon 4s ease-in-out infinite" }}
          />
          <div 
            className="absolute top-[40%] left-[8%] w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-25"
            style={{ animation: "floatIcon 5s ease-in-out infinite", animationDelay: "0.5s" }}
          />
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes orbFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-5px); }
            75% { transform: translateY(-25px) translateX(5px); }
          }
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
            50% { transform: translateY(-15px) rotate(5deg); opacity: 0.35; }
          }
          @keyframes dashMove {
            to { stroke-dashoffset: -200; }
          }
          @keyframes textGlow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(38, 116, 236, 0.3)); }
            50% { filter: drop-shadow(0 0 20px rgba(0, 198, 255, 0.5)); }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div className="relative z-10 w-full py-8 md:py-12">
          <div className="container mx-auto px-6 md:px-8">
            <div className="relative flex flex-col md:flex-row items-center min-h-[60vh] md:min-h-[55vh]">
              {/* Left - Content */}
              <div className="relative z-20 w-full md:w-[50%] lg:w-[48%] xl:w-[45%] md:ml-8 lg:ml-12 space-y-4 md:space-y-6 text-center md:text-left">
                {/* Badge */}
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-cyan-500/15 border border-primary/25 backdrop-blur-sm shadow-lg"
                  style={{ 
                    animation: "slideUp 0.6s ease-out both",
                    boxShadow: "0 0 20px rgba(38, 116, 236, 0.15), inset 0 0 20px rgba(38, 116, 236, 0.05)"
                  }}
                >
                  <img src={logomark} alt="A+ Charge" className="w-4 h-4" />
                  <span className="text-xs font-bold text-primary tracking-wide">Northeast India's Leading EV Network</span>
                </div>

                {/* Main Heading with typing effect style */}
                <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight">
                  <span 
                    className="block bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent"
                    style={{ animation: "slideUp 0.6s ease-out 0.1s both, textGlow 3s ease-in-out infinite" }}
                  >
                    Power Your
                  </span>
                  <span 
                    className="block bg-gradient-to-r from-cyan-500 via-primary to-blue-600 bg-clip-text text-transparent"
                    style={{ animation: "slideUp 0.6s ease-out 0.2s both, textGlow 3s ease-in-out 0.5s infinite" }}
                  >
                    Electric Journey
                  </span>
                </h1>

                {/* Description */}
                <p 
                  className="text-sm md:text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-3xl mx-auto md:mx-0 md:pr-16 lg:pr-24"
                  style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
                >
                  India's fastest-growing EV Charge Point Operator, delivering smart, reliable, and sustainable charging
                  infrastructure across the Northeast - for drivers, developers, and partners.
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

              {/* Right - Illustration - Bigger and aligned */}
              <div
                className="absolute right-[-8%] top-[45%] -translate-y-1/2 w-[60%] md:w-[55%] lg:w-[58%] xl:w-[60%] hidden md:block"
                style={{ animation: "scaleIn 0.8s ease-out 0.3s both" }}
              >
                <img
                  src={heroEvCharging}
                  alt="A Plus Charge EV charging station - white electric car charging at branded A Plus charger"
                  className="relative w-full h-auto object-contain object-right drop-shadow-2xl"
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

        {/* Scroll indicator with smooth scroll */}
        <button 
          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer"
          style={{ animation: "slideUp 0.6s ease-out 0.8s both" }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* Charging Stations Map with Sidebar */}
      <section
        id="map-section"
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
              <span className="text-primary font-semibold">Live Network</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Our Charging Network</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              Strategically located across Northeast India to power your journey. Click on markers to navigate.
            </p>
          </div>
          
          {/* Map with Sidebar Layout */}
          <div className="animate-fade-in max-w-7xl mx-auto grid lg:grid-cols-4 gap-6" style={{ animationDelay: "0.2s" }}>
            {/* Sidebar - Quick Stats & Navigation Help */}
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">Total Stations</span>
                    <span className="font-bold text-primary">25+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">Live Chargers</span>
                    <span className="font-bold text-cyan-600">50+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">States Covered</span>
                    <span className="font-bold text-green-600">7</span>
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
            <div className="lg:col-span-3 order-1 lg:order-2">
              <GoogleMapsCharging />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section - Redesigned with Full-Width Illustration and Service Pointers */}
      <section
        ref={statsSection.ref}
        className={`py-12 md:py-16 mb-0 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/20 transition-all duration-1000 ${statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Full-Width Illustration - Pinned to Right (Hidden on mobile) */}
        <div className="absolute inset-0 lg:flex md:flex hidden items-center justify-end overflow-hidden">
          <img
            src={chargingStationIllustration}
            alt="Modern A Plus Charge EV charging station with solar panels and white electric vehicle"
            className="relative w-[120%] md:w-[110%] lg:w-[100%] max-w-none object-contain object-right lg:translate-x-0 md:translate-x-[5%] lg:translate-y-8 md:translate-y-8"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent pointer-events-none"></div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-cyan-500/5 rounded-full blur-3xl z-0"></div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 max-w-2xl md:max-w-xl lg:max-w-3xl md:ml-0">
            {/* Left Side - Heading and Service Pointers */}
            <div className="w-full space-y-5">
              {/* Heading */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    FAST & RELIABLE
                  </span>
                  <br />
                  <span className="text-foreground">EV CHARGING SOLUTION!</span>
                </h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-cyan-500 rounded-full"></div>
              </div>

              {/* Service Pointers - Compact, consistent size, no scale on hover */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {servicePointers.map((service, index) => {
                  const Icon = service.icon;
                  const isActive = activeService === index;
                  return (
                    <div
                      key={index}
                      className={`group relative p-3 md:p-4 rounded-lg cursor-pointer transition-colors duration-300 overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-md' 
                          : 'bg-white/90 backdrop-blur-sm border border-primary/10 hover:border-primary/30'
                      }`}
                      onMouseEnter={() => setActiveService(index)}
                      onMouseLeave={() => setActiveService(null)}
                      onClick={() => microFeedback({ vibratePattern: [12, 40, 12], frequencyHz: 720 })}
                      onTouchStart={() => microFeedback({ vibratePattern: 16, frequencyHz: 720 })}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-primary/10'} transition-colors`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <h3 className={`font-semibold text-xs md:text-sm leading-tight transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-foreground'
                        }`}>
                          {service.title}
                        </h3>
                      </div>
                      {/* Description tooltip on hover */}
                      <div className={`mt-2 text-[10px] leading-relaxed transition-all duration-300 overflow-hidden ${
                        isActive ? 'text-white/90 opacity-100 max-h-16' : 'opacity-0 max-h-0'
                      }`}>
                        {service.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Image - Appears below stats on mobile */}
            <div className="w-full lg:hidden md:hidden flex justify-end relative mt-8 mb-0 overflow-visible min-h-[280px] sm:min-h-[350px]">
              <img
                src={chargingStationIllustration}
                alt="Modern A Plus Charge EV charging station with solar panels and white electric vehicle"
                className="w-full max-w-none object-contain object-right scale-[2] origin-right"
              />
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
        title="Rooted in Northeast India, Powering the Future"
        description="Like the mighty Brahmaputra that connects our lands, we're building a charging network that flows across Assam, Meghalaya, Arunachal Pradesh, and beyond. From the hills of Shillong to the plains of Guwahati, we understand our region's unique terrain and deliver charging solutions that work in every season, every landscape."
        backgroundImage={northeastHillsLandscape}
      />

      {/* USP Section - Interactive Network */}
      <NetworkVisualization />


      {/* Storytelling Section - Charging Made Simple */}
      <StorytellingSection
        title="Charging Made Simple, Everywhere You Go"
        description="From bustling cities to remote hill stations, we're bringing reliable EV charging to every corner of the Northeast. Because your journey shouldn't be limited by where you can charge."
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
                    className="flex-shrink-0 mx-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  >
                    <img src={partner.src} alt={partner.alt} className="h-16 w-auto object-contain" />
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
        title="Join the Electric Revolution"
        description="Every kilowatt charged, every mile driven electric, every partner who joins us - together we're creating a cleaner, greener Northeast India. The future isn't coming, it's already here."
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
    </div>
  );
};
export default Home;
