import { useEffect, useState, useRef } from "react";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { MapPin, Zap, Clock, Battery, Filter, Search, Navigation, LocateFixed, Loader2 } from "lucide-react";
import ChargingStationsMap from "@/components/ChargingStationsMap";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const FindCharger = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "AC" | "DC">("all");
  const [filterStationType, setFilterStationType] = useState<"all" | "Public" | "Residential">("all");
  const stationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('charging_stations')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (!error && data) setStations(data);
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.state.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || station.charger_type === filterType;
    const matchesStationType = filterStationType === "all" || station.station_type === filterStationType;
    
    return matchesSearch && matchesType && matchesStationType;
  });

  const totalStations = filteredStations.length;
  const liveChargers = filteredStations.reduce((sum, s) => sum + (s.total_chargers || 0), 0);
  const availableNow = filteredStations.reduce((sum, s) => sum + (s.available_chargers || 0), 0);
  const inUse = Math.max(liveChargers - availableNow, 0);

  const stats = [
    { icon: MapPin, label: "Total Stations", value: String(totalStations), color: "from-blue-400 to-cyan-500" },
    { icon: Zap, label: "Live Chargers", value: String(liveChargers), color: "from-violet-400 to-purple-500" },
    { icon: Battery, label: "Available Now", value: String(availableNow), color: "from-emerald-400 to-teal-500" },
    { icon: Clock, label: "In Use", value: String(inUse), color: "from-orange-400 to-red-500" }
  ];

  // Handle station selection from map
  const handleMapStationSelect = (stationId: string) => {
    setSelectedStation(stationId);
    // Scroll to the selected station card
    const element = stationRefs.current[stationId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNavigate = (lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <SEOHead
        title="Find EV Charging Stations Near You"
        description="Locate A Plus Charge EV charging stations across Northeast India. Real-time availability, AC & DC chargers, navigation to nearest station."
        path="/find-charger"
        keywords="EV charging station near me, find EV charger Northeast India, Guwahati charging station, Shillong EV charger"
      />
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(220_15%_97%)] to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(216_83%_56%_/_0.08),_transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Live Network Map</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Find Your <span className="text-foreground">Charger</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Locate our charging stations across Northeast India with real-time availability
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="group relative p-6 text-center hover:scale-105 transition-all duration-300 border-content-highlight-border bg-gradient-to-br from-content-highlight via-background to-content-highlight/50 hover:shadow-glow overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`}></div>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-content-highlight rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="relative text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
                <div className="relative text-sm text-foreground/70">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 border-content-highlight-border bg-content-highlight/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <Input
                placeholder="Search by name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/80 border-content-highlight-border"
              />
            </div>
            
            {/* Charger Type Filter */}
            <div className="flex gap-2">
              <Badge 
                variant={filterType === "all" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("all")}
              >
                All Types
              </Badge>
              <Badge 
                variant={filterType === "AC" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("AC")}
              >
                AC Only
              </Badge>
              <Badge 
                variant={filterType === "DC" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterType("DC")}
              >
                DC Fast
              </Badge>
            </div>
            
            {/* Station Type Filter */}
            <div className="flex gap-2">
              <Badge 
                variant={filterStationType === "all" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterStationType("all")}
              >
                All Stations
              </Badge>
              <Badge 
                variant={filterStationType === "Public" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterStationType("Public")}
              >
                Public
              </Badge>
              <Badge 
                variant={filterStationType === "Residential" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setFilterStationType("Residential")}
              >
                Residential
              </Badge>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Station List */}
          <div className="lg:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <h2 className="text-2xl font-bold">
                {filteredStations.length} Station{filteredStations.length !== 1 ? 's' : ''}
              </h2>
              <Filter className="w-5 h-5 text-primary" />
            </div>
            
            {filteredStations.length === 0 ? (
              <Card className="p-8 text-center border-content-highlight-border bg-content-highlight/30">
                <MapPin className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/70">No stations match your filters</p>
              </Card>
            ) : (
              filteredStations.map((station) => {
                const isDC = station.charger_type === 'DC';
                const isResidential = station.station_type === 'Residential';
                const isSelected = selectedStation === station.id;
                
                return (
                  <Card 
                    key={station.id}
                    ref={(el) => { stationRefs.current[station.id] = el; }}
                    className={`group p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] border-content-highlight-border bg-gradient-to-br from-content-highlight via-background to-content-highlight/50 ${
                      isSelected 
                        ? 'ring-2 ring-primary shadow-glow scale-[1.02] bg-gradient-to-br from-primary/10 via-background to-primary/5' 
                        : 'hover:shadow-elegant'
                    }`}
                    onClick={() => setSelectedStation(station.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-bold text-lg transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                        {station.name}
                      </h3>
                      <Badge 
                        variant={isDC ? "default" : "secondary"}
                        className={`${isDC ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-primary'} text-white`}
                      >
                        {isDC ? 'DC' : 'AC'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-foreground/70 mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                      <span>{station.city}, {station.district}, {station.state}</span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/80 font-medium">{station.power_output}</span>
                        <Badge variant="outline" className={isResidential ? 'border-amber-500 text-amber-700' : ''}>
                          {isResidential ? '🏠 Residential' : '🌐 Public'}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-foreground/60">
                        <span>{station.connector_type} Connector</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-content-highlight-border">
                      <span className="text-xs text-foreground/60">Availability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-semibold text-emerald-600">
                          {station.available_chargers}/{station.total_chargers} Available
                        </span>
                      </div>
                    </div>

                    {/* Get Directions Button - Show when selected */}
                    {isSelected && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(station.latitude, station.longitude);
                        }}
                        className="w-full mt-4"
                        size="sm"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-2 border-content-highlight-border bg-content-highlight/30 shadow-elegant">
              <ChargingStationsMap 
                onStationSelect={handleMapStationSelect}
                selectedStationId={selectedStation}
              />
            </Card>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--content-highlight));
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
};

export default FindCharger;
