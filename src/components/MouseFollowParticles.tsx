import { useEffect, useRef } from 'react';

const MouseFollowParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
  }>>([]);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animationFrameRef = useRef<number>();
  const ripples = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with energy theme
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.3,
      hue: Math.random() * 60 + 180, // Blue to cyan range
    }));

    // Mouse move handler with ripple effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create ripple on movement
      if (Math.random() > 0.95) {
        ripples.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: window.innerWidth < 768 ? 60 : 100,
          opacity: 0.6,
        });
      }
    };

    // Touch move handler for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseRef.current = { x: touch.clientX, y: touch.clientY };
        
        // Create larger ripple on touch
        if (Math.random() > 0.9) {
          ripples.current.push({
            x: touch.clientX,
            y: touch.clientY,
            radius: 0,
            maxRadius: 80,
            opacity: 0.7,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Animation loop
    const animate = () => {
      // Fade out trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      ripples.current = ripples.current.filter(ripple => {
        ripple.radius += 2;
        ripple.opacity -= 0.02;
        
        if (ripple.opacity > 0) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(38, 116, 236, ${ripple.opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Inner glow
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 229, 255, ${ripple.opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          return true;
        }
        return false;
      });

      particlesRef.current.forEach((particle, i) => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = window.innerWidth < 768 ? 120 : 180;

        // Attract and energize particles near mouse
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.vx += (dx / distance) * force * 0.15;
          particle.vy += (dy / distance) * force * 0.15;
          particle.opacity = Math.min(0.9, particle.opacity + force * 0.1);
        } else {
          particle.opacity = Math.max(0.3, particle.opacity - 0.01);
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add friction
        particle.vx *= 0.96;
        particle.vy *= 0.96;

        // Boundary check with soft bounce
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 60%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw energy connections
        particlesRef.current.forEach((other, j) => {
          if (i >= j) return;
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxConnectDistance = window.innerWidth < 768 ? 100 : 140;

          if (distance < maxConnectDistance) {
            const midX = (particle.x + other.x) / 2;
            const midY = (particle.y + other.y) / 2;
            const mouseDistToMid = Math.sqrt(
              Math.pow(mouseRef.current.x - midX, 2) + 
              Math.pow(mouseRef.current.y - midY, 2)
            );
            
            const connectionOpacity = (1 - distance / maxConnectDistance) * 
              (mouseDistToMid < 200 ? 0.4 : 0.15);
            
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y,
              other.x, other.y
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 60%, ${connectionOpacity})`);
            gradient.addColorStop(0.5, `hsla(190, 100%, 60%, ${connectionOpacity * 1.2})`);
            gradient.addColorStop(1, `hsla(${other.hue}, 100%, 60%, ${connectionOpacity})`);
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = mouseDistToMid < 200 ? 1.5 : 0.8;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default MouseFollowParticles;
