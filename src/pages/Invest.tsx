import { useState } from "react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedPageHeader from "@/components/EnhancedPageHeader";
import AnimatedCard from "@/components/AnimatedCard";
import { TrendingUp, Award, Shield, Target, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import energyFlow from "@/assets/energy-flow.jpg";
import { supabase } from "@/integrations/supabase/client";

const Invest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const highlights = [
    { icon: TrendingUp, title: "The Regional Vacuum", description: "East & Northeast India: 1-2% EV penetration. We own the First-Mover advantage." },
    { icon: Zap, title: "Operational Excellence", description: "97% network uptime in India's most challenging terrains" },
    { icon: Target, title: "First-Mover Regional Moat", description: "Exclusive operations at major airports and government facilities" },
    { icon: Shield, title: "Diversified Revenue", description: "Charging income, equipment sales, SaaS fees, and integrated advertising" },
    { icon: Award, title: "Capital-Efficient Growth", description: "Asset-light hybrid model targeting 10,000+ stations by 2030" },
    { icon: Users, title: "OEM Partnerships", description: "Verified regional partner for Tata Motors, MG, and Ather Energy" },
  ];

  const traction = [
    "Marquee Deployments: Exclusive presence at AAI sites in Silchar, Dibrugarh, Jorhat, and Shillong",
    "OEM Trusted: Primary regional infrastructure partner for Tata Motors, MG, and Ather Energy",
    "Government-Backed: Operating within GMDA parking facilities and high-traffic transit hubs",
    "The 97% Standard: Highest reliability rate in the region"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const organization = formData.get('organization') as string;
    const city = formData.get('city') as string;
    const investorType = formData.get('investorType') as string;
    const investmentRange = formData.get('investmentRange') as string;

    try {
      const { error } = await supabase
        .from('investor_enquiries')
        .insert({
          name,
          phone,
          email,
          organization: organization || null,
          city: city || null,
          investor_type: investorType || null,
          investment_range: investmentRange || null,
        });

      if (error) throw error;
      
      // Google Ads conversion tracking - Investor form submission
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18094566614/stSnCLy48JwcENbZlLRD',
          'value': 1.0,
          'currency': 'INR'
        });
      }
      
      toast.success("Thank you for your interest! Our team will contact you shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting enquiry:', error);
      }
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEOHead
        title="Invest in EV Charging Infrastructure"
        description="Invest in Northeast India's fastest-growing EV charging network. First-mover advantage, 97% uptime, diversified revenue streams. Contact us today."
        path="/invest"
        keywords="invest EV charging India, EV infrastructure investment, A Plus Charge investor, electric vehicle business opportunity"
      />
      {/* Enhanced Hero Section */}
      <EnhancedPageHeader
        title="Why"
        titleHighlight="Invest?"
        subtitle="Investment Opportunity"
        description="The Regional Vacuum: East and Northeast India represent a massive untapped market with only 1-2% EV station penetration. We own the 'First-Mover' advantage."
        backgroundImage={energyFlow}
        icon={<TrendingUp className="w-4 h-4" />}
        badges={[
          { icon: <Award className="w-4 h-4" />, text: "DPIIT Certified" },
          { icon: <Shield className="w-4 h-4" />, text: "97% Network Uptime" },
          { icon: <TrendingUp className="w-4 h-4" />, text: "10,000+ Stations by 2030" },
        ]}
        theme="aurora"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Why Invest */}
        <div className="mb-20">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Invest in A Plus Charge?
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedCard 
                  key={index} 
                  delay={index * 0.1}
                  className="p-6 glass-card"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </AnimatedCard>
              );
            })}
          </div>
        </div>

        {/* Traction */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Traction & Highlights</h2>
          <Card className="p-8 max-w-3xl mx-auto glass-card">
            <ul className="space-y-4">
              {traction.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Investment Opportunities */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Investment Opportunities</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:glow-effect transition-all duration-300 glass-card">
              <h3 className="text-xl font-bold mb-4 text-primary">Equity Participation</h3>
              <p className="text-muted-foreground">
                Secure a foundational stake in A Plus Charge's journey as we scale to become the dominant energy provider for the Northeast's electric future.
              </p>
            </Card>
            <Card className="p-6 hover:glow-effect transition-all duration-300 glass-card">
              <h3 className="text-xl font-bold mb-4 text-primary">Strategic Partnership</h3>
              <p className="text-muted-foreground">
                Collaborate on the rapid deployment of high-speed charging corridors across major regional highways, urban centers, and premium real estate hubs.
              </p>
            </Card>
            <Card className="p-6 hover:glow-effect transition-all duration-300 glass-card">
              <h3 className="text-xl font-bold mb-4 text-primary">Venture Investment</h3>
              <p className="text-muted-foreground">
                Capitalize on a unique high-growth inflection point within India's specialized EV infrastructure market, backed by strong government policy and local dominance.
              </p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Investor Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Transparent financial models & strong compliance",
              "Scalable, capital-efficient growth strategy",
              "Experienced leadership & local market expertise",
              "Exposure to sustainable, high-impact sector with long-term potential"
            ].map((benefit, index) => (
              <Card key={index} className="p-6 flex items-start hover:glow-effect transition-all duration-300 glass-card">
                <div className="w-3 h-3 bg-primary rounded-full mt-1 mr-4 flex-shrink-0"></div>
                <span>{benefit}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Investor Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 glass-card">
            <h2 className="text-2xl font-bold mb-6">Investor Enquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input name="name" required placeholder="Your name" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input name="phone" required type="tel" placeholder="Your phone" />
                </div>
              </div>

              <div>
                <Label>Email *</Label>
                <Input name="email" required type="email" placeholder="your@email.com" />
              </div>

              <div>
                <Label>Organization / Fund Name</Label>
                <Input name="organization" placeholder="Organization name" />
              </div>

              <div>
                <Label>City / Location</Label>
                <Input name="city" placeholder="Your city" />
              </div>

              <div>
                <Label>Type of Investor</Label>
                <Select name="investorType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vc">Venture Capital</SelectItem>
                    <SelectItem value="angel">Angel Investor</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                    <SelectItem value="strategic">Strategic Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Investment Interest (₹)</Label>
                <Select name="investmentRange">
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">₹10L - ₹50L</SelectItem>
                    <SelectItem value="medium">₹50L - ₹2Cr</SelectItem>
                    <SelectItem value="large">₹2Cr - ₹5Cr</SelectItem>
                    <SelectItem value="xlarge">₹5Cr+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full glow-effect" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Enquiry"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Invest;
