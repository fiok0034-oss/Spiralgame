import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Crosshair, CheckCircle2, Radio } from 'lucide-react';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';

interface RadarTarget {
  id: string;
  name: string;
  subtitle: string;
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
  depthM: number;
  freqMHz: number;
  coords: string;
  shape: 'spiral' | 'crate' | 'crystal' | 'relay' | 'shard';
  isPrimaryAnomaly?: boolean;
  resonance: number;
  artifactId?: string;
  evidenceId?: string;
  memoryId?: string;
  abilityId?: string;
  secretId?: string;
}

const RADAR_TARGETS: RadarTarget[] = [
  {
    id: 'target_obelisk_chamber',
    name: 'Δ–T1 Fekete Monolit Kamra',
    subtitle: '3,5 fordulatú subglaciális spirális üreg',
    x: 0.52,
    y: 0.56,
    depthM: 3200,
    freqMHz: 82.0,
    coords: '82°16’S, 36°01’E',
    shape: 'spiral',
    isPrimaryAnomaly: true,
    resonance: 30,
    evidenceId: 'ev_1982_georadar',
    memoryId: 'mem_georadar_anomaly',
    abilityId: 'ab_deep_resonance',
  },
  {
    id: 'target_1959_crate',
    name: '1959-es Sárgaréz Kronométer Láda',
    subtitle: 'Dr. Kovács Áron eltemetett műszercsomagja',
    x: 0.22,
    y: 0.32,
    depthM: 1850,
    freqMHz: 59.4,
    coords: '82°15’S, 35°54’E',
    shape: 'crate',
    resonance: 25,
    artifactId: 'art_chronometer_1959',
    secretId: 'sec_1959_vault',
  },
  {
    id: 'target_crystal_vein',
    name: 'Subglaciális Kristályér',
    subtitle: '432 Hz-es koherens rezonancia-telér',
    x: 0.79,
    y: 0.38,
    depthM: 2640,
    freqMHz: 112.5,
    coords: '82°18’S, 36°09’E',
    shape: 'crystal',
    resonance: 25,
    evidenceId: 'ev_crystal_vein',
    abilityId: 'ab_crystal_harmony',
    secretId: 'sec_ice_memory_matrix',
  },
  {
    id: 'target_radio_relay',
    name: 'Eltemetett Poláris Rádiójeladó',
    subtitle: '58 BPM-es morze impulzusok forrása',
    x: 0.31,
    y: 0.76,
    depthM: 920,
    freqMHz: 82.0,
    coords: '82°17’S, 35°58’E',
    shape: 'relay',
    resonance: 20,
    evidenceId: 'ev_1982_morse_tape',
  },
  {
    id: 'target_kassarah_shard',
    name: 'Kassarah Első Visszhang-szilánkja',
    subtitle: 'Testhőmérsékletű obszidián magtöredék',
    x: 0.74,
    y: 0.78,
    depthM: 3510,
    freqMHz: 142.8,
    coords: '82°19’S, 36°12’E',
    shape: 'shard',
    resonance: 30,
    artifactId: 'art_monolith_shard',
  },
];

interface GeoRadarScannerProps {
  onAnomalyLocked?: () => void;
  isCompleted?: boolean;
}

export const GeoRadarScanner: React.FC<GeoRadarScannerProps> = ({
  onAnomalyLocked,
}) => {
  const { spiralState, abilities, discoverRadarTarget, reducedMotion } = useGame();
  const discoveredIds = spiralState.worldState.discoveredRadarTargets;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });
  const pulseRingsRef = useRef<{ x: number; y: number; r: number; alpha: number; color: string }[]>([]);
  const lastAudioTimeRef = useRef<number>(0);

  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [cursorTelemetry, setCursorTelemetry] = useState<{
    strength: number;
    depthM: number;
    magDeviation: number;
    coordsLabel: string;
    nearestTarget: RadarTarget | null;
    canLock: boolean;
  }>({
    strength: 0,
    depthM: 1200,
    magDeviation: 14.0,
    coordsLabel: '82°16’S, 36°00’E',
    nearestTarget: null,
    canLock: false,
  });
  const [statusMessage, setStatusMessage] = useState<string>(
    'Húzd a kurzort vagy az ujjad az antarktiszi jégmező felett az anomáliák beméréséhez.'
  );

  // Ability modifiers
  const iceBreathLevel = abilities.find((a) => a.id === 'ab_ice_breath')?.level || 1;
  const echoSightUnlocked = (abilities.find((a) => a.id === 'ab_echo_sight')?.level || 0) > 0;
  const detectionRadius = 0.24 + (iceBreathLevel - 1) * 0.04;

  const evaluatePointer = useCallback(
    (nx: number, ny: number) => {
      let bestStrength = 0;
      let nearest: RadarTarget | null = null;

      for (const target of RADAR_TARGETS) {
        const dx = nx - target.x;
        const dy = ny - target.y;
        const dist = Math.hypot(dx, dy);
        const raw = Math.max(0, 1 - dist / detectionRadius);
        const shaped = Math.pow(raw, 1.35);
        if (shaped > bestStrength) {
          bestStrength = shaped;
          nearest = target;
        }
      }

      const pct = Math.round(bestStrength * 100);
      const latSec = (14 + ny * 6).toFixed(2);
      const lonSec = (50 + nx * 24).toFixed(2);
      const estimatedDepth = nearest && pct > 35
        ? Math.round(nearest.depthM * (0.85 + 0.15 * bestStrength))
        : Math.round(600 + ny * 3100);
      const magDev = Number((11.5 + bestStrength * 6.8).toFixed(1));
      const canLock = Boolean(nearest && pct >= 78);

      setCursorTelemetry({
        strength: pct,
        depthM: estimatedDepth,
        magDeviation: magDev,
        coordsLabel: `82°${latSec}’S, 35°${lonSec}’E`,
        nearestTarget: nearest,
        canLock,
      });

      // Audio pulse feedback with spatial stereo panning and dynamic cadence
      const now = performance.now();
      const cadenceMs = Math.max(115, 390 - bestStrength * 270);
      if (audioEnabled && pointerRef.current.active && now - lastAudioTimeRef.current >= cadenceMs) {
        lastAudioTimeRef.current = now;
        const pan = Math.max(-0.9, Math.min(0.9, nx * 2 - 1));
        soundEngine.playScannerPulse(Math.max(0.08, bestStrength), pan);

        pulseRingsRef.current.push({
          x: nx,
          y: ny,
          r: 4,
          alpha: 0.75,
          color: pct >= 78 ? '#34d399' : pct >= 45 ? '#22d3ee' : '#38bdf8',
        });
      }

      return { pct, nearest, canLock };
    },
    [audioEnabled, detectionRadius]
  );

  const lockNearestTarget = useCallback(
    (nx: number, ny: number) => {
      const { pct, nearest } = evaluatePointer(nx, ny);
      if (!nearest || pct < 75) {
        soundEngine.playMechanicalTick(-2);
        setStatusMessage(
          'A jel túl gyenge a rögzítéshez (minimum 78% szükséges). Keresd a pulzáló csúcspontot!'
        );
        return;
      }

      const alreadyFound = discoveredIds.includes(nearest.id);
      discoverRadarTarget(nearest.id, {
        resonance: nearest.resonance,
        artifactId: nearest.artifactId,
        evidenceId: nearest.evidenceId,
        memoryId: nearest.memoryId,
        abilityId: nearest.abilityId,
        secretId: nearest.secretId,
        isPrimaryAnomaly: nearest.isPrimaryAnomaly,
      });

      if (nearest.isPrimaryAnomaly && onAnomalyLocked) {
        onAnomalyLocked();
      }

      soundEngine.playHarmonicChord([432, 528, 639]);
      setStatusMessage(
        alreadyFound
          ? `Újraellenőrizve: ${nearest.name} (${nearest.coords}, -${nearest.depthM}m)`
          : `SIKERES BEMÉRÉS: ${nearest.name} rögzítve! (+${nearest.resonance} Rezonancia)`
      );
    },
    [discoverRadarTarget, discoveredIds, evaluatePointer, onAnomalyLocked]
  );

  const getNormalizedCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { nx: 0.5, ny: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { nx, ny };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { nx, ny } = getNormalizedCoords(e);
    pointerRef.current = { x: nx, y: ny, active: true };
    evaluatePointer(nx, ny);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { nx, ny } = getNormalizedCoords(e);
    pointerRef.current = { x: nx, y: ny, active: true };
    lockNearestTarget(nx, ny);
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  // Interactive Terrain & Subsurface Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const render = () => {
      t += reducedMotion ? 0.008 : 0.024;
      const w = (canvas.width = 640);
      const h = (canvas.height = 340);

      // Deep Antarctic night terrain background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#040a16');
      bg.addColorStop(0.5, '#071324');
      bg.addColorStop(1, '#040914');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Ice topographic contour lines
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.09)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const baseY = 30 + i * 40;
        for (let x = 0; x <= w; x += 20) {
          const wave = Math.sin(x * 0.015 + i * 0.9) * 10 + Math.cos(x * 0.008 - i) * 6;
          if (x === 0) ctx.moveTo(x, baseY + wave);
          else ctx.lineTo(x, baseY + wave);
        }
        ctx.stroke();
      }

      // Latitude / Longitude Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      for (let gx = 80; gx < w; gx += 80) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 60; gy < h; gy += 60) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;

      // Render subsurface anomalies (discovered always visible, undiscovered reveal by proximity)
      RADAR_TARGETS.forEach((target) => {
        const tx = target.x * w;
        const ty = target.y * h;
        const distNorm = Math.hypot(pointerRef.current.x - target.x, pointerRef.current.y - target.y);
        const prox = pointerRef.current.active
          ? Math.max(0, 1 - distNorm / detectionRadius)
          : 0;
        const isFound = discoveredIds.includes(target.id);

        // Echo sight ghost hint if ability unlocked
        if (!isFound && echoSightUnlocked && prox < 0.25) {
          ctx.save();
          ctx.strokeStyle = 'rgba(167, 139, 250, 0.28)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(tx, ty, 14 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        const visibility = isFound ? 0.95 : Math.pow(prox, 1.15);
        if (visibility > 0.12) {
          ctx.save();
          const color = isFound ? '52, 211, 153' : prox >= 0.78 ? '34, 211, 238' : '56, 189, 248';
          ctx.strokeStyle = `rgba(${color}, ${visibility})`;
          ctx.fillStyle = `rgba(${color}, ${visibility * 0.18})`;
          ctx.lineWidth = isFound ? 2 : 1.5;
          ctx.shadowColor = isFound ? '#34d399' : '#22d3ee';
          ctx.shadowBlur = 14 * visibility;

          if (target.shape === 'spiral') {
            ctx.beginPath();
            const coils = 3;
            const maxR = 26;
            for (let a = 0; a < Math.PI * 2 * coils; a += 0.15) {
              const r = (a / (Math.PI * 2 * coils)) * maxR;
              const sx = tx + Math.cos(a + t * 0.4) * r;
              const sy = ty + Math.sin(a + t * 0.4) * r;
              if (a === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          } else if (target.shape === 'crate') {
            ctx.strokeRect(tx - 12, ty - 10, 24, 20);
            ctx.fillRect(tx - 12, ty - 10, 24, 20);
            ctx.beginPath();
            ctx.moveTo(tx - 12, ty - 10);
            ctx.lineTo(tx + 12, ty + 10);
            ctx.stroke();
          } else if (target.shape === 'crystal') {
            ctx.beginPath();
            ctx.moveTo(tx, ty - 18);
            ctx.lineTo(tx + 12, ty);
            ctx.lineTo(tx, ty + 18);
            ctx.lineTo(tx - 12, ty);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (target.shape === 'relay') {
            ctx.beginPath();
            ctx.arc(tx, ty, 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(tx, ty, 16, -Math.PI * 0.75, -Math.PI * 0.25);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(tx, ty - 15);
            ctx.lineTo(tx + 11, ty + 10);
            ctx.lineTo(tx - 11, ty + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          if (isFound || prox >= 0.68) {
            ctx.fillStyle = `rgba(${color}, 0.95)`;
            ctx.font = '600 10px monospace';
            ctx.fillText(isFound ? `✓ ${target.name}` : `${target.coords} (-${target.depthM}m)`, tx + 16, ty + 4);
          }
          ctx.restore();
        }
      });

      // Expanding pulse rings
      pulseRingsRef.current = pulseRingsRef.current.filter((ring) => ring.alpha > 0.03);
      for (const ring of pulseRingsRef.current) {
        ring.r += reducedMotion ? 1.5 : 2.6;
        ring.alpha *= 0.93;
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ring.x * w, ring.y * h, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Active pointer reticle & signal strength cone
      if (pointerRef.current.active) {
        const radiusPx = detectionRadius * Math.min(w, h) * 0.55;
        const grad = ctx.createRadialGradient(px, py, 2, px, py, radiusPx);
        const s = cursorTelemetry.strength / 100;
        grad.addColorStop(0, s >= 0.78 ? 'rgba(52,211,153,0.30)' : 'rgba(34,211,238,0.22)');
        grad.addColorStop(1, 'rgba(6,182,212,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radiusPx, 0, Math.PI * 2);
        ctx.fill();

        // Crosshair
        ctx.strokeStyle = s >= 0.78 ? '#34d399' : '#22d3ee';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.moveTo(px - 24, py);
        ctx.lineTo(px - 8, py);
        ctx.moveTo(px + 8, py);
        ctx.lineTo(px + 24, py);
        ctx.moveTo(px, py - 24);
        ctx.lineTo(px, py - 8);
        ctx.moveTo(px, py + 8);
        ctx.lineTo(px, py + 24);
        ctx.stroke();
      }

      // Rotating sweep line across field
      if (!reducedMotion) {
        const sweepX = ((t * 55) % (w + 80)) - 40;
        const sweepGrad = ctx.createLinearGradient(sweepX - 40, 0, sweepX, 0);
        sweepGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        sweepGrad.addColorStop(1, 'rgba(34, 211, 238, 0.14)');
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(sweepX - 40, 0, 40, h);
      }

      // Live mini oscilloscope along bottom edge
      ctx.save();
      ctx.strokeStyle = cursorTelemetry.strength >= 78 ? 'rgba(52,211,153,0.85)' : 'rgba(34,211,238,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const amp = 3 + (cursorTelemetry.strength / 100) * 14;
      const freq = 0.04 + (cursorTelemetry.strength / 100) * 0.1;
      for (let ox = 0; ox <= w; ox += 4) {
        const oy = h - 22 + Math.sin(ox * freq + t * 5) * amp * Math.sin((ox / w) * Math.PI);
        if (ox === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cursorTelemetry.strength, detectionRadius, discoveredIds, echoSightUnlocked, reducedMotion]);

  return (
    <div className="bg-slate-900/95 border border-cyan-500/35 rounded-2xl p-4 md:p-5 shadow-2xl text-slate-200">
      {/* Scanner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase font-mono">
              GEORADAR SZKENNER · 82°16’S JÉGMEZŐ
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Felszín alatti objektumok keresése kurzorral vagy érintéssel · Felfedezve:{' '}
            <span className="text-emerald-300 font-semibold tabular-nums">
              {discoveredIds.length}/{RADAR_TARGETS.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioEnabled((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200 transition-colors cursor-pointer"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>{audioEnabled ? 'Hangjel aktív' : 'Némítva'}</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500 uppercase">Jelerősség</div>
          <div
            className={`text-sm font-bold tabular-nums ${
              cursorTelemetry.strength >= 78
                ? 'text-emerald-400'
                : cursorTelemetry.strength >= 45
                ? 'text-cyan-300'
                : 'text-slate-300'
            }`}
          >
            {cursorTelemetry.strength}%
          </div>
        </div>
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500 uppercase">Becsült Mélység</div>
          <div className="text-sm font-bold text-cyan-200 tabular-nums">-{cursorTelemetry.depthM} m</div>
        </div>
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500 uppercase">Mágneses Eltérés</div>
          <div className="text-sm font-bold text-amber-300 tabular-nums">+{cursorTelemetry.magDeviation}°</div>
        </div>
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500 uppercase">Pozíció</div>
          <div className="text-[11px] font-semibold text-slate-200 tabular-nums truncate">
            {cursorTelemetry.coordsLabel}
          </div>
        </div>
      </div>

      {/* Signal Meter Progress Strip */}
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
        <div
          className={`h-full transition-all duration-150 ${
            cursorTelemetry.strength >= 78
              ? 'bg-emerald-400'
              : cursorTelemetry.strength >= 45
              ? 'bg-cyan-400'
              : 'bg-sky-600'
          }`}
          style={{ width: `${cursorTelemetry.strength}%` }}
        />
      </div>

      {/* Interactive Pointer-Driven Radar Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/35 bg-[#040a16]">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          className="w-full h-[260px] sm:h-[310px] block cursor-crosshair touch-none"
        />

        {cursorTelemetry.canLock && cursorTelemetry.nearestTarget && (
          <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-400/60 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-200 pointer-events-none">
            Kattints a rögzítéshez: {cursorTelemetry.nearestTarget.name}
          </div>
        )}
      </div>

      {/* Action & Status Row */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
        <p className="text-xs font-mono text-cyan-200/90">{statusMessage}</p>
        <button
          type="button"
          onClick={() => lockNearestTarget(pointerRef.current.x, pointerRef.current.y)}
          disabled={!cursorTelemetry.canLock}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            cursorTelemetry.canLock
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Anomália Rögzítése</span>
        </button>
      </div>

      {/* Discovered Targets Manifest */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {RADAR_TARGETS.map((target) => {
          const found = discoveredIds.includes(target.id);
          return (
            <div
              key={target.id}
              className={`p-2.5 rounded-lg border text-xs font-mono ${
                found
                  ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-100'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold truncate">
                  {found ? target.name : 'Ismeretlen aljzat-anomália'}
                </span>
                {found && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>
              <div className="text-[10px] mt-0.5 tabular-nums">
                {found ? `${target.coords} · -${target.depthM}m` : `Szektor mélység ~${target.depthM}m`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
