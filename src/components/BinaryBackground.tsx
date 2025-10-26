import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  char: string;
  opacity: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export const BinaryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const particles: Particle[] = [];
    const maxParticles = 120;
    
    // Center area configuration
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const spreadRadius = Math.min(canvas.width, canvas.height) * 0.35;

    // Create initial particles
    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spreadRadius;
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        char: Math.random() > 0.5 ? '1' : '0',
        opacity: Math.random() * 0.15 + 0.05,
        size: Math.random() * 8 + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: Math.random() * 200 + 100,
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    const draw = () => {
      // Clear canvas with slight fade
      ctx.fillStyle = 'rgba(240, 239, 235, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update center position
      const currentCenterX = canvas.width / 2;
      const currentCenterY = canvas.height / 2;

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Calculate opacity based on life and distance from center
        const distFromCenter = Math.sqrt(
          Math.pow(p.x - currentCenterX, 2) + Math.pow(p.y - currentCenterY, 2)
        );
        const distanceFade = 1 - Math.min(distFromCenter / spreadRadius, 1);
        const lifeFade = 1 - (p.life / p.maxLife);
        const finalOpacity = p.opacity * distanceFade * lifeFade;

        // Draw particle
        ctx.fillStyle = `rgba(27, 6, 6, ${finalOpacity})`;
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.char, p.x, p.y);

        // Remove dead particles
        if (p.life >= p.maxLife || distFromCenter > spreadRadius * 1.2) {
          particles.splice(i, 1);
        }
      }

      // Add new particles
      while (particles.length < maxParticles) {
        particles.push(createParticle());
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-60"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
