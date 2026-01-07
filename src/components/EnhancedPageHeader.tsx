import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EnhancedPageHeaderProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  description?: string;
  backgroundImage?: string;
  icon?: ReactNode;
  badges?: { icon?: ReactNode; text: string }[];
  theme?: 'electric' | 'gradient' | 'mesh' | 'aurora';
}

const EnhancedPageHeader = ({
  title,
  titleHighlight,
  subtitle,
  description,
  backgroundImage,
  icon,
  badges = [],
  theme = 'electric'
}: EnhancedPageHeaderProps) => {
  
  const getThemeStyles = () => {
    switch (theme) {
      case 'electric':
        return {
          bg: 'bg-gradient-to-br from-primary via-blue-600 to-cyan-500',
          pattern: 'electric'
        };
      case 'gradient':
        return {
          bg: 'bg-gradient-to-br from-primary via-indigo-600 to-purple-600',
          pattern: 'waves'
        };
      case 'mesh':
        return {
          bg: 'bg-gradient-to-br from-primary via-teal-600 to-emerald-600',
          pattern: 'mesh'
        };
      case 'aurora':
        return {
          bg: 'bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600',
          pattern: 'aurora'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-primary via-blue-600 to-cyan-500',
          pattern: 'electric'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <section className={`relative py-28 md:py-36 lg:py-44 overflow-hidden ${themeStyles.bg}`}>
      {/* Background image with overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Dynamic background patterns */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Electric pulse lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(6,182,212,0.8)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <pattern id="circuit-pattern" patternUnits="userSpaceOnUse" width="80" height="80">
              <path d="M 0 40 L 30 40 L 40 30 L 50 40 L 80 40" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"/>
              <path d="M 40 0 L 40 30 M 40 50 L 40 80" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"/>
              <circle cx="40" cy="40" r="2" fill="rgba(255,255,255,0.4)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge/Subtitle */}
        <motion.div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {icon && <span className="text-cyan-300">{icon}</span>}
          <span className="text-sm font-semibold text-white/95 tracking-wide">{subtitle}</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {title}{' '}
          {titleHighlight && (
            <span className="text-cyan-300 relative">
              {titleHighlight}
              <motion.span
                className="absolute -inset-1 bg-cyan-400/20 blur-xl rounded-lg -z-10"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </span>
          )}
        </motion.h1>

        {/* Description */}
        {description && (
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {badges.map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-colors"
              >
                {badge.icon && <span className="text-cyan-300">{badge.icon}</span>}
                <span className="text-white font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default EnhancedPageHeader;