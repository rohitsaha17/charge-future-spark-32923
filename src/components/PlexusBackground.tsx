import { useEffect, useRef } from "react";

interface PlexusBackgroundProps {
  className?: string;
  particleCount?: number;
  maxDistance?: number;
  speed?: number;
  opacity?: number;
  interactive?: boolean;
  mouseRadius?: number;
}

const PlexusBackground = ({
  className = "",
  particleCount = 60,
  maxDistance = 120,
  speed = 0.4,
  opacity = 0.2,
  interactive = true,
  mouseRadius = 150,
}: PlexusBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    if (interactive) {
      canvas.parentElement?.addEventListener("mousemove", handleMouseMove);
      canvas.parentElement?.addEventListener("mouseleave", handleMouseLeave);
    }

    // Color gradient for particles (blue to cyan)
    const colors = [
      { h: 216, s: 83, l: 56 }, // Primary blue
      { h: 186, s: 100, l: 50 }, // Cyan
      { h: 200, s: 90, l: 55 }, // Light blue
    ];

    // Particle class
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      color: typeof colors[0];
      size: number;

      constructor() {
        const rect = canvas.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 2 + 1;
      }

      update() {
        const rect = canvas.getBoundingClientRect();
        
        // Move towards base position with some drift
        this.x += this.vx;
        this.y += this.vy;

        // Interactive: repel from mouse
        if (interactive) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 3;
            this.y -= Math.sin(angle) * force * 3;
          }
        }

        // Bounce off edges
        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;
        
        // Keep within bounds
        this.x = Math.max(0, Math.min(rect.width, this.x));
        this.y = Math.max(0, Math.min(rect.height, this.y));
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${opacity * 1.5})`;
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const lineOpacity = opacity * (1 - distance / maxDistance);
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `hsla(${particles[i].color.h}, ${particles[i].color.s}%, ${particles[i].color.l}%, ${lineOpacity})`);
            gradient.addColorStop(1, `hsla(${particles[j].color.h}, ${particles[j].color.s}%, ${particles[j].color.l}%, ${lineOpacity})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Draw connections to mouse when nearby
        if (interactive) {
          const dx = mouseRef.current.x - particles[i].x;
          const dy = mouseRef.current.y - particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius * 1.5) {
            const lineOpacity = opacity * 1.5 * (1 - distance / (mouseRadius * 1.5));
            ctx.beginPath();
            ctx.strokeStyle = `hsla(186, 100%, 50%, ${lineOpacity})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        }
      }

      // Draw mouse glow
      if (interactive && mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, mouseRadius * 0.5
        );
        gradient.addColorStop(0, `hsla(186, 100%, 60%, ${opacity * 0.8})`);
        gradient.addColorStop(1, `hsla(216, 83%, 56%, 0)`);
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, mouseRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (interactive) {
        canvas.parentElement?.removeEventListener("mousemove", handleMouseMove);
        canvas.parentElement?.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, maxDistance, speed, opacity, interactive, mouseRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};

export default PlexusBackground;
