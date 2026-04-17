import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_STATS,
  DEFAULT_PARTNERS,
  DEFAULT_FAQS,
  DEFAULT_TEAM,
  PARTNER_FALLBACKS,
  TEAM_FALLBACKS,
} from "@/lib/siteDefaults";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import EnhancedPageHeader from "@/components/EnhancedPageHeader";
import AnimatedCard from "@/components/AnimatedCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Target, Eye, Heart, CheckCircle, Zap, Users, Leaf, Star, ChevronDown, Linkedin, Youtube, MapPin, Clock } from "lucide-react";
import heroBackground from "@/assets/charging-station-launch.jpg";
import trustBg from "@/assets/trust-bg.jpg";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const INITIAL_STATS = DEFAULT_STATS;
const INITIAL_PARTNERS = DEFAULT_PARTNERS.map((p) => ({
  name: p.name,
  logo_url: p.fallbackImage,
  website_url: p.website_url,
  type: p.type,
}));

// Partner name → default type, so DB rows with no `type` column yet
// (i.e. before the latest migration runs) still land in the right section.
const PARTNER_DEFAULT_TYPE: Record<string, 'client' | 'partner' | 'both'> = Object.fromEntries(
  DEFAULT_PARTNERS.map((p) => [p.name, p.type])
);
const INITIAL_FAQS = DEFAULT_FAQS;
const INITIAL_TEAM = DEFAULT_TEAM.map((t) => ({
  name: t.name,
  role: t.role,
  image_url: t.fallbackImage,
  bio: t.bio,
  highlight: t.highlight,
  linkedin_url: t.linkedin_url,
  youtube_url: t.youtube_url,
}));

const About = () => {
  const [stats, setStats] = useState<any[]>(INITIAL_STATS);
  const [partners, setPartners] = useState<any[]>(INITIAL_PARTNERS);
  const [faqs, setFaqs] = useState<any[]>(INITIAL_FAQS);
  const [team, setTeam] = useState<any[]>(INITIAL_TEAM);

  useEffect(() => {
    (async () => {
      const [s, p, f, t] = await Promise.all([
        supabase.from('statistics').select('*').eq('visible', true).order('sort_order'),
        supabase.from('partners').select('*').eq('visible', true).order('sort_order'),
        supabase.from('faqs').select('*').eq('visible', true).order('sort_order'),
        supabase.from('team_members').select('*').eq('visible', true).order('sort_order'),
      ]);
      if (s.data && s.data.length) {
        setStats(s.data.map((r: any) => ({
          value: Number(String(r.value).replace(/[^0-9.]/g, '')) || 0,
          label: r.label,
          suffix: r.suffix || '',
        })));
      }
      if (p.data && p.data.length) {
        // Use uploaded logo if present, otherwise fall back to the bundled
        // default image keyed by partner name so the site still looks right.
        // Type falls back to the known default for well-known names so rows
        // from older seeds still land in the correct section.
        setPartners(
          p.data.map((r: any) => ({
            name: r.name,
            logo_url: r.logo_url || PARTNER_FALLBACKS[r.name] || null,
            website_url: r.website_url,
            type: r.type || PARTNER_DEFAULT_TYPE[r.name] || 'partner',
          }))
        );
      }
      if (f.data && f.data.length) setFaqs(f.data as any);
      if (t.data && t.data.length) {
        setTeam(
          t.data.map((r: any) => ({
            ...r,
            image_url: r.image_url || TEAM_FALLBACKS[r.name] || null,
          }))
        );
      }
    })();
  }, []);

  const values = [
    { icon: Zap, title: "Reliability First", description: "97%+ uptime guaranteed across all stations" },
    { icon: Users, title: "Customer Obsessed", description: "24/7 support, local language help whenever you need it" },
    { icon: Leaf, title: "Community-First Growth", description: "Powered by local talent, creating jobs in our communities" },
  ];

  return (
    <div className="min-h-screen pb-20">
      <SEOHead
        title="About Us - Our Mission & Team"
        description="A Plus Charge is Northeast India's leading EV charging network. 45+ live stations, 97% uptime, covering 9 states. Meet our team and learn our story."
        path="/about"
        keywords="A Plus Charge about, EV charging company India, Northeast India EV, Guwahati EV charging team"
      />
      {/* Enhanced Hero Section */}
      <EnhancedPageHeader
        title="From Vision to"
        titleHighlight="Reality"
        subtitle="Powering Tomorrow's Mobility"
        description="Born in Assam, built for the Northeast. We're not just installing chargers - we're building the backbone of sustainable mobility across seven sister states."
        backgroundImage={heroBackground}
        icon={<Zap className="w-4 h-4" />}
        badges={[
          { icon: <MapPin className="w-4 h-4" />, text: "9 States Covered" },
          { icon: <Zap className="w-4 h-4" />, text: "45+ Live Stations" },
          { icon: <Clock className="w-4 h-4" />, text: "97% Uptime" },
        ]}
        theme="electric"
      />

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
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
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
              </motion.div>
            </div>
          </div>
        </section>

        <GradientDivider />

        {/* 2. Stats Section - Network at a Glance */}
        <section id="stats" className="mb-16 md:mb-24 scroll-mt-24">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Network at a Glance
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <AnimatedCounter 
                key={index} 
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
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
                {(() => {
                  const lead: any = team[0] || {};
                  const img = lead.image_url || lead.image;
                  return (
                    <>
                      <div className="relative h-64 sm:h-80 md:h-auto overflow-hidden">
                        {img && (
                          <img src={img} alt={lead.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{lead.name}</h3>
                        <p className="text-primary font-semibold mb-3 md:mb-4">{lead.role}</p>
                        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                          {lead.bio || lead.story}
                        </p>
                        {lead.highlight && (
                          <div className="border-l-4 border-primary pl-4 mb-4 md:mb-6">
                            <p className="text-xs md:text-sm font-semibold text-foreground">{lead.highlight}</p>
                          </div>
                        )}
                        <div className="flex gap-4">
                          {(lead.linkedin_url || lead.linkedin) && (
                            <a
                              href={lead.linkedin_url || lead.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Linkedin className="w-5 h-5" />
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                          {(lead.youtube_url || lead.youtube) && (
                            <a
                              href={lead.youtube_url || lead.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Youtube className="w-5 h-5" />
                              <span className="text-sm">YouTube</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          </div>
        </section>

        <GradientDivider />

        {/* 6. What We Believe In */}
        <section id="values" className="mb-16 md:mb-24 scroll-mt-24">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What We Believe In
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <AnimatedCard key={index} delay={index * 0.1} className="p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{value.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{value.description}</p>
                </AnimatedCard>
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

        {/* 8. Clients + Strategic Partners sections */}
        {(() => {
          const renderLogo = (partner: any, index: number) => {
            const img = partner.logo_url || partner.logo;
            if (!img) return null;
            const content = (
              <img
                src={img}
                alt={partner.name}
                className="h-8 md:h-10 lg:h-12 w-auto object-contain mix-blend-multiply"
                width="80"
                height="48"
              />
            );
            return (
              <div key={index} className="opacity-90 hover:opacity-100 hover:scale-105 hover:drop-shadow-[0_8px_20px_rgba(38,116,236,0.25)] transition-all duration-300 bg-transparent">
                {partner.website_url ? (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          };

          const clients = partners.filter((p: any) => p.type === 'client' || p.type === 'both');
          const strategic = partners.filter((p: any) => p.type === 'partner' || p.type === 'both');

          return (
            <>
              {clients.length > 0 && (
                <section id="clients" className="mb-12 md:mb-16 scroll-mt-24 -mx-4 px-4 py-8 md:py-12 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent rounded-2xl">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Our Clients</h2>
                    <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider mb-6">
                      Organisations using our charging network
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
                      {clients.map(renderLogo)}
                    </div>
                  </div>
                </section>
              )}

              {strategic.length > 0 && (
                <section id="partners" className="mb-16 md:mb-24 scroll-mt-24 -mx-4 px-4 py-8 md:py-12 bg-gradient-to-b from-primary/5 via-cyan-500/5 to-transparent rounded-2xl">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Strategic Partners</h2>
                    <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider mb-6">
                      OEMs and alliances powering our network
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
                      {strategic.map(renderLogo)}
                    </div>
                  </div>
                </section>
              )}
            </>
          );
        })()}

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
