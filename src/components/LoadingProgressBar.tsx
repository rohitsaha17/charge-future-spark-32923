import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import logomark from "@/assets/logomark.png";

interface LoadingProgressBarProps {
  isLoading: boolean;
}

const LoadingProgressBar = ({ isLoading }: LoadingProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return prev;
          }
          return prev + 10;
        });
      }, 50);

      return () => clearInterval(timer);
    } else {
      setProgress(100);
      const resetTimer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(resetTimer);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] bg-background/80 backdrop-blur-sm border-b border-border/20">
      <div className="relative">
        <Progress value={progress} className="h-1 rounded-none" />
        <div className="absolute left-1/2 top-2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-background/95 backdrop-blur rounded-full border border-border/40 shadow-lg animate-pulse">
          <img src={logomark} alt="A+ Logo" className="w-6 h-6 animate-spin-slow" />
          <span className="text-xs font-medium text-foreground/80">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgressBar;
