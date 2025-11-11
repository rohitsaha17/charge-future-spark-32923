import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Zap, Clock, Battery } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChargingStationsMap from "@/components/ChargingStationsMap";

const FindCharger = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStations(data);
      }
      setLoading(false);
    };

    fetchStations();
  }, []);

  const stats = [
    { icon: MapPin, label: "Total Stations", value: stations.length.toString() },
    { icon: Zap, label: "Total Chargers", value: stations.reduce((sum, s) => sum + (s.total_chargers || 0), 0).toString() },
    { icon: Battery, label: "Available Now", value: stations.reduce((sum, s) => sum + (s.available_chargers || 0), 0).toString() },
    { icon: Clock, label: "In Use", value: stations.reduce((sum, s) => sum + ((s.total_chargers || 0) - (s.available_chargers || 0)), 0).toString() }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      <div className="absolute inset-0" style={{ background: 'var(--gradient-radial)', opacity: 0.2 }}></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Find a Charger
          </h1>
          <p className="text-xl text-muted-foreground">
            Locate our charging stations across Northeast India
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 text-center hover:glow-effect transition-all duration-300 glass-card">
                <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Station List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Stations</h2>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : stations.length === 0 ? (
              <div className="text-center text-muted-foreground">No stations available</div>
            ) : (
              stations.map((station) => (
                <Card 
                  key={station.id}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:glow-effect glass-card ${
                    selectedStation === station.id ? 'border-primary glow-effect' : ''
                  }`}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <h3 className="font-semibold mb-2">{station.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {station.city}, {station.state}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{station.charger_type} - {station.connector_type}</span>
                      <span className={`px-2 py-1 rounded ${
                        station.available_chargers > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {station.available_chargers > 0 ? 'Available' : 'In Use'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {station.power_output} • {station.available_chargers}/{station.total_chargers} available
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <ChargingStationsMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindCharger;
