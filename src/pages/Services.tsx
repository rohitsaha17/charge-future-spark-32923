import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import EnhancedPageHeader from "@/components/EnhancedPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Building2, Zap, Rocket, Shield, TrendingUp, CheckCircle, Users, Plug, CreditCard, Clock, BarChart3, Wrench, Phone, ArrowRight, IndianRupee, Award, Calculator, Table, LayoutGrid, FileText } from "lucide-react";
import chargingStationLaunch from "@/assets/charging-station-launch.jpg";
import l1PlugPoint from "@/assets/chargers/l1-plug-point.jpg";
import dcFastCharger from "@/assets/chargers/dc-fast-charger.jpg";
import l2AcCharger from "@/assets/chargers/l2-ac-charger.jpg";
import evChargerStation from "@/assets/chargers/ev-charger-station.jpg";
import northeastHillsLandscape from "@/assets/northeast-hills-landscape.jpg";
import ChargerComparisonTable from "@/components/ChargerComparisonTable";

const Services = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  const chargerTypes = [
    {
      image: l1PlugPoint,
      name: "L1 - 3.3 kW Plug Point",
      type: "Universal",
      power: "3.3 kW AC",
      powerValue: 3.3,
      price: "₹15,000",
      priceValue: 15000,
      warranty: "1-year warranty included",
      warrantyYears: 1,
      description: "Perfect for home charging with overnight convenience",
      features: ["Smart charging", "Mobile app control", "Energy monitoring", "Safe and reliable"],
      ideal: "Residential, Apartments"
    },
    {
      image: l2AcCharger,
      name: "L2 - 7.4 kW AC Charger",
      type: "EV 4 Wheelers - Blind",
      power: "7.4 kW AC",
      powerValue: 7.4,
      price: "₹60,000",
      priceValue: 60000,
      warranty: "1 yr. warranty & 2 yr. AMC included",
      warrantyYears: 3,
      description: "Ideal for workplaces and commercial spaces",
      features: ["RFID enabled", "Payment integration", "Real-time monitoring", "High utilization"],
      ideal: "Offices, Hotels, Malls"
    },
    {
      image: l2AcCharger,
      name: "L2 - 9.9 kW (3 Plug Points)",
      type: "Universal - Multi-Point",
      power: "9.9 kW AC",
      powerValue: 9.9,
      price: "₹55,000",
      priceValue: 55000,
      warranty: "1 yr. warranty & 2 yr. AMC included",
      warrantyYears: 3,
      description: "Multi-point charging for high traffic areas",
      features: ["3 plug points", "Universal compatibility", "LED indicators", "Remote diagnostics"],
      ideal: "Parking Lots, Institutions"
    },
    {
      image: dcFastCharger,
      name: "L3 - 30 kW DC Fast Charger",
      type: "4 Wheeler DC",
      power: "30 kW DC",
      powerValue: 30,
      price: "₹5,49,800",
      priceValue: 549800,
      warranty: "1 yr. warranty & 2 yr. AMC included",
      warrantyYears: 3,
      description: "Rapid charging for highway and public locations",
      features: ["Fast charging", "CCS2/CHAdeMO", "24/7 operation", "RFID enabled"],
      ideal: "Highways, Fuel Stations"
    },
    {
      image: evChargerStation,
      name: "L3 - 60 kW DC Fast Charger",
      type: "4 Wheeler DC",
      power: "60 kW DC",
      powerValue: 60,
      price: "₹7,97,500",
      priceValue: 797500,
      warranty: "1 yr. warranty & 2 yr. AMC included",
      warrantyYears: 3,
      description: "Ultra-fast charging for high-traffic areas",
      features: ["Ultra-fast charging", "Multiple vehicles", "Premium locations", "Maximum revenue"],
      ideal: "Highway Hubs, Commercial Centers"
    }
  ];

  const handleCalculateROI = (charger: typeof chargerTypes[0]) => {
    navigate(`/partner?charger=${encodeURIComponent(charger.name)}&investment=${charger.priceValue}`);
  };
  const partnerModel = {
    title: "Partner-Owner Model",
    features: [
      { label: "Upfront Investment", value: "100% by Partner" },
      { label: "Ownership", value: "Partner retains ownership" },
      { label: "Revenue Model", value: "100% to Partner (excl. platform fee)" },
      { label: "Maintenance & Uptime", value: "Optional AMC with A+ Charge" },
      { label: "Charger Installation", value: "Handled by A+ Charge" },
      { label: "Operations & Monitoring", value: "Provided by A+ Charge (with AMC)" },
      { label: "Platform Fee", value: "₹3 / kW" },
      { label: "App & Digital Integration", value: "APLUS App + Dashboard access" }
    ],
    idealFor: "ROI-focused builders, hotels, and institutions"
  };

  const paymentTerms = [
    { icon: BarChart3, title: "Monthly Revenue Report", description: "Revenue share bill generated and shared at the end of each month with detailed consumption, earnings, and platform fees" },
    { icon: Clock, title: "Timely Payment Settlement", description: "Partner payments settled before the 7th of the following month, ensuring predictable payouts" },
    { icon: CreditCard, title: "Real-Time Revenue Tracking", description: "Dashboard access via APLUS App to monitor revenue, usage, and payment status in real time" },
    { icon: Zap, title: "Energy Consumption Monitoring", description: "Optional sub-meter installation allows partners to independently track charger-specific energy consumption" }
  ];

  const whyPartner = [
    { icon: Shield, title: "Proven Track Record", description: "Successful deployments from Guwahati to Shillong, across Assam and Meghalaya" },
    { icon: TrendingUp, title: "High ROI", description: "Industry-leading returns with transparent platform fee model" },
    { icon: Wrench, title: "Complete Support", description: "Installation, maintenance, and 24/7 monitoring included" },
    { icon: Phone, title: "Local Expertise", description: "Regional team with deep understanding of Northeast India" },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Enhanced Hero Section */}
      <EnhancedPageHeader
        title="EV Charger"
        titleHighlight="Price List"
        subtitle="Complete Charging Solutions"
        description="Premium EV charging hardware with comprehensive warranty and AMC packages. Built for Northeast India's unique requirements."
        backgroundImage={chargingStationLaunch}
        icon={<Zap className="w-4 h-4" />}
        badges={[
          { text: "3.3kW - 60kW Range" },
          { text: "GST Inclusive Pricing" },
          { text: "Connectivity Enabled" },
        ]}
        theme="gradient"
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* Price List - Chargers */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              Our Product Range
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Charger Price List</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              All prices include 5% GST. Infrastructure costs vary by site and will be assessed separately.
            </p>
            
            {/* View Toggle */}
            <div className="flex justify-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Grid View
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <Table className="w-4 h-4" />
                Compare
              </Button>
            </div>
          </div>

          {viewMode === "table" ? (
            <ChargerComparisonTable chargers={chargerTypes} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chargerTypes.map((charger, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group glass-card"
                >
                  {/* Charger Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    <img 
                      src={charger.image} 
                      alt={charger.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                      {charger.power}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold leading-tight">{charger.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{charger.type}</p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-2xl font-bold text-primary">{charger.price}</div>
                      <span className="text-xs text-muted-foreground">(incl. GST)</span>
                    </div>
                    
                    {/* Warranty Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg mb-4">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">{charger.warranty}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{charger.description}</p>
                    
                    {/* Ideal For */}
                    <div className="text-xs text-muted-foreground mb-3">
                      <span className="font-semibold">Ideal for:</span> {charger.ideal}
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-1.5 mb-4">
                      {charger.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center">
                          <CheckCircle className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCalculateROI(charger)}
                        variant="outline"
                        className="flex-1 gap-2 hover:bg-primary hover:text-white transition-colors"
                      >
                        <Calculator className="w-4 h-4" />
                        Calculate ROI
                      </Button>
                      <Button
                        onClick={() => window.location.href = `/partner?charger=${encodeURIComponent(charger.name)}&quote=true`}
                        variant="default"
                        className="flex-1 gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Get Quote
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Note */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Costs mentioned are for charger hardware only. Infrastructure costs vary by site and will be assessed separately. 
              Chargers can be wall/post mounted. Pole fabrication requirements bear extra cost. Each product is connectivity-enabled.
            </p>
          </div>
        </div>

        <GradientDivider />

        {/* Partner Revenue Model */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              Revenue Model
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Plus Charge Partner Model</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Own your charging infrastructure and earn maximum returns with our transparent partnership model
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 glass-card border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">{partnerModel.title}</h3>
                  <p className="text-sm text-muted-foreground">Ideal for: {partnerModel.idealFor}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {partnerModel.features.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <GradientDivider />

        {/* Revenue Share & Payment Terms */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              Transparent Payments
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Revenue Share & Payment Terms</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentTerms.map((term, index) => {
              const Icon = term.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 glass-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{term.title}</h3>
                  <p className="text-sm text-muted-foreground">{term.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <GradientDivider />

        {/* Why Partner */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner with Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPartner.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-6 text-center hover:scale-105 transition-all duration-300 glass-card">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

      <StorytellingSection
        title="Powering Northeast India's Electric Dreams"
        description="From the hills of Shillong to the plains of Guwahati, we're building infrastructure that doesn't just charge vehicles - it transforms communities and creates sustainable futures."
        backgroundImage={northeastHillsLandscape}
      />

      <div className="container mx-auto px-4">
        {/* CTA */}
        <div className="text-center mt-16">
          <Button size="lg" asChild className="glow-effect group">
            <Link to="/partner" className="flex items-center gap-2">
              Become Our Partner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Services;