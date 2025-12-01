import { Leaf, TrendingDown, Zap, Shield, Clock, Sparkles, LucideIcon } from "lucide-react";
interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}
const benefits: Benefit[] = [{
  icon: Leaf,
  title: "Zero Emissions",
  description: "Reduce your carbon footprint by 100%. Every charge contributes to a cleaner, greener future for Northeast India.",
  color: "from-emerald-400 to-teal-500"
}, {
  icon: TrendingDown,
  title: "Lower Running Costs",
  description: "Save up to 70% on fuel costs compared to traditional vehicles. Electricity is cheaper and more efficient than petrol or diesel.",
  color: "from-blue-400 to-cyan-500"
}, {
  icon: Zap,
  title: "Fast Charging",
  description: "Our DC fast chargers can power your EV to 80% in just 30-45 minutes. Get back on the road quickly.",
  color: "from-violet-400 to-purple-500"
}, {
  icon: Shield,
  title: "Safe & Reliable",
  description: "Advanced safety features, certified equipment, and 24/7 monitoring ensure your vehicle and charging experience are protected.",
  color: "from-orange-400 to-red-500"
}, {
  icon: Clock,
  title: "Always Available",
  description: "Our network operates round-the-clock with real-time availability updates. Charge whenever you need, wherever you are.",
  color: "from-pink-400 to-rose-500"
}, {
  icon: Sparkles,
  title: "Smart Technology",
  description: "App-based booking, digital payments, and real-time monitoring. Modern charging for modern vehicles.",
  color: "from-amber-400 to-yellow-500"
}];
const BenefitsSection = () => {
  return <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-content-highlight to-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Why Choose Electric Charging Device?
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            Experience the future of sustainable transportation with our cutting-edge charging solutions
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          // Alternate between different blue-themed gradients
          const cardGradients = [
            "from-[#e8f4ff] via-white to-[#f0f9ff] border-[#2674EC]/20 hover:border-[#2674EC]/50",
            "from-[#f0f9ff] via-[#e8f4ff] to-white border-[#00C6FF]/20 hover:border-[#00C6FF]/50",
            "from-white via-[#e8f4ff] to-[#f0f9ff] border-primary/20 hover:border-primary/50",
            "from-[#f0f9ff] via-white to-[#e8f4ff] border-cyan-400/20 hover:border-cyan-400/50",
            "from-[#e8f4ff] via-[#f0f9ff] to-white border-blue-400/20 hover:border-blue-400/50",
            "from-white via-[#f0f9ff] to-[#e8f4ff] border-sky-400/20 hover:border-sky-400/50",
          ];
          return <div key={index} className={`group relative p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-2 bg-gradient-to-br ${cardGradients[index]} shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(38,116,236,0.3)]`} style={{
            animationDelay: `${index * 0.1}s`
          }}>
                {/* Icon Container - Enhanced with blue theme */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2674EC] to-[#00C6FF] p-0.5 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_8px_20px_-5px_rgba(38,116,236,0.4)]`}>
                  <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#2674EC]" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-[#2674EC] transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {benefit.description}
                </p>

                {/* Decorative Glow Effect - Blue themed */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2674EC]/0 via-[#00C6FF]/0 to-[#2674EC]/0 group-hover:from-[#2674EC]/5 group-hover:via-transparent group-hover:to-[#00C6FF]/5 transition-all duration-500 pointer-events-none"></div>
              </div>;
        })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-lg text-foreground/70 mb-6">Ready to make the switch to electric?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/partner" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-xl font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105">
              Become a Partner
            </a>
            <a href="/find-charger" className="px-8 py-4 bg-content-highlight border-2 border-content-highlight-border text-foreground rounded-xl font-semibold hover:bg-content-highlight/70 hover:border-primary/50 transition-all duration-300 hover:scale-105">
              Find a Charger
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default BenefitsSection;