import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "light" | "medium" | "gradient" | "mesh";
  pattern?: "none" | "dots" | "grid" | "circuit";
  withBlobs?: boolean;
  withDivider?: boolean;
}

const SectionWrapper = ({
  children,
  className,
  variant = "default",
  pattern = "none",
  withBlobs = false,
  withDivider = false,
}: SectionWrapperProps) => {
  const variantClasses = {
    default: "bg-background",
    light: "bg-gradient-to-b from-background via-[hsl(220_20%_98%)] to-background",
    medium: "bg-gradient-to-b from-[hsl(216_40%_97%)] via-[hsl(216_50%_96%)] to-[hsl(220_20%_98%)]",
    gradient: "bg-gradient-to-br from-[hsl(216_50%_97%)] via-background to-[hsl(191_40%_97%)]",
    mesh: "section-mesh",
  };

  const patternClasses = {
    none: "",
    dots: "pattern-dots",
    grid: "pattern-grid",
    circuit: "pattern-circuit",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        variantClasses[variant],
        patternClasses[pattern],
        className
      )}
    >
      {/* Top divider line */}
      {withDivider && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      )}

      {/* Animated blobs */}
      {withBlobs && (
        <>
          <div 
            className="glow-blob w-[400px] h-[400px] bg-primary/20 -top-32 -left-32"
            style={{ animationDelay: "0s" }}
          />
          <div 
            className="glow-blob w-[300px] h-[300px] bg-accent/15 -bottom-20 -right-20"
            style={{ animationDelay: "2s" }}
          />
          <div 
            className="glow-blob w-[250px] h-[250px] bg-primary-glow/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ animationDelay: "4s" }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom divider line */}
      {withDivider && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      )}
    </section>
  );
};

export default SectionWrapper;
