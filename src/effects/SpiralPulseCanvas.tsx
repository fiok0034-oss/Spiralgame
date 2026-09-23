import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface SpiralPulseCanvasProps {
  awarenessLevel?: number; // 0 to 100
  size?: number;
  interactive?: boolean;
  onActivate?: () => void;
  reducedMotion?: boolean;
}

export const SpiralPulseCanvas: React.FC<SpiralPulseCanvasProps> = ({
  awarenessLevel = 30,
  size = 360,
  interactive = true,
  onActivate,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const targetRotationSpeedRef = useRef<number>(0.006);

  useEffect(() => {
    // Rotation speed and pulse scale scale with awareness level
    targetRotationSpeedRef.current = 0.004 + (awarenessLevel / 100) * 0.016;
  }, [awarenessLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      rotationRef.current += reducedMotion ? 0.001 : targetRotationSpeedRef.current;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Pulse modulation
      const pulseMod = Math.sin(time * (1 + awarenessLevel / 35)) * 0.08 + 1;
      const maxRadius = (size / 2 - 16) * pulseMod;

      // Draw background faint rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 30; r < maxRadius; r += 45) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Logarithmic / Archimedean Multi-strand Spiral
      const strands = awarenessLevel > 60 ? 3 : 2;
      for (let s = 0; s < strands; s++) {
        const strandOffset = (s * Math.PI * 2) / strands;
        ctx.beginPath();

        const coils = 3.8 + (awarenessLevel / 100) * 2;
        const totalPoints = 220;

        for (let i = 0; i < totalPoints; i++) {
          const t = (i / totalPoints) * coils * Math.PI * 2;
          const r = (i / totalPoints) * maxRadius;
          const angle = t + rotationRef.current + strandOffset;

          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Gradient stroke
        const alpha = 0.25 + (awarenessLevel / 100) * 0.55;
        ctx.strokeStyle = s === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(165, 243, 252, ${alpha * 0.7})`;
        ctx.lineWidth = s === 0 ? 2 : 1.2;
        ctx.stroke();
      }

      // Draw Orbiting Memory Nodules
      const nodeCount = Math.min(12, 3 + Math.floor(awarenessLevel / 10));
      for (let n = 0; n < nodeCount; n++) {
        const nodeAngle = rotationRef.current * 1.5 + (n * Math.PI * 2) / nodeCount;
        const nodeDist = 40 + ((n * 23) % (maxRadius - 50));
        const nx = cx + Math.cos(nodeAngle) * nodeDist;
        const ny = cy + Math.sin(nodeAngle) * nodeDist;

        ctx.beginPath();
        ctx.fillStyle = n % 2 === 0 ? 'rgba(34, 211, 238, 0.85)' : 'rgba(255, 255, 255, 0.75)';
        ctx.arc(nx, ny, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow halo
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 1;
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central core singularity
      const coreRadius = 5 + Math.sin(time * 2) * 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 3);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.4, 'rgba(6, 182, 212, 0.7)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, coreRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [awarenessLevel, size, reducedMotion]);

  const handlePointerEnter = () => {
    if (!interactive) return;
    targetRotationSpeedRef.current *= 2.2;
    soundEngine.playCrystalResonance(640);
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    targetRotationSpeedRef.current = 0.004 + (awarenessLevel / 100) * 0.016;
  };

  const handleClick = () => {
    if (interactive && onActivate) {
      soundEngine.playCrystalResonance(528);
      onActivate();
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      }`}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label="A Spirál geometriája"
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="block filter drop-shadow-[0_0_24px_rgba(6,182,212,0.25)]"
      />
    </div>
  );
};
