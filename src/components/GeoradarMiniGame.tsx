import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface GeoradarMiniGameProps {
  onAnomalyLocked: () => void;
  isCompleted?: boolean;
}

export const GeoradarMiniGame: React.FC<GeoradarMiniGameProps> = ({
  onAnomalyLocked,
  isCompleted = false,
}) => {
  const [depth, setDepth] = useState<number>(1400); // 0 to 4000 meters
  const [frequency, setFrequency] = useState<number>(45); // 10 to 100 MHz
  const [xCoord, setXCoord] = useState<number>(35.85); // 35.5 to 36.5 deg E
  const [isLocked, setIsLocked] = useState<boolean>(isCompleted);
  const [signalQuality, setSignalQuality] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Target anomaly: depth around 3200m, x around 36.01, freq around 82MHz
  useEffect(() => {
    const depthDiff = Math.abs(depth - 3200) / 1200;
    const xDiff = Math.abs(xCoord - 36.01) / 0.35;
    const freqDiff = Math.abs(frequency - 82) / 45;

    const closeness = Math.max(0, 1 - (depthDiff * 0.5 + xDiff * 0.35 + freqDiff * 0.15));
    setSignalQuality(Math.round(closeness * 100));

    if (closeness > 0.65) {
      soundEngine.playRadarPing(closeness);
    }
  }, [depth, frequency, xCoord]);

  // Canvas radar scan render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepY = 0;

    const render = () => {
      const w = (canvas.width = 460);
      const h = (canvas.height = 260);

      // Radar dark screen
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, w, h);

      // Depth grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1;
      for (let y = 30; y < h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.font = '9px monospace';
        const meters = Math.round(depth - 1500 + (y / h) * 3000);
        ctx.fillText(`${meters}m`, 8, y - 4);
      }

      // Vertical coordinate lines
      for (let x = 40; x < w; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Subglacial strata noise lines
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      for (let i = 0; i < 40; i++) {
        const py = (i * 7 + (depth % 40)) % h;
        const lineLen = Math.sin(i * 0.8) * 60 + 120;
        ctx.fillRect((w - lineLen) / 2, py, lineLen, 1);
      }

      // If near target (3200m, 36.01E), render the anomalous spiral geometry!
      if (signalQuality > 30) {
        const cx = w / 2 + (36.01 - xCoord) * 600;
        const cy = h / 2 + (3200 - depth) * 0.12;
        const alpha = Math.min(1, (signalQuality - 25) / 60);

        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 12 * alpha;

        // Draw the Subglacial Spiral Cavity
        ctx.beginPath();
        const coils = 3.5;
        const maxR = 48;
        for (let a = 0; a < Math.PI * 2 * coils; a += 0.1) {
          const r = (a / (Math.PI * 2 * coils)) * maxR;
          const sx = cx + Math.cos(a) * r;
          const sy = cy + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Central Obelisk silhouette
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fillRect(cx - 3, cy - 14, 6, 28);

        ctx.restore();
      }

      // Sweep line
      sweepY = (sweepY + 2.5) % h;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(w, sweepY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [depth, frequency, xCoord, signalQuality]);

  const handleLockIn = () => {
    if (signalQuality >= 80) {
      setIsLocked(true);
      soundEngine.playDiscovery();
      onAnomalyLocked();
    } else {
      soundEngine.playUiClick();
    }
  };

  return (
    <div className="bg-slate-900/95 border border-cyan-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md max-w-xl mx-auto my-4 text-slate-200">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase font-mono">
            GEORADAR Δ–82 // SUBGLACIÁLIS SZKENNER
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Bázisállomás: 82°16’S, ARCHÍV-82
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              signalQuality >= 80 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className="text-xs font-mono tabular-nums text-cyan-200">
            REZONANCIA: {signalQuality}%
          </span>
        </div>
      </div>

      {/* Radar Visualizer Canvas */}
      <div className="relative border border-cyan-500/30 rounded-lg overflow-hidden bg-black flex justify-center">
        <canvas ref={canvasRef} className="w-full max-w-[460px] h-[220px] block" />
        
        {/* Overlaid crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 border border-dashed border-cyan-400/40 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full" />
          </div>
        </div>

        {/* Lock confirmation badge */}
        {isLocked && (
          <div className="absolute bottom-3 left-3 bg-emerald-950/90 border border-emerald-400/50 px-3 py-1 rounded text-xs font-mono text-emerald-300">
            ✓ ANOMÁLIA AZONOSÍTVA: Δ–T1 KAMRA (-3200m)
          </div>
        )}
      </div>

      {/* Controls: Depth, Frequency, X-Coordinate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>MÉLYSÉG (Z)</span>
            <span className="text-cyan-300 font-semibold tabular-nums">{depth} m</span>
          </div>
          <input
            type="range"
            min="1000"
            max="3800"
            step="25"
            value={depth}
            disabled={isLocked}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Cél: ~3200 m (alapkőzet felett)</div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>FREKVENCIA</span>
            <span className="text-cyan-300 font-semibold tabular-nums">{frequency} MHz</span>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="1"
            value={frequency}
            disabled={isLocked}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Rezonáns sáv: ~82 MHz</div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>KOORDINÁTA (E)</span>
            <span className="text-cyan-300 font-semibold tabular-nums">{xCoord.toFixed(2)}°E</span>
          </div>
          <input
            type="range"
            min="35.60"
            max="36.40"
            step="0.01"
            value={xCoord}
            disabled={isLocked}
            onChange={(e) => setXCoord(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Tengely: 36°01′E</div>
        </div>
      </div>

      {/* Lock In Action Button */}
      <div className="mt-5 flex items-center justify-between border-t border-cyan-500/20 pt-4">
        <p className="text-xs text-slate-400">
          {signalQuality >= 80
            ? 'Tiszta spirális sziluett és monolit észlelve 3200 méteren!'
            : 'Finomhangold a mélységet és koordinátát a spirál kirajzolásához.'}
        </p>
        <button
          onClick={handleLockIn}
          disabled={isLocked || signalQuality < 75}
          className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap ${
            isLocked
              ? 'bg-emerald-800/50 text-emerald-200 border border-emerald-500/40 cursor-default'
              : signalQuality >= 75
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)] cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isLocked ? 'Koordináták rögzítve' : 'Anomália rögzítése (Δ–82)'}
        </button>
      </div>
    </div>
  );
};
