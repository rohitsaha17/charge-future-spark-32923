import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, Shield, Target, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import energyFlow from "@/assets/energy-flow.jpg";

const Invest = () => {
  const highlights = [
    { icon: TrendingUp, title: "Explosive Market Growth", description: "EV adoption accelerating rapidly in India" },
    { icon: Zap, title: "First-Mover Advantage", description: "Early presence in Northeast India" },
    { icon: Target, title: "Diversified Revenue", description: "Multiple income streams and models" },
    { icon: Shield, title: "Asset-Light Expansion", description: "Efficient scalable growth strategy" },
    { icon: Award, title: "Government Recognition", description: "UNNATI & DPIIT certified" },
    { icon: Users, title: "Strong Partnerships", description: "Ather Energy, MG, Tata" },
  ];

  const traction = [
    "Incorporated in 2022, operational in 2023",
    "Secured PCC compliance and deployed 30kW DC chargers",
    "Partnered with Ather Energy and GMDA",
    "Emerged as Northeast India's leading EV charging company"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your interest! Our team will contact you shortly.");
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      {/* Hero */}
      <section 
        className="relative py-32 mb-20 overflow-hidden"
        style={{
          backgroundImage: `url(${energyFlow})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background"></div>
        <div className="absolute inset-0" style={{ background: 'var(--gradient-radial)', opacity: 0.3 }}></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Invest in the Future of Energy
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            At A Plus Charge, we're not just scaling EV charging infrastructure — we're building the backbone 
            of India's clean mobility revolution. With proven traction, government recognition, and strong 
            partnerships, we offer investors a unique opportunity to power growth in one of the fastest-growing 
            markets of the decade.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10">
        {/* Why Invest */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Invest in A Plus Charge?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 hover:scale-105 hover:glow-effect transition-all duration-300 glass-card"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
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
                Be part of A Plus Charge's growth journey and share in our success.
              </p>
            </Card>
            <Card className="p-6 hover:glow-effect transition-all duration-300 glass-card">
              <h3 className="text-xl font-bold mb-4 text-primary">Strategic Partnership</h3>
              <p className="text-muted-foreground">
                Enable rapid expansion across highways, cities, and real estate hubs.
              </p>
            </Card>
            <Card className="p-6 hover:glow-effect transition-all duration-300 glass-card">
              <h3 className="text-xl font-bold mb-4 text-primary">Venture Investment</h3>
              <p className="text-muted-foreground">
                Join at a high-growth inflection point in the Indian EV infrastructure market.
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
                  <Label>Name</Label>
                  <Input required placeholder="Your name" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input required type="tel" placeholder="Your phone" />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input required type="email" placeholder="your@email.com" />
              </div>

              <div>
                <Label>Organization / Fund Name</Label>
                <Input placeholder="Organization name" />
              </div>

              <div>
                <Label>City / Location</Label>
                <Input placeholder="Your city" />
              </div>

              <div>
                <Label>Type of Investor</Label>
                <Select required>
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
                <Select>
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

              <Button type="submit" className="w-full glow-effect">
                Submit Enquiry
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Invest;
