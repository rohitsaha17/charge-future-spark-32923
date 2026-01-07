import { motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';
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
      initial={{ opacity: 0, ...initial }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hoverEffect ? { 
        y: -8,
        transition: { duration: 0.3 }
      } : undefined}
    >
      <Card className={`transition-shadow duration-300 ${hoverEffect ? 'hover:shadow-xl' : ''} ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;