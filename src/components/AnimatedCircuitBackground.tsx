import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface CircuitLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  speed: number;
  glow: number;
}

const AnimatedCircuitBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Circuit lines
    const circuitLines: CircuitLine[] = [];
    const particles: Particle[] = [];
    
    // Create circuit pattern
    const createCircuitLines = () => {
      const lines: CircuitLine[] = [];
      const gridSize = 80;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Horizontal lines
          if (Math.random() > 0.5 && i < cols - 1) {
            lines.push({
              x1: x,
              y1: y,
              x2: x + gridSize,
              y2: y,
              progress: Math.random(),
              speed: 0.002 + Math.random() * 0.003,
              glow: 0
            });
          }

          // Vertical lines
          if (Math.random() > 0.5 && j < rows - 1) {
            lines.push({
              x1: x,
              y1: y,
              x2: x,
              y2: y + gridSize,
              progress: Math.random(),
              speed: 0.002 + Math.random() * 0.003,
              glow: 0
            });
          }
        }
      }

      return lines;
    };

    circuitLines.push(...createCircuitLines());

    // Animation loop
    const animate = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(10, 15, 25, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw circuit lines
      circuitLines.forEach(line => {
        line.progress += line.speed;
        if (line.progress > 1) {
          line.progress = 0;
          line.glow = 1;
        }
        line.glow *= 0.95;

        const currentX = line.x1 + (line.x2 - line.x1) * line.progress;
        const currentY = line.y1 + (line.y2 - line.y1) * line.progress;

        // Draw base line
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        // Draw progress glow
        if (line.progress > 0) {
          const gradient = ctx.createLinearGradient(line.x1, line.y1, currentX, currentY);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0)');
          gradient.addColorStop(Math.max(0, line.progress - 0.2), 'rgba(14, 165, 233, 0.3)');
          gradient.addColorStop(line.progress, `rgba(14, 165, 233, ${0.8 + line.glow * 0.2})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10 + line.glow * 10;
          ctx.shadowColor = 'rgba(14, 165, 233, 0.8)';
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw moving particle
          if (line.progress > 0.1) {
            ctx.fillStyle = `rgba(56, 189, 248, ${0.8 + line.glow * 0.2})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(56, 189, 248, 1)';
            ctx.beginPath();
            ctx.arc(currentX, currentY, 2 + line.glow * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Create particle trail
            if (Math.random() > 0.7) {
              particles.push({
                x: currentX,
                y: currentY,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 1,
                maxLife: 30 + Math.random() * 20
              });
            }
          }
        }

        // Draw nodes at intersections
        ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.beginPath();
        ctx.arc(line.x1, line.y1, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AnimatedCircuitBackground;
