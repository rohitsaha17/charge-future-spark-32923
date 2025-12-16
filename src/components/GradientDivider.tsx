import gradientBreak from "@/assets/gradient-section-break.png";

interface GradientDividerProps {
  variant?: "default" | "subtle" | "accent" | "wave";
}

const GradientDivider = ({ variant = "default" }: GradientDividerProps) => {
  if (variant === "wave") {
    return (
      <div className="w-full relative overflow-hidden py-4">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-24"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(216 83% 56% / 0.1)" />
              <stop offset="50%" stopColor="hsl(191 100% 50% / 0.15)" />
              <stop offset="100%" stopColor="hsl(216 83% 56% / 0.1)" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
          />
          <path
            d="M0,80 C150,110 350,50 600,80 C850,110 1050,50 1200,80 L1200,120 L0,120 Z"
            fill="hsl(216 83% 56% / 0.05)"
          />
        </svg>
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div className="w-full py-8 relative">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === "accent") {
    return (
      <div className="w-full py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        <div className="h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="flex justify-center gap-2 mt-3">
          <div className="w-8 h-1 rounded-full bg-primary/20" />
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary/40 to-accent/40" />
          <div className="w-8 h-1 rounded-full bg-accent/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-8 md:h-12 relative overflow-hidden">
      <img 
        src={gradientBreak} 
        alt="" 
        className="w-full h-full object-cover"
        aria-hidden="true"
      />
    </div>
  );
};

export default GradientDivider;
