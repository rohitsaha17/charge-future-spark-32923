import { useState } from "react";
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import LocationPickerMap from "@/components/LocationPickerMap";
import { Play, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Clock, Zap, Shield, Headphones, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Partner = () => {
  const [chargerType, setChargerType] = useState("residential-3.3kw");
  const [utilization, setUtilization] = useState("base");
  const [tariff, setTariff] = useState([10]);
  const [electricityCost, setElectricityCost] = useState("");

  const chargerData: Record<string, any> = {
    "residential-3.3kw": { 
      investment: 40000, 
      units: { low: 150, base: 300, aggressive: 500 }, 
      platformFee: 1.5,
      defaultTariff: 10,
      type: "AC"
    },
    "residential-7.4kw": { 
      investment: 65000, 
      units: { low: 250, base: 500, aggressive: 800 }, 
      platformFee: 1.5,
      defaultTariff: 10,
      type: "AC"
    },
    "ac-public": { 
      investment: 150000, 
      units: { low: 800, base: 1600, aggressive: 2400 }, 
      platformFee: 1.5,
      defaultTariff: 10,
      type: "AC"
    },
    "dc-30kw": { 
      investment: 800000, 
      units: { low: 3000, base: 6000, aggressive: 9000 }, 
      platformFee: 3.0,
      defaultTariff: 22,
      type: "DC"
    },
    "dc-60kw": { 
      investment: 1500000, 
      units: { low: 6000, base: 12000, aggressive: 18000 }, 
      platformFee: 3.0,
      defaultTariff: 22,
      type: "DC"
    },
    "dc-120kw": { 
      investment: 2500000, 
      units: { low: 10000, base: 20000, aggressive: 30000 }, 
      platformFee: 3.0,
      defaultTariff: 22,
      type: "DC"
    }
  };

  const calculateROI = () => {
    if (!electricityCost) {
      toast.error("Please enter electricity cost");
      return null;
    }

    const data = chargerData[chargerType];
    const units = data.units[utilization];
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
    const chargerType = formData.get('siteType') as string;
    const message = `Power Load: ${formData.get('powerLoad')}kW, Ownership Model: ${formData.get('ownershipModel')}, Pin Code: ${formData.get('pincode')}, Address: ${formData.get('address')}`;

    try {
      const { error } = await supabase
        .from('partner_enquiries')
        .insert({
          name,
          phone,
          email,
          charger_type: chargerType,
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
      console.error('Error submitting enquiry:', error);
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      <div className="absolute inset-0" style={{ background: 'var(--gradient-radial)', opacity: 0.2 }}></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Partnership Opportunities</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Grow With <span className="text-foreground">Us</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join India's fastest-growing EV charging network. Calculate your ROI and start your partnership journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-2xl font-bold text-primary">15-20%</span>
              <span className="text-sm text-muted-foreground ml-2">Expected ROI</span>
            </div>
            <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-2xl font-bold text-primary">₹0</span>
              <span className="text-sm text-muted-foreground ml-2">Partnership Fee</span>
            </div>
          </div>
        </div>

        {/* Explanatory Video Section */}
        <div className="mb-20">
          <Card className="p-8 glass-card max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">How Partnership Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch this video to understand everything about our partnership model, benefits, and how you can get started
              </p>
            </div>
            
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster="/intro-video-poster.jpg"
              >
                <source src="/intro-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Optional: Custom play button overlay - only shown before video starts */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            </div>
            
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
                      // Automatically set tariff based on charger type
                      const selectedCharger = chargerData[value];
                      setTariff([selectedCharger.defaultTariff]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential-3.3kw">Residential 3.3 kW</SelectItem>
                      <SelectItem value="residential-7.4kw">Residential 7.4 kW</SelectItem>
                      <SelectItem value="ac-public">AC Public (7.4-22 kW)</SelectItem>
                      <SelectItem value="dc-30kw">DC Fast 30 kW</SelectItem>
                      <SelectItem value="dc-60kw">DC Fast 60 kW</SelectItem>
                      <SelectItem value="dc-120kw">DC Fast 120 kW</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {chargerData[chargerType].type === "DC" 
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
                    min={chargerData[chargerType].type === "DC" ? 18 : 8}
                    max={chargerData[chargerType].type === "DC" ? 26 : 15}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: ₹{chargerData[chargerType].defaultTariff}/kWh (Adjustable based on market conditions)
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
                    Investment Cost: ₹{chargerData[chargerType].investment.toLocaleString('en-IN')}
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
                        End-to-end installation, maintenance, and 24/7 technical support included
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Guaranteed Returns</h4>
                      <p className="text-sm text-muted-foreground">
                        Transparent revenue sharing with monthly payouts and detailed analytics
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Marketing & Branding</h4>
                      <p className="text-sm text-muted-foreground">
                        Your location featured on our app, maps, and marketing materials at no extra cost
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <p className="text-center text-sm text-muted-foreground mb-2">
                      Average Partner Earnings
                    </p>
                    <p className="text-center text-3xl font-bold text-primary mb-1">
                      ₹25,000 - ₹1,50,000
                    </p>
                    <p className="text-center text-xs text-muted-foreground">
                      per month (based on charger type and utilization)
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <GradientDivider />

        <StorytellingSection 
          title="Your Success Is Our Mission"
          description="Join Northeast India's fastest-growing charging network. Together, we'll power the future of clean mobility while creating sustainable income for you. Let's build something extraordinary."
        />

        <GradientDivider />

        {/* Enquiry Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 glass-card">
            <h2 className="text-2xl font-bold mb-2">Partner Enquiry Form</h2>
            <p className="text-muted-foreground mb-6">Fill in your details and we'll get back to you within 24 hours</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name"
                      name="name"
                      required 
                      placeholder="Your full name" 
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      required 
                      type="tel" 
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      name="email"
                      required 
                      type="email" 
                      placeholder="your@email.com"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Site Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Site Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pin Code *</Label>
                    <Input 
                      id="pincode"
                      name="pincode"
                      required 
                      placeholder="Enter 6-digit pin code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Input 
                      id="address"
                      name="address"
                      required 
                      placeholder="Street, Area, City"
                      maxLength={200}
                    />
                  </div>
                </div>
                
                {/* Interactive Location Map */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Mark Your Exact Location on Map *
                  </Label>
                  <LocationPickerMap 
                    onLocationSelect={handleLocationSelect}
                    initialLat={26.1445}
                    initialLng={91.7362}
                  />
                  {selectedLocation && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Selected Location:</p>
                      <p className="text-xs text-foreground/70">
                        Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
                      </p>
                      {selectedLocation.address && (
                        <p className="text-xs text-foreground/60 mt-1">
                          {selectedLocation.address}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Site Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Site Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteType">Type of Site *</Label>
                    <Select name="siteType" required>
                      <SelectTrigger id="siteType">
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highway">Highway</SelectItem>
                        <SelectItem value="office">Office Complex</SelectItem>
                        <SelectItem value="mall">Shopping Mall</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                        <SelectItem value="residential">Residential Society</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="powerLoad">Available Power Load (kW) *</Label>
                    <Input 
                      id="powerLoad"
                      name="powerLoad"
                      required
                      type="number" 
                      placeholder="e.g., 50"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Ownership Model */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Partnership Model</h3>
                <div>
                  <Label htmlFor="ownershipModel">Ownership Model *</Label>
                  <Select name="ownershipModel" required>
                    <SelectTrigger id="ownershipModel">
                      <SelectValue placeholder="Select ownership model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capex">
                        <div className="py-1">
                          <div className="font-semibold">CAPEX (Own Infrastructure)</div>
                          <div className="text-xs text-muted-foreground">You invest in chargers, we manage operations</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="opex">
                        <div className="py-1">
                          <div className="font-semibold">OPEX (Revenue Sharing)</div>
                          <div className="text-xs text-muted-foreground">We invest, you provide space & power</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full glow-effect" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Partnership Enquiry"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Partner;
