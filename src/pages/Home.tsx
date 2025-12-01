import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Zap, ChevronDown, ArrowRight } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";
import logomark from "@/assets/a-plus-logomark.png";
import heroEvCharging from "@/assets/hero-ev-charging-v2.png";
import trustBg from "@/assets/trust-bg.jpg";
import northeastHillsLandscape from "@/assets/northeast-hills-landscape.jpg";
import brahmaputraSunset from "@/assets/brahmaputra-sunset.jpg";
import USPCarousel from "@/components/USPCarousel";
import atherLogo from "@/assets/partners/ather-logo-new.png";
import mgLogo from "@/assets/partners/mg-logo-new.png";
import tataLogo from "@/assets/partners/tata-logo-new.png";
import gmdaLogo from "@/assets/partners/gmda-logo-new.png";
import aaiLogo from "@/assets/partners/aai-logo.png";
import imperiaVistaLogo from "@/assets/partners/imperia-vista-logo.png";
import osmLogo from "@/assets/partners/osm-logo.png";
import appSectionBg from "@/assets/app-section-bg.jpg";
import phoneMockup from "@/assets/phone-mockup-dynamic.png";
import googlePlayBadge from "@/assets/google-play-official.png";
import appStoreBadge from "@/assets/app-store-official.png";
import gradientBreak from "@/assets/gradient-section-break.png";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import chargingStationIllustration from "@/assets/charging-station-illustration.png";
import GoogleMapsCharging from "@/components/GoogleMapsCharging";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const Home = () => {
  const chargers = useCountUp({
    end: 50,
    duration: 2500,
  });
  const stations = useCountUp({
    end: 25,
    duration: 2500,
  });
  const customers = useCountUp({
    end: 1000,
    duration: 2500,
  });
  const mapSection = useScrollReveal();
  const statsSection = useScrollReveal();
  const benefitsSection = useScrollReveal();
  const trustSection = useScrollReveal();
  const partnersSection = useScrollReveal();
  const appSection = useScrollReveal();
  const testimonialsSection = useScrollReveal();
  const faqSection = useScrollReveal();
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
      {/* Hero Section - Enhanced Design */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Multi-layered Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          {/* Animated Gradient Orbs */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"
            style={{
              animationDuration: "4s",
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"
            style={{
              animationDuration: "6s",
              animationDelay: "1s",
            }}
          ></div>

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(216 83% 56%) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(216 83% 56%) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(38,116,236,0.08),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 w-full py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="relative flex flex-col md:flex-row items-center min-h-[80vh] md:min-h-[75vh]">
              {/* Left - Content */}
              <div className="relative z-20 w-full md:w-[50%] lg:w-[48%] xl:w-[45%] md:ml-8 lg:ml-12 space-y-4 md:space-y-6 animate-fade-in text-center md:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <img src={logomark} alt="A+ Charge" className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold text-primary">Northeast India's Leading EV Network</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Power Your Electric Journey
                  </span>
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-3xl mx-auto md:mx-0 md:pr-4">
                  India's fastest-growing EV Charge Point Operator, delivering smart, reliable, and sustainable charging
                  infrastructure across the Northeast - for drivers, developers, and partners.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 items-center md:items-start">
                  {/* Primary Button */}
                  <Link
                    to="/find-charger"
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                      text-white bg-gradient-to-r from-[#2674EC] to-[#00C6FF]
                      shadow-[0_6px_24px_rgba(38,116,236,0.35)] 
                      transition-all duration-300 ease-out
                      hover:shadow-[0_10px_36px_rgba(0,198,255,0.5)] hover:scale-[1.05] hover:-translate-y-0.5
                      active:scale-95 w-full sm:w-auto whitespace-nowrap"
                  >
                    <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Find a Charger</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>

                  {/* Secondary Button */}
                  <Link
                    to="/partner"
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                      text-primary border-2 border-primary/30 bg-white/80 backdrop-blur-sm
                      shadow-[0_4px_16px_rgba(38,116,236,0.1)]
                      transition-all duration-300 ease-out
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50
                      hover:border-primary/50 hover:shadow-[0_6px_24px_rgba(38,116,236,0.2)] 
                      hover:scale-[1.05] hover:-translate-y-0.5
                      active:scale-95 w-full sm:w-auto whitespace-nowrap"
                  >
                    <span>Become a Partner</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Right - Illustration - Sticks to right edge */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] md:w-[65%] lg:w-[68%] xl:w-[70%] hidden md:block animate-fade-in"
                style={{
                  animationDelay: "0.2s",
                }}
              >
                <img
                  src={heroEvCharging}
                  alt="A Plus Charge EV charging station - white electric car charging at branded A Plus charger"
                  className="w-full h-auto object-contain object-right drop-shadow-2xl"
                  loading="eager"
                />
              </div>

              {/* Mobile Illustration */}
              <div
                className="relative w-full flex items-center justify-center md:hidden mt-8 animate-fade-in"
                style={{
                  animationDelay: "0.2s",
                }}
              >
                <img
                  src={heroEvCharging}
                  alt="A Plus Charge EV charging station - white electric car charging at branded A Plus charger"
                  className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charging Stations Map */}
      <section
        ref={mapSection.ref}
        className={`py-20 relative overflow-visible transition-all duration-1000 ${mapSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Enhanced Radial Gradient Depth Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,_hsl(216_83%_56%_/_0.15),_transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(220_15%_97%)] to-background pointer-events-none"></div>

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
          <div className="animate-fade-in max-w-7xl mx-auto" style={{ animationDelay: "0.2s" }}>
            <GoogleMapsCharging />
          </div>
        </div>
      </section>

      {/* Gradient Section Breaker (pulled up to touch the map - no gap) */}
      <div
        style={{ backgroundImage: `url(${gradientBreak})` }}
        aria-hidden="true"
        className="w-full h-32 bg-cover bg-center bg-no-repeat -mt-20 md:-mt-32 mx-0"
      />
      {/* Live Stats Section - Redesigned with Full-Width Illustration */}
      <section
        ref={statsSection.ref}
        className={`py-12 md:py-20 lg:py-24 pb-0 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/20 transition-all duration-1000 ${statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* White gradient overlay at top to merge smoothly */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-primary/5 rounded-full blur-3xl z-0"></div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col lg:flex-row items-start gap-8 md:gap-12 max-w-2xl md:max-w-xl lg:max-w-2xl md:ml-0">
            {/* Left Side - Heading and Stats */}
            <div className="w-full space-y-6 md:space-y-8">
              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    FAST & RELIABLE
                  </span>
                  <br />
                  <span className="text-foreground">EV CHARGING SOLUTION!</span>
                </h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-cyan-500 rounded-full"></div>
              </div>

              {/* Compact Stats Grid - Responsive sizing */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-0 md:scale-[0.85] lg:scale-100 md:origin-left">
                <div
                  ref={chargers.ref}
                  className="group bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-0"
                >
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="bg-primary/10 rounded-lg w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-bold text-foreground truncate">
                    {chargers.count}+
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5 md:mt-1 leading-tight">
                    Live Chargers
                  </div>
                </div>

                <div
                  ref={stations.ref}
                  className="group bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-6 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-0"
                >
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="bg-cyan-500/10 rounded-lg w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors flex-shrink-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-bold text-foreground truncate">
                    {stations.count}+
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5 md:mt-1 leading-tight">
                    Stations
                  </div>
                </div>

                <div
                  ref={customers.ref}
                  className="group bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-6 border border-green-500/10 hover:border-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-0"
                >
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="bg-green-500/10 rounded-lg w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-bold text-foreground truncate">
                    {customers.count}+
                  </div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5 md:mt-1 leading-tight">
                    Customers
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Image - Appears below stats on mobile */}
            <div className="w-full lg:hidden md:hidden flex justify-end relative mt-12 mb-8 overflow-visible min-h-[300px] sm:min-h-[400px]">
              <img
                src={chargingStationIllustration}
                alt="Modern A Plus Charge EV charging station with solar panels and white electric vehicle"
                className="w-full max-w-none object-contain object-right scale-[2.125] origin-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section - Where Innovation Meets Tradition - No gap from stats */}
      <div className="-mt-8 md:-mt-12">
        <StorytellingSection
          title="Where Innovation Meets Tradition"
          description="We're not just another charging provider company. We're your neighbors, your community partners, building infrastructure that respects our heritage while embracing tomorrow. Every charging station is a step toward energy independence for the Northeast."
          backgroundImage={appSectionBg}
        />
      </div>

      <GradientDivider />

      {/* Benefits Section */}
      <div
        ref={benefitsSection.ref}
        className={`transition-all duration-1000 ${benefitsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <BenefitsSection />
      </div>

      <GradientDivider />

      {/* Trust Section - Northeast Hills */}
      <StorytellingSection
        title="Rooted in Northeast India, Powering the Future"
        description="Like the mighty Brahmaputra that connects our lands, we're building a charging network that flows across Assam, Meghalaya, Arunachal Pradesh, and beyond. From the hills of Shillong to the plains of Guwahati, we understand our region's unique terrain and deliver charging solutions that work in every season, every landscape."
        backgroundImage={northeastHillsLandscape}
      />

      <GradientDivider />

      {/* USP Section */}
      <USPCarousel />

      <GradientDivider />

      {/* Storytelling Section - Charging Made Simple */}
      <StorytellingSection
        title="Charging Made Simple, Everywhere You Go"
        description="From bustling cities to remote hill stations, we're bringing reliable EV charging to every corner of the Northeast. Because your journey shouldn't be limited by where you can charge."
        backgroundImage={brahmaputraSunset}
      />

      {/* Client Logos - Scrolling with Gradient Separator */}
      <section
        ref={partnersSection.ref}
        className={`py-20 relative overflow-hidden transition-all duration-1000 ${partnersSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Gradient separator layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_15%_97%)] via-[hsl(216_83%_98%)] to-[hsl(220_15%_97%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
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

      <GradientDivider />

      {/* App Download Section - Creative Design */}
      <section
        ref={appSection.ref}
        className={`py-12 md:py-16 relative overflow-visible transition-all duration-1000 ${appSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4 pt-48 md:pt-64 lg:pt-80">
          <div className="max-w-6xl mx-auto">
            {/* Blue Themed Box Container - Compact Height */}
            <div className="relative bg-gradient-to-br from-[#1a3a6e] via-[#2674EC] to-[#00C6FF] rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 lg:p-8 overflow-visible shadow-[0_20px_60px_-15px_rgba(38,116,236,0.4)]">
              {/* Decorative Elements Inside Box */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 rounded-3xl md:rounded-[2.5rem]"></div>

              <div className="relative grid md:grid-cols-2 gap-4 md:gap-6 items-end">
                {/* Left side - Phone Mockup - 2x BIGGER, above text on mobile */}
                <div className="flex justify-center md:justify-center order-1 md:order-1 relative">
                  <div className="relative md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 animate-fade-in">
                    {/* Phone Image - 2x bigger, shifted down */}
                    <img
                      src={phoneMockup}
                      alt="A Plus Charge Mobile App Interface"
                      className="w-[380px] md:w-[700px] lg:w-[900px] h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500"
                      style={{ marginTop: '-200px' }}
                    />
                    {/* Glow Effect Behind Phone */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent blur-3xl -z-10 scale-110"></div>
                  </div>
                  {/* Spacer for phone height on desktop */}
                  <div className="hidden md:block h-[280px] lg:h-[320px]"></div>
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

      <GradientDivider />

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

      <GradientDivider />

      <StorytellingSection
        title="Join the Electric Revolution"
        description="Every kilowatt charged, every mile driven electric, every partner who joins us - together we're creating a cleaner, greener Northeast India. The future isn't coming, it's already here."
        backgroundImage={trustBg}
      />

      <GradientDivider />

      {/* FAQ Section */}
      <section
        ref={faqSection.ref}
        className={`py-20 relative overflow-hidden transition-all duration-1000 ${faqSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background"></div>
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
    </div>
  );
};
export default Home;
