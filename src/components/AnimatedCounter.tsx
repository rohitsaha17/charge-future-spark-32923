import { motion, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
  className?: string;
}

const AnimatedCounter = ({ 
  value, 
  suffix = '', 
  prefix = '',
  label,
  duration = 2,
  className = ''
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000
  });

  // Use IntersectionObserver instead of Framer Motion's useInView to avoid forced reflows
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-100px', threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return (
    <div 
      ref={ref}
      className={`text-center ${className}`}
      style={{ willChange: isInView ? 'auto' : 'transform, opacity' }}
    >
      <motion.div 
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="tabular-nums">
          {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
      </motion.div>
      <motion.div 
        className="text-sm md:text-base text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {label}
      </motion.div>
    </div>
  );
};

export default AnimatedCounter;