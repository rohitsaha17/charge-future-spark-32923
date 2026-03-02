import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import LocationPickerMap from "@/components/LocationPickerMap";
import EnhancedPageHeader from "@/components/EnhancedPageHeader";
import { Play, MapPin, Sparkles } from "lucide-react";
import PartnerVideo from "@/components/PartnerVideo";
import trustBg from "@/assets/trust-bg.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Clock, Zap, Shield, Headphones, TrendingDown, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Charger data matching Services page pricing
const chargerDataConfig: Record<string, { investment: number; units: { low: number; base: number; aggressive: number }; platformFee: number; defaultTariff: number; type: string; displayName: string }> = {
  "l1-3.3kw": { 
    investment: 15000, 
    units: { low: 100, base: 200, aggressive: 350 }, 
    platformFee: 1.5,
    defaultTariff: 10,
    type: "AC",
    displayName: "L1 - 3.3 kW Plug Point"
  },
  "l2-7.4kw": { 
    investment: 60000, 
    units: { low: 250, base: 500, aggressive: 800 }, 
    platformFee: 1.5,
    defaultTariff: 10,
    type: "AC",
    displayName: "L2 - 7.4 kW AC Charger"
  },
  "l2-9.9kw": { 
    investment: 55000, 
    units: { low: 300, base: 600, aggressive: 900 }, 
    platformFee: 1.5,
    defaultTariff: 10,
    type: "AC",
    displayName: "L2 - 9.9 kW (3 Plug Points)"
  },
  "l3-30kw": { 
    investment: 549800, 
    units: { low: 3000, base: 6000, aggressive: 9000 }, 
    platformFee: 3.0,
    defaultTariff: 22,
    type: "DC",
    displayName: "L3 - 30 kW DC Fast Charger"
  },
  "l3-60kw": { 
    investment: 797500, 
    units: { low: 6000, base: 12000, aggressive: 18000 }, 
    platformFee: 3.0,
    defaultTariff: 22,
    type: "DC",
    displayName: "L3 - 60 kW DC Fast Charger"
  }
};

const Partner = () => {
  const [searchParams] = useSearchParams();
  const [chargerType, setChargerType] = useState("l2-7.4kw");
  const [utilization, setUtilization] = useState("base");
  const [tariff, setTariff] = useState([10]);
  const [electricityCost, setElectricityCost] = useState("");

  // Handle URL parameters from Services page
  useEffect(() => {
    const chargerParam = searchParams.get('charger');
    const investmentParam = searchParams.get('investment');
    
    if (chargerParam) {
      // Find matching charger by name or investment
      const matchedKey = Object.entries(chargerDataConfig).find(([key, data]) => {
        if (investmentParam && data.investment === parseInt(investmentParam)) {
          return true;
        }
        return data.displayName.toLowerCase().includes(chargerParam.toLowerCase().substring(0, 10));
      });
      
      if (matchedKey) {
        setChargerType(matchedKey[0]);
        setTariff([chargerDataConfig[matchedKey[0]].defaultTariff]);
        toast.success(`${chargerDataConfig[matchedKey[0]].displayName} selected for ROI calculation`);
      }
    }
  }, [searchParams]);

  const calculateROI = () => {
    if (!electricityCost) {
      toast.error("Please enter electricity cost");
      return null;
    }

    const data = chargerDataConfig[chargerType];
    const units = data.units[utilization as keyof typeof data.units];
    const grossRevenue = units * tariff[0];
    const electricityExpense = units * parseFloat(electricityCost);
    const platformFees = units * data.platformFee;
    const netRevenue = grossRevenue - electricityExpense - platformFees;
    const roi = (netRevenue / data.investment) * 100;
    const payback = data.investment / netRevenue;

    return {
      chargerType,
      utilization,
      tariff: tariff[0],
      electricityCost: parseFloat(electricityCost),
      investment: data.investment,
      units,
      grossRevenue,
      electricityExpense,
      platformFees,
      netRevenue,
      roi,
      payback
    };
  };

  const [result, setResult] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  const handleCalculate = () => {
    const calc = calculateROI();
    if (calc) {
      setResult(calc);
      toast.success("ROI calculated successfully!");
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address });
    toast.success("Location marked on map!");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error("Please mark your location on the map");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const chargerTypeForm = formData.get('siteType') as string;
    const message = `Power Load: ${formData.get('powerLoad')}kW, Ownership Model: ${formData.get('ownershipModel')}, Pin Code: ${formData.get('pincode')}, Address: ${formData.get('address')}`;

    try {
      const { error } = await supabase
        .from('partner_enquiries')
        .insert({
          name,
          phone,
          email,
          charger_type: chargerTypeForm,
          message,
          location_lat: selectedLocation.lat,
          location_lng: selectedLocation.lng,
          location_address: selectedLocation.address || null,
        });

      if (error) throw error;
      
      toast.success("Thank you! Your partnership enquiry has been submitted successfully. We'll contact you within 24 hours.");
      (e.target as HTMLFormElement).reset();
      setSelectedLocation(null);
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
      {/* Enhanced Hero Section */}
      <EnhancedPageHeader
        title="Grow With"
        titleHighlight="Us"
        subtitle="Partnership Opportunities"
        description="Join India's fastest-growing EV charging network. Calculate your ROI and start your partnership journey."
        icon={<Sparkles className="w-4 h-4" />}
        badges={[
          { icon: <TrendingUp className="w-4 h-4" />, text: "15-20% Expected ROI" },
          { icon: <Award className="w-4 h-4" />, text: "₹0 Partnership Fee" },
        ]}
        theme="mesh"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Explanatory Video Section */}
        <div className="mb-20">
          <Card className="p-8 glass-card max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">How Partnership Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch this video to understand everything about our partnership model, benefits, and how you can get started
              </p>
            </div>
            
            <PartnerVideo />
            
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-primary mb-2">₹0</div>
                <p className="text-sm text-muted-foreground">Upfront Partnership Fee</p>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Technical Support</p>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-primary mb-2">15-20%</div>
                <p className="text-sm text-muted-foreground">Expected ROI</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ROI Calculator */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">ROI Calculator</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <Card className="p-8 glass-card">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-primary" />
                Calculate Your Returns
              </h3>

              <div className="space-y-6">
                <div>
                  <Label>Type of Charger</Label>
                  <Select 
                    value={chargerType} 
                    onValueChange={(value) => {
                      setChargerType(value);
                      const selectedCharger = chargerDataConfig[value];
                      setTariff([selectedCharger.defaultTariff]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(chargerDataConfig).map(([key, data]) => (
                        <SelectItem key={key} value={key}>
                          {data.displayName} (₹{data.investment.toLocaleString('en-IN')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {chargerDataConfig[chargerType].type === "DC" 
                      ? "DC chargers automatically use ₹22/kWh tariff" 
                      : "AC chargers automatically use ₹10/kWh tariff"}
                  </p>
                </div>

                <div>
                  <Label>Utilization Scenario</Label>
                  <Select value={utilization} onValueChange={setUtilization}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Utilization</SelectItem>
                      <SelectItem value="base">Base Case</SelectItem>
                      <SelectItem value="aggressive">Aggressive Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Charging Tariff (₹ per kWh): ₹{tariff[0]}</Label>
                  <Slider
                    value={tariff}
                    onValueChange={setTariff}
                    min={chargerDataConfig[chargerType].type === "DC" ? 18 : 8}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: ₹{chargerDataConfig[chargerType].defaultTariff}/kWh (Adjustable based on market conditions)
                  </p>
                </div>

                <div>
                  <Label>Electricity Cost (₹ per kWh)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={electricityCost}
                    onChange={(e) => setElectricityCost(e.target.value)}
                    placeholder="Enter electricity cost"
                  />
                </div>

                <div className="pt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Investment Cost: ₹{chargerDataConfig[chargerType].investment.toLocaleString('en-IN')}
                  </div>
                  <Button onClick={handleCalculate} className="w-full glow-effect">
                    Calculate ROI
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results or Benefits */}
            {result ? (
              <Card className="p-8 glass-card">
                <h3 className="text-xl font-semibold mb-6 text-primary">Your ROI Results</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">Units Sold/Month</span>
                    <span className="font-semibold">{result.units} kWh</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">Gross Revenue</span>
                    <span className="font-semibold text-primary">₹{result.grossRevenue.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">Electricity Expense</span>
                    <span className="font-semibold text-destructive">-₹{result.electricityExpense.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">Platform Fees</span>
                    <span className="font-semibold text-destructive">-₹{result.platformFees.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b-2 border-primary pt-2">
                    <span className="font-semibold text-lg">Net Revenue/Month</span>
                    <span className="font-bold text-primary text-2xl">₹{result.netRevenue.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20">
                      <TrendingUp className="w-10 h-10 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-primary mb-1">{result.roi.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Monthly ROI</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20">
                      <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-primary mb-1">{result.payback.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Months Payback</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Annual Revenue: <span className="font-bold text-foreground">₹{(result.netRevenue * 12).toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 glass-card">
                <h3 className="text-xl font-semibold mb-6">Why Partner With Us?</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Proven Technology</h4>
                      <p className="text-sm text-muted-foreground">
                        Industry-leading chargers with 98%+ uptime guarantee and real-time monitoring
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Complete Support</h4>
                      <p className="text-sm text-muted-foreground">
                        24/7 technical support and comprehensive O&M services
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Local Expertise</h4>
                      <p className="text-sm text-muted-foreground">
                        Regional team with deep understanding of Northeast India
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">High ROI</h4>
                      <p className="text-sm text-muted-foreground">
                        Industry-leading returns with transparent platform fee model
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <GradientDivider />

        {/* Partnership Enquiry Form */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">Partnership Enquiry</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Fill out the form below and our team will get back to you within 24 hours
          </p>

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input name="name" required placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input name="phone" required type="tel" placeholder="Your phone number" />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input name="email" required type="email" placeholder="your@email.com" />
                  </div>
                </div>
              </Card>

              {/* Site Details */}
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Site Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Site Type</Label>
                    <Select name="siteType">
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial Complex</SelectItem>
                        <SelectItem value="hotel">Hotel / Restaurant</SelectItem>
                        <SelectItem value="fuel-station">Fuel Station</SelectItem>
                        <SelectItem value="highway">Highway Location</SelectItem>
                        <SelectItem value="parking">Parking Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Available Power Load (kW)</Label>
                    <Input name="powerLoad" type="number" placeholder="e.g., 30" />
                  </div>
                  <div>
                    <Label>Ownership Model</Label>
                    <Select name="ownershipModel">
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capex">CAPEX (You own the charger)</SelectItem>
                        <SelectItem value="opex">OPEX (We install, you earn)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Location Section */}
            <Card className="p-6 glass-card mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Site Location
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on the map to mark your proposed charging station location
              </p>
              <div className="h-[400px] rounded-lg overflow-hidden mb-4">
                <LocationPickerMap onLocationSelect={handleLocationSelect} />
              </div>
              {selectedLocation && (
                <p className="text-sm text-primary">
                  ✓ Location marked: {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Pin Code</Label>
                  <Input name="pincode" placeholder="Enter pin code" />
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Input name="address" placeholder="Street address" />
                </div>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Button type="submit" size="lg" className="glow-effect px-12" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Enquiry"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <StorytellingSection 
        title="Building Northeast India's EV Future Together"
        description="Partner with us to be part of the electric revolution. From installation to maintenance, we've got you covered."
        backgroundImage={trustBg}
      />
    </div>
  );
};

export default Partner;
