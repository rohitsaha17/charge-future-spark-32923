import { motion } from 'framer-motion';
import { ReactNode, useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  hoverEffect?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  hoverEffect = true
}: AnimatedCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Use native IntersectionObserver instead of Framer Motion's whileInView to avoid forced reflows
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
      { rootMargin: '-50px', threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 40, x: 0 };
      case 'down': return { y: -40, x: 0 };
      case 'left': return { y: 0, x: 40 };
      case 'right': return { y: 0, x: -40 };
      default: return { y: 40, x: 0 };
    }
  };

  const initial = getInitialPosition();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initial }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hoverEffect ? { 
        y: -8,
        transition: { duration: 0.3 }
      } : undefined}
      style={{ willChange: isInView ? 'auto' : 'transform, opacity' }}
    >
      <Card className={`transition-shadow duration-300 ${hoverEffect ? 'hover:shadow-xl' : ''} ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;