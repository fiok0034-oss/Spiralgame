import React, { useEffect, useRef } from 'react';

interface CanvasAtmosphereProps {
  intensity?: 'calm' | 'storm' | 'cosmic';
  reducedMotion?: boolean;
}

export const CanvasAtmosphere: React.FC<CanvasAtmosphereProps> = ({
  intensity = 'storm',
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = intensity === 'storm' ? 95 : intensity === 'cosmic' ? 65 : 40;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() * 2 + 1) * (intensity === 'storm' ? -3 : -0.5),
      vy: Math.random() * 1.5 + 0.5,
      size: Math.random() * 2.2 + 0.6,
      opacity: Math.random() * 0.7 + 0.2,
      color: intensity === 'cosmic' ? 'rgba(165, 243, 252, ' : 'rgba(224, 242, 254, ',
      swirlOffset: Math.random() * Math.PI * 2,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Wind dynamics
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let vortexX = 0;
        let vortexY = 0;
        if (dist < 180) {
          const force = (1 - dist / 180) * 1.2;
          vortexX = -dy * 0.01 * force;
          vortexY = dx * 0.01 * force;
        }

        p.x += p.vx + Math.sin(time + p.swirlOffset) * 0.5 + vortexX;
        p.y += p.vy + vortexY;

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;

        // Render flake/dust needle
        ctx.beginPath();
        if (intensity === 'storm') {
          // Elongated wind streak
          ctx.strokeStyle = `${p.color}${p.opacity})`;
          ctx.lineWidth = p.size * 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 1.5);
          ctx.stroke();
        } else {
          // Ethereal circular speck
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
};
