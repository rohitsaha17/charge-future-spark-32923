import { Link } from "react-router-dom";
import GradientDivider from "@/components/GradientDivider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Building2, Zap, Rocket, Shield, TrendingUp } from "lucide-react";

const Services = () => {
  const chargerTypes = [
    {
      icon: Home,
      name: "Residential Chargers",
      power: "3.3 kW - 7.4 kW",
      description: "Perfect for home charging with overnight convenience",
      features: ["Smart charging", "Mobile app control", "Energy monitoring", "Safe and reliable"]
    },
    {
      icon: Building2,
      name: "AC Public Chargers",
      power: "7.4 kW - 22 kW",
      description: "Ideal for workplaces, malls, and commercial spaces",
      features: ["Multiple connectors", "Payment integration", "Real-time monitoring", "High utilization"]
    },
    {
      icon: Zap,
      name: "DC Fast Charger 30kW",
      power: "30 kW",
      description: "Rapid charging for highway and public locations",
      features: ["Fast charging", "Universal compatibility", "24/7 operation", "Remote diagnostics"]
    },
    {
      icon: Rocket,
      name: "DC Fast Charger 60kW",
      power: "60 kW",
      description: "Ultra-fast charging for high-traffic areas",
      features: ["Ultra-fast charging", "Multiple vehicles", "Premium locations", "Maximum revenue"]
    }
  ];

  const deploymentModels = [
    {
      title: "CAPEX Model",
      description: "Own the charging infrastructure and earn full revenue",
      benefits: [
        "Complete ownership",
        "Full revenue retention",
        "Asset on balance sheet",
        "Maximum long-term returns"
      ]
    },
    {
      title: "OPEX Model",
      description: "Zero investment, revenue sharing partnership",
      benefits: [
        "Zero upfront investment",
        "Revenue sharing",
        "No maintenance costs",
        "Risk-free partnership"
      ]
    }
  ];

  const whyPartner = [
    { icon: Shield, title: "Proven Track Record", description: "Successful deployments from Guwahati to Shillong, across Assam and Meghalaya" },
    { icon: TrendingUp, title: "High ROI", description: "Industry-leading returns on investment" },
    { icon: Zap, title: "24/7 Support", description: "Comprehensive maintenance and monitoring" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background"></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive EV charging solutions designed for Northeast India's unique landscape - from residential 
            to ultra-fast highway charging across the Seven Sisters
          </p>
        </div>

        {/* Charger Types */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Charger Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chargerTypes.map((charger, index) => {
              const Icon = charger.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 hover:scale-105 hover:glow-effect transition-all duration-300 group cursor-pointer glass-card"
                >
                  <Icon className="w-12 h-12 text-primary mb-4 group-hover:animate-glow" />
                  <h3 className="text-xl font-bold mb-2">{charger.name}</h3>
                  <div className="text-primary font-semibold mb-3">{charger.power}</div>
                  <p className="text-sm text-muted-foreground mb-4">{charger.description}</p>
                  <ul className="space-y-2">
                    {charger.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        <GradientDivider />

        {/* Deployment Models */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Deployment Models</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {deploymentModels.map((model, index) => (
              <Card key={index} className="p-8 hover:glow-effect transition-all duration-300 glass-card">
                <h3 className="text-2xl font-bold mb-4 text-primary">{model.title}</h3>
                <p className="text-muted-foreground mb-6">{model.description}</p>
                <ul className="space-y-3">
                  {model.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Partner */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner with Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {whyPartner.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-6 text-center hover:scale-105 transition-all duration-300 glass-card">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <GradientDivider />

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" asChild className="glow-effect">
            <Link to="/partner">Become Our Partner</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Services;
