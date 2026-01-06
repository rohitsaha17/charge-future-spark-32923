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
        <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Why Choose Electric Charging Device?
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-foreground/70 max-w-3xl mx-auto">
            Experience the future of sustainable transportation with our cutting-edge charging solutions
          </p>
        </div>

        {/* Benefits Grid - 2x3 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
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
          return <div key={index} className={`group relative p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-2 bg-gradient-to-br ${cardGradients[index]} shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(38,116,236,0.3)]`} style={{
            animationDelay: `${index * 0.1}s`
          }}>
                {/* Icon Container - Enhanced with blue theme */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#2674EC] to-[#00C6FF] p-0.5 flex items-center justify-center mb-3 md:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_8px_20px_-5px_rgba(38,116,236,0.4)]`}>
                  <div className="w-full h-full bg-white rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#2674EC]" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1 md:mb-3 text-foreground group-hover:text-[#2674EC] transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-foreground/70 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 line-clamp-3 md:line-clamp-none">
                  {benefit.description}
                </p>

                {/* Decorative Glow Effect - Blue themed */}
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#2674EC]/0 via-[#00C6FF]/0 to-[#2674EC]/0 group-hover:from-[#2674EC]/5 group-hover:via-transparent group-hover:to-[#00C6FF]/5 transition-all duration-500 pointer-events-none"></div>
              </div>;
        })}
        </div>

        {/* Call to Action - Improved Buttons */}
        <div className="mt-16 text-center">
          <p className="text-lg text-foreground/70 mb-6">Ready to make the switch to electric?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/partner" 
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl font-semibold shadow-[0_6px_24px_rgba(38,116,236,0.35)] transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,198,255,0.5)] hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">Become a Partner</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a 
              href="/find-charger" 
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary/30 text-primary rounded-xl font-semibold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-primary/50 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
            >
              <span>Find a Charger</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default BenefitsSection;