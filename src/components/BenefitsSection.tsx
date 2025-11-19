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
  return <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50"></div>
      <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.05) 0%, transparent 50%)'
    }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Electric Charging Device?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of transportation with A Plus Charge's cutting-edge EV charging solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return <div key={index} className="group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 animate-scale-in overflow-hidden" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-transparent"></div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.color} p-0.5 shadow-lg group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}>
                    <div className="w-full h-full bg-background/95 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="relative text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
              </div>;
        })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{
        animationDelay: '0.6s'
      }}>
          <p className="text-muted-foreground mb-6">
            Join thousands of satisfied EV users across Northeast India
          </p>
          <div className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-300 cursor-pointer group">
            <span>Explore Our Network</span>
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>;
};
export default BenefitsSection;