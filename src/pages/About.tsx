import { Card } from "@/components/ui/card";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import { Target, Eye, Heart, CheckCircle, Zap, Users, Leaf, Star, ChevronDown, Linkedin, Youtube } from "lucide-react";
import founderPortrait from "@/assets/team/founder-samyak-new.jpg";
import heroBackground from "@/assets/charging-station-launch.jpg";
import trustBg from "@/assets/trust-bg.jpg";
import ctoPortrait from "@/assets/team/cto-portrait.jpg";
import operationsPortrait from "@/assets/team/operations-portrait.jpg";
import bdPortrait from "@/assets/team/bd-portrait.jpg";
import techPortrait from "@/assets/team/tech-portrait.jpg";
import customerPortrait from "@/assets/team/customer-portrait.jpg";
import atherLogo from "@/assets/partners/ather-logo-new.png";
import tataLogo from "@/assets/partners/tata-logo-new.png";
import mgLogo from "@/assets/partners/mg-logo-new.png";
import gmdaLogo from "@/assets/partners/gmda-logo-new.png";
import aaiLogo from "@/assets/partners/aai-logo.png";
import imperiaVistaLogo from "@/assets/partners/imperia-vista-logo.png";
import osmLogo from "@/assets/partners/osm-logo.png";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { useCountUp } from "@/hooks/useCountUp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  const stats = [
    { value: 45, label: "Live Public Stations", suffix: "+" },
    { value: 100, label: "Locations by 2026", suffix: "+" },
    { value: 97, label: "Average Uptime", suffix: "%" },
    { value: 9, label: "States Covered", suffix: "" },
  ];

  const values = [
    { icon: Zap, title: "Reliability First", description: "97%+ uptime guaranteed across all stations" },
    { icon: Users, title: "Customer Obsessed", description: "24/7 support, local language help whenever you need it" },
    { icon: Leaf, title: "Community-First Growth", description: "Powered by local talent, creating jobs in our communities" },
  ];

  const partners = [
    { name: "Ather Energy", logo: atherLogo },
    { name: "Tata Motors", logo: tataLogo },
    { name: "MG Motors", logo: mgLogo },
    { name: "GMDA", logo: gmdaLogo },
    { name: "Airports Authority of India", logo: aaiLogo },
    { name: "Imperia Vista", logo: imperiaVistaLogo },
    { name: "Omega Seiki Mobility", logo: osmLogo },
  ];

  const faqs = [
    {
      question: "What makes A Plus Charge different?",
      answer: "We're the best CPO from North East India built specifically for Northeast India's unique terrain, weather, and power grid challenges. Our systems are optimized for monsoons, hill stations, and local language support."
    },
    {
      question: "How reliable are your charging stations?",
      answer: "We maintain a 98%+ uptime rate with 24/7 monitoring and rapid response teams. Our stations are engineered to handle extreme weather conditions typical of Northeast India."
    },
    {
      question: "Which EV brands do you support?",
      answer: "We support all major EV brands including Tata, MG, Ather, and more. Our stations feature both CCS2 and Type 2 connectors for maximum compatibility."
    },
    {
      question: "How can I invest in A Plus Charge?",
      answer: "We offer site-host partnerships and investment opportunities. Visit our Invest page or contact our team to learn about ROI projections and partnership models."
    },
  ];

  const team = [
    {
      name: "Samyak Jain (EV Boy)",
      role: "Founder & CEO",
      image: founderPortrait,
      story: "Known as EV Boy for his passion and advocacy in clean mobility, Samyak Jain leads A Plus Charge - Northeast India's fastest-growing EV charging network. With over a decade of experience in renewable energy and infrastructure, he combines technical expertise with local insight to power India's electric future.",
      highlight: "PG in Entrepreneurship, Amity University | 10+ years in clean energy",
      linkedin: "https://in.linkedin.com/in/samyak-jain-alternatev",
      youtube: "https://www.youtube.com/@evboy_samyak"
    },
    {
      name: "Priya Sharma",
      role: "Chief Technology Officer",
      image: ctoPortrait,
      story: "Led the development of our proprietary charging management system. Priya's algorithms optimize for Northeast's unique power grid challenges and monsoon conditions.",
      highlight: "Former Tesla engineer, IoT specialist"
    },
    {
      name: "Ankit Deka",
      role: "Head of Operations",
      image: operationsPortrait,
      story: "Grew up in rural Assam, understands terrain challenges firsthand. Ankit ensures our chargers work flawlessly from Shillong's hills to Tezpur's valleys.",
      highlight: "Deployed 50+ charging stations across 7 states"
    },
    {
      name: "Meghna Bora",
      role: "Business Development Lead",
      image: bdPortrait,
      story: "Built partnerships with OEMs, site hosts, and government bodies. Meghna's local connections and negotiation skills opened doors across Northeast India.",
      highlight: "Secured GMDA partnership, Ather alliance"
    },
    {
      name: "Rahul Choudhury",
      role: "Lead Engineer",
      image: techPortrait,
      story: "Designs charging infrastructure that withstands extreme weather. Rahul's innovations in waterproofing and voltage stability set industry standards.",
      highlight: "15 patents in EV charging technology"
    },
    {
      name: "Sneha Das",
      role: "Customer Success Manager",
      image: customerPortrait,
      story: "Speaks 5 regional languages, runs our 24/7 support. Sneha ensures every EV driver feels supported, from first-time users to fleet operators.",
      highlight: "99.2% customer satisfaction rating"
    }
  ];

  const StatsCounter = ({ value, label, suffix }: { value: number; label: string; suffix: string }) => {
    const { count, ref } = useCountUp({ end: value, duration: 2000, startOnView: false });
    return (
      <div ref={ref} className="text-center">
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm md:text-base text-muted-foreground">{label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Full-Width Hero Section - Enhanced */}
      <section id="hero" className="text-center mb-16 md:mb-24 relative overflow-hidden">
        {/* Background Image with Gradient Blue to White Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="A Plus Charge Station Launch" 
            className="w-full h-full object-cover object-center"
          />
          {/* Blue to white gradient overlay for smooth merging */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-background" />
          {/* Animated particles effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 py-24 md:py-32 lg:py-48 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Zap className="w-4 h-4 text-cyan-300" />
            <span className="text-xs sm:text-sm font-semibold text-white/90">Powering Tomorrow's Mobility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-2xl">
            From Vision to <span className="text-cyan-300">Reality</span><br />
            <span className="text-white/95 drop-shadow-2xl">
              Electrifying Northeast India
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-medium max-w-3xl mx-auto mb-8 drop-shadow-xl">
            Born in Assam, built for the Northeast. We're not just installing chargers - we're building the backbone of sustainable mobility across seven sister states, one charging station at a time.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">

        {/* 1. Our Story Section - Split Layout */}
        <section id="mission" className="mb-16 md:mb-24 scroll-mt-24">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left - The Story */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                Powering the Change
              </h2>
              <div className="space-y-4 md:space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>
                  Rooted in the heart of Guwahati and branching across the Seven Sisters with brother Sikkim and West Bengal, 
                  A Plus Charge (AlternatEV Solutions) was founded to solve a critical challenge: the EV infrastructure gap 
                  in East and North-East India.
                </p>
                <p>
                  We are here to pioneer a lifestyle shift. By replacing traditional fuel stops with smart, high-speed 
                  charging hubs, we are making electric mobility the new standard for our region.
                </p>
                <p>
                  <strong className="text-foreground">Our Edge: Mastery of the Terrain.</strong> Local Expertise, Global Standards. While the geography 
                  of the Northeast can be a barrier for many, it is our home turf. From the high-altitude airstrips of 
                  Shillong to the remote roads of Upper Assam, we deploy technology that thrives in our unique landscape.
                </p>
                <p>
                  <strong className="text-foreground">Community-First Growth:</strong> We are powered by local talent. By engaging regional workforces 
                  and understanding local needs, we ensure the EV revolution creates jobs and economic value right here 
                  in our communities.
                </p>
              </div>
            </div>
            
            {/* Right - Vision & Mission Cards */}
            <div className="space-y-6">
              <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To accelerate Northeast India's transition to electric mobility by building the region's most reliable, accessible, and user-friendly charging infrastructure.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow border-l-4 border-l-cyan-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To create a sustainable future where every corner of Northeast India is powered by clean energy, driving economic growth while preserving our beautiful landscapes.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <GradientDivider />

        {/* 2. Stats Section - Network at a Glance */}
        <section id="stats" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            Our Network at a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <StatsCounter key={index} {...stat} />
            ))}
          </div>
        </section>

        <GradientDivider />

        {/* 3. Mission & Vision Section */}
        <section id="mission-vision" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Our Mission</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                To accelerate Northeast India's transition to electric mobility by building the region's most reliable, accessible, and user-friendly charging infrastructure. We're committed to eliminating range anxiety and making EV ownership a seamless experience for every driver.
              </p>
            </Card>
            <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
                <Eye className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Our Vision</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                To create a sustainable future where every corner of Northeast India is powered by clean energy. We envision a region where EV charging is as convenient as fueling traditional vehicles, driving economic growth while preserving our beautiful landscapes for generations to come.
              </p>
            </Card>
          </div>
        </section>

      </div>

      {/* 4. The Roadmap: Scaling with Impact - Full width storytelling with background */}
      <StorytellingSection 
        title="The Roadmap: Scaling with Impact"
        description="Strategic Expansion: We are on a fast-track to activate 100+ marquee locations by 2026, turning the Northeast into one of India's most EV-friendly zones. A Greener Horizon: Our eyes are set on 10,000+ EV stations by 2030."
        backgroundImage={trustBg}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        <GradientDivider />

        {/* 5. Meet the Founder Section */}
        <section id="team" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4">
            Meet the Founder
          </h2>
          <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            The visionary behind Northeast India's most reliable EV charging network
          </p>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 sm:h-80 md:h-auto overflow-hidden">
                  <img 
                    src={team[0].image} 
                    alt={team[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{team[0].name}</h3>
                  <p className="text-primary font-semibold mb-3 md:mb-4">{team[0].role}</p>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    {team[0].story}
                  </p>
                  <div className="border-l-4 border-primary pl-4 mb-4 md:mb-6">
                    <p className="text-xs md:text-sm font-semibold text-foreground">{team[0].highlight}</p>
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={team[0].linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                    <a 
                      href={team[0].youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                      <span className="text-sm">YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <GradientDivider />

        {/* 6. What We Believe In */}
        <section id="values" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">What We Believe In</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6 md:p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{value.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <GradientDivider />

        {/* 7. Journey Timeline Section */}
        <section id="journey" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4">
            A Plus Charge's Journey to EV Charging Leadership
          </h2>
          <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            From ideation to market leadership - our milestones in transforming Northeast India's EV landscape
          </p>
          <JourneyTimeline />
        </section>

        <GradientDivider />

        {/* 8. Clientele / Partners Section */}
        <section id="partners" className="mb-16 md:mb-24 scroll-mt-24 -mx-4 px-4 py-8 md:py-12 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent rounded-2xl">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Our Clientele</h2>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider mb-6">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
              {partners.map((partner, index) => (
                <div key={index} className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 bg-transparent">
                  <img src={partner.logo} alt={partner.name} className="h-8 md:h-10 lg:h-12 w-auto object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <GradientDivider />

        {/* 9. Testimonials Section */}
        <section id="testimonials" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4">
            Proven by People Who Use It
          </h2>
          <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            Hear from EV drivers who trust our network every day
          </p>
          <TestimonialsCarousel />
        </section>

        <GradientDivider />

        {/* FAQ Section */}
        <section id="faq" className="mb-16 md:mb-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm md:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
