import type React from "react";
import { useEffect, useRef } from "react";

// Utility function to merge class names
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

type FallingPatternProps = React.ComponentProps<"div"> & {
  /** Primary color of the falling elements (default: 'hsl(12 78% 55% / 0.35)') */
  color?: string;
  /** Background color (default: 'hsl(48 25% 93%)') */
  backgroundColor?: string;
  /** Animation duration in seconds (default: 80) */
  duration?: number;
  /** Blur intensity for the overlay effect (default: '0.9em') */
  blurIntensity?: string;
  /** Pattern density - affects spacing (default: 1) */
  density?: number;
};

export function FallingPattern({
  color = "hsl(12 78% 55% / 0.35)",
  backgroundColor = "hsl(48 25% 93%)",
  duration = 80,
  blurIntensity = "0.9em",
  density = 1,
  className,
}: FallingPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Parse color
    const parseHSL = (hsl: string) => {
      const match = hsl.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\s*\/?\s*([\d.]+)?\)/);
      if (match) {
        const [, h, s, l, a = "1"] = match;
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
      }
      return hsl;
    };

    const particleColor = parseHSL(color);

    // Create particles
    interface Particle {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const numColumns = Math.floor(canvas.width / (30 * density));

    for (let i = 0; i < numColumns; i++) {
      particles.push({
        x: (i * canvas.width) / numColumns + Math.random() * 20,
        y: Math.random() * canvas.height - canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        length: 20 + Math.random() * 40,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Draw falling line with pixels
        const pixelSize = 1;
        const gap = 3;

        ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${particle.opacity})`);

        for (let i = 0; i < particle.length; i += gap) {
          const y = particle.y + i;
          if (y > 0 && y < canvas.height) {
            ctx.fillRect(particle.x, y, pixelSize, pixelSize);
          }
        }

        // Update position
        particle.y += particle.speed;

        // Reset when off screen
        if (particle.y > canvas.height + particle.length) {
          particle.y = -particle.length;
          particle.x = Math.random() * canvas.width;
          particle.speed = 0.5 + Math.random() * 1.5;
          particle.opacity = 0.3 + Math.random() * 0.4;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationId);
    };
  }, [color, backgroundColor, duration, density]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} />
      <div
        className="absolute inset-0 dark:brightness-600"
        style={{
          backdropFilter: `blur(${blurIntensity})`,
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0, transparent 1px, ${backgroundColor} 1px)`,
          backgroundSize: `${4 * density}px ${4 * density}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
