import { Card } from "@/components/ui/card";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import ScrollReveal from "@/components/ScrollReveal";
import { Target, Eye, Heart, CheckCircle, Zap, Users, Leaf, Star, ChevronDown, Linkedin, Instagram } from "lucide-react";
import founderPortrait from "@/assets/team/founder-samyak-new.jpg";
import heroBackground from "@/assets/charging-station-launch.jpg";
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
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  const stats = [
    { value: 50, label: "Charging Stations", suffix: "+" },
    { value: 25000, label: "Charges Delivered", suffix: "+" },
    { value: 98, label: "Uptime Rate", suffix: "%" },
    { value: 500, label: "Happy Customers", suffix: "+" },
  ];

  const values = [
    { icon: Zap, title: "Reliability First", description: "99%+ uptime guaranteed across all stations" },
    { icon: Users, title: "Customer Obsessed", description: "24/7 support in local languages" },
    { icon: Leaf, title: "Sustainability", description: "Clean energy for a greener Northeast" },
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
      answer: "We're the only EV charging network built specifically for Northeast India's unique terrain, weather, and power grid challenges. Our systems are optimized for monsoons, hill stations, and local language support."
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
      instagram: "https://www.instagram.com/samyakjain_it_is/"
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
        <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-muted-foreground">{label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Full-Width Hero Section - Clean and Professional */}
      <section id="hero" className="text-center mb-24 relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="A Plus Charge Station Launch" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/80 to-background" />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 hover:bg-white/20 transition-all duration-300">
              <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span className="text-sm font-semibold text-white/95 tracking-wide">Northeast India's #1 EV Charging Network</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-white drop-shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">A Plus Charge</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto mb-10 drop-shadow-xl animate-fade-in leading-relaxed" style={{ animationDelay: '0.4s' }}>
            Born in Assam, built for the Northeast. We're creating the backbone of sustainable mobility across seven sister states.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '50+', label: 'Charging Stations' },
              { value: '7', label: 'States Covered' },
              { value: '98%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <span className="text-3xl font-bold text-cyan-300">{stat.value}</span>
                <span className="text-sm text-white/80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">

        {/* Stats Section */}
        <ScrollReveal>
          <section id="stats" className="mb-24 scroll-mt-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <ScrollReveal key={index} delay={index * 100} direction="up">
                  <StatsCounter {...stat} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Trusted By Section */}
        <ScrollReveal>
          <section id="partners" className="mb-24 scroll-mt-24 -mx-4 px-4 py-12 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent rounded-2xl">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">Trusted by teams at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {partners.map((partner, index) => (
                  <ScrollReveal key={index} delay={index * 50}>
                    <div className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 hover:scale-110">
                      <img src={partner.logo} alt={partner.name} className="h-8 md:h-10 object-contain" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <GradientDivider />

        {/* Story Section */}
        <ScrollReveal>
          <section id="story" className="mb-24 scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
                It All Started with Range Anxiety
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <ScrollReveal delay={100}>
                  <p>
                    In 2021, our founder was driving an EV through Guwahati when the battery warning came on. 
                    The nearest charging station was 40km away, and it wasn't even operational. That moment of 
                    helplessness sparked an idea: Northeast India needed reliable charging infrastructure.
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <p>
                    We spent months understanding the region's unique challenges - monsoon rains that could flood 
                    stations, power grids that needed smart load management, and communities that spoke different 
                    languages. Traditional charging solutions weren't built for us.
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={300}>
                  <p>
                    Today, we're proud to operate the region's most reliable network, with stations that work 
                    through storms, algorithms optimized for local power conditions, and support teams that speak 
                    your language. We're not just solving range anxiety - we're building the foundation for 
                    Northeast India's electric future.
                  </p>
                </ScrollReveal>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <GradientDivider />

        <StorytellingSection 
          title="Building Trust Through Reliability"
          description="Every station we install is a promise kept. Every kilowatt delivered is trust earned. We don't just power vehicles - we power the dreams of a cleaner, brighter Northeast India."
        />

        <GradientDivider />

        {/* What We Believe In */}
        <ScrollReveal>
          <section id="values" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Believe In</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal key={index} delay={index * 150} direction="scale">
                    <Card className="p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        <GradientDivider />

        {/* Founder Section */}
        <section id="team" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Meet the Founder
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The visionary behind Northeast India's most reliable EV charging network
          </p>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-96 md:h-auto overflow-hidden">
                  <img 
                    src={team[0].image} 
                    alt={team[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-2">{team[0].name}</h3>
                  <p className="text-primary font-semibold mb-4">{team[0].role}</p>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {team[0].story}
                  </p>
                  <div className="border-l-4 border-primary pl-4 mb-6">
                    <p className="text-sm font-semibold text-foreground">{team[0].highlight}</p>
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
                      href={team[0].instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section id="mission-vision" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To accelerate Northeast India's transition to electric mobility by building the region's most reliable, accessible, and user-friendly charging infrastructure. We're committed to eliminating range anxiety and making EV ownership a seamless experience for every driver.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To create a sustainable future where every corner of Northeast India is powered by clean energy. We envision a region where EV charging is as convenient as fueling traditional vehicles, driving economic growth while preserving our beautiful landscapes for generations to come.
              </p>
            </Card>
          </div>
        </section>

        <GradientDivider />

        {/* Journey Timeline Section */}
        <section id="journey" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            A Plus Charge's Journey to EV Charging Leadership
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From ideation to market leadership - our milestones in transforming Northeast India's EV landscape
          </p>
          <JourneyTimeline />
        </section>

        <GradientDivider />

        {/* Testimonials Section */}
        <section id="testimonials" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Proven by People Who Use It
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Hear from EV drivers who trust our network every day
          </p>
          <TestimonialsCarousel />
        </section>

        <GradientDivider />

        {/* FAQ Section */}
        <section id="faq" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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
