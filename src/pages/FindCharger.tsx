import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Zap, Clock, Battery } from "lucide-react";

const FindCharger = () => {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const stations = [
    {
      id: 1,
      name: "GMDA Multi-level Parking",
      location: "Guwahati, Assam",
      lat: 26.1445,
      lng: 91.7362,
      chargers: [
        { type: "DC 30kW", status: "Available", connector: "CCS2" },
        { type: "AC 7.4kW", status: "In Use", connector: "Type 2" }
      ]
    },
    {
      id: 2,
      name: "Ather Energy Hub",
      location: "Guwahati, Assam",
      lat: 26.1584,
      lng: 91.7689,
      chargers: [
        { type: "AC 7.4kW", status: "Available", connector: "Type 2" }
      ]
    },
    {
      id: 3,
      name: "Highway Station - NH 27",
      location: "Assam",
      lat: 26.2006,
      lng: 92.9376,
      chargers: [
        { type: "DC 60kW", status: "Available", connector: "CCS2" },
        { type: "DC 30kW", status: "Available", connector: "CHAdeMO" }
      ]
    }
  ];

  const stats = [
    { icon: MapPin, label: "Total Stations", value: "25+" },
    { icon: Zap, label: "Live Chargers", value: "50+" },
    { icon: Battery, label: "Available Now", value: "42" },
    { icon: Clock, label: "In Use", value: "8" }
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
            {stations.map((station) => (
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
                  {station.location}
                </p>
                <div className="space-y-2">
                  {station.chargers.map((charger, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{charger.type} - {charger.connector}</span>
                      <span className={`px-2 py-1 rounded ${
                        charger.status === 'Available' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {charger.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden relative glass-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Map Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Live tracking and navigation will be available here
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindCharger;
