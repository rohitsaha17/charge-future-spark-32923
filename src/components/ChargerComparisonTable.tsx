import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Calculator, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Charger {
  name: string;
  type: string;
  power: string;
  powerValue: number;
  price: string;
  priceValue: number;
  warranty: string;
  warrantyYears: number;
  ideal: string;
}

interface ChargerComparisonTableProps {
  chargers: Charger[];
}

type SortKey = "priceValue" | "powerValue" | "warrantyYears";
type SortOrder = "asc" | "desc";

const ChargerComparisonTable = ({ chargers }: ChargerComparisonTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("priceValue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [useFilter, setUseFilter] = useState<string>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Get unique types and use cases for filters
  const chargerTypes = ["all", ...new Set(chargers.map(c => c.powerValue <= 10 ? "AC" : "DC"))];
  const useCases = ["all", ...new Set(chargers.flatMap(c => c.ideal.split(", ")))];

  const filteredChargers = chargers.filter(charger => {
    const isDC = charger.powerValue > 10;
    const chargerCategory = isDC ? "DC" : "AC";
    
    if (typeFilter !== "all" && chargerCategory !== typeFilter) return false;
    if (useFilter !== "all" && !charger.ideal.includes(useFilter)) return false;
    
    return true;
  });

  const sortedChargers = [...filteredChargers].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-primary" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 glass-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="AC">AC Chargers</SelectItem>
                <SelectItem value="DC">DC Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ideal For:</span>
            <Select value={useFilter} onValueChange={setUseFilter}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Uses</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Apartments">Apartments</SelectItem>
                <SelectItem value="Offices">Offices</SelectItem>
                <SelectItem value="Hotels">Hotels</SelectItem>
                <SelectItem value="Malls">Malls</SelectItem>
                <SelectItem value="Highways">Highways</SelectItem>
                <SelectItem value="Fuel Stations">Fuel Stations</SelectItem>
                <SelectItem value="Parking Lots">Parking Lots</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(typeFilter !== "all" || useFilter !== "all") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setTypeFilter("all"); setUseFilter("all"); }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
          
          <span className="text-xs text-muted-foreground ml-auto">
            Showing {sortedChargers.length} of {chargers.length} chargers
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 to-cyan-500/10 border-b border-primary/20">
                <th className="text-left p-4 font-semibold text-sm">Charger Model</th>
                <th className="text-left p-4 font-semibold text-sm">Type</th>
                <th 
                  className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => handleSort("powerValue")}
                >
                  <div className="flex items-center">
                    Power
                    <SortIcon columnKey="powerValue" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => handleSort("priceValue")}
                >
                  <div className="flex items-center">
                    Price
                    <SortIcon columnKey="priceValue" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => handleSort("warrantyYears")}
                >
                  <div className="flex items-center">
                    Warranty
                    <SortIcon columnKey="warrantyYears" />
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-sm">Ideal For</th>
                <th className="text-center p-4 font-semibold text-sm">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sortedChargers.map((charger, index) => (
                <tr 
                  key={index}
                  className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <td className="p-4">
                    <div className="font-medium text-sm">{charger.name}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{charger.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      charger.powerValue > 10 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {charger.power}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-primary">{charger.price}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{charger.warranty}</td>
                  <td className="p-4 text-sm text-muted-foreground">{charger.ideal}</td>
                  <td className="p-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="gap-1 text-xs hover:bg-primary hover:text-white transition-colors"
                    >
                      <Link 
                        to={`/partner?charger=${encodeURIComponent(charger.name)}&investment=${charger.priceValue}`}
                      >
                        <Calculator className="w-3 h-3" />
                        Calculate
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ChargerComparisonTable;
