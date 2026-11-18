import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { useGame } from '../game/GameContext';
import { CINEMATIC_EVENTS } from '../data/expansionData';
import { soundEngine } from '../audio/SoundEngine';

export const CinematicEventOverlay: React.FC = () => {
  const { activeCinematicId, setActiveCinematicId, completeCinematic, reducedMotion } = useGame();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const eventData = activeCinematicId ? CINEMATIC_EVENTS[activeCinematicId] : null;

  useEffect(() => {
    setPhaseIdx(0);
    setCompleted(false);
  }, [activeCinematicId]);

  useEffect(() => {
    if (!eventData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPhase = eventData.phases[phaseIdx] || eventData.phases[0];
    let raf = 0;
    let t = 0;

    const render = () => {
      t += reducedMotion ? 0.01 : 0.03;
      const w = (canvas.width = 720);
      const h = (canvas.height = 220);
      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, w, h);

      const mode = currentPhase.visualMode;
      ctx.save();
      if (mode === 'wave' || mode === 'convergence') {
        for (let l = 0; l < 3; l++) {
          ctx.strokeStyle = l === 0 ? 'rgba(34,211,238,0.75)' : l === 1 ? 'rgba(168,85,247,0.45)' : 'rgba(251,191,36,0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 4) {
            const y = h / 2 + Math.sin(x * 0.02 + t * (1.2 + l * 0.4) + l) * (25 + phaseIdx * 12);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (mode === 'portal') {
        const cx = w / 2;
        const cy = h / 2;
        for (let r = 18; r < 110; r += 16) {
          ctx.strokeStyle = `rgba(34,211,238,${0.8 - r / 140})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, r + Math.sin(t * 2 + r) * 4, t, t + Math.PI * 1.65);
          ctx.stroke();
        }
      } else {
        // fracture or gravity
        for (let i = 0; i < 16; i++) {
          const x1 = (i * 52 + t * 20) % w;
          ctx.strokeStyle = mode === 'gravity' ? 'rgba(52,211,153,0.45)' : 'rgba(244,63,94,0.45)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x1, 0);
          ctx.lineTo(x1 + (mode === 'gravity' ? 0 : 35), h);
          ctx.stroke();
        }
      }
      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [eventData, phaseIdx, reducedMotion]);

  if (!eventData) return null;

  const phase = eventData.phases[phaseIdx] || eventData.phases[0];

  const handleAdvancePhase = () => {
    soundEngine.playCrystalResonance(phase.frequencyHz);
    if (phaseIdx + 1 < eventData.phases.length) {
      setPhaseIdx((i) => i + 1);
    } else {
      setCompleted(true);
      soundEngine.playHarmonicChord([432, 528, 639]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <div className="bg-slate-950 border border-cyan-400/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              {eventData.chapterLabel}
            </div>
            <h2 className="text-xl font-cinzel font-bold text-slate-100 mt-0.5">{eventData.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{eventData.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveCinematicId(null)}
            className="p-2 min-h-[40px] min-w-[40px] rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
            title="Átugrás"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Cinematic Canvas */}
        <canvas ref={canvasRef} className="w-full h-44 rounded-xl border border-cyan-500/30" />

        {/* Phase Indicator */}
        <div className="flex gap-2">
          {eventData.phases.map((p, idx) => (
            <div
              key={p.title}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                completed || idx < phaseIdx
                  ? 'bg-emerald-400'
                  : idx === phaseIdx
                  ? 'bg-cyan-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {!completed ? (
          <div className="space-y-4">
            <div className="text-xs font-mono text-amber-300 uppercase">{phase.title}</div>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">{phase.narrative}</p>
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-cyan-200">{phase.promptLabel}</span>
              <button
                type="button"
                onClick={handleAdvancePhase}
                className="px-5 py-2.5 min-h-[44px] rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{phase.actionLabel}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex items-center gap-2 text-emerald-300 font-mono text-xs uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>Esemény Teljesítve (+{eventData.rewardResonance} Rezonancia)</span>
            </div>
            <p className="text-base font-cinzel text-slate-100">{eventData.completionText}</p>
            <button
              type="button"
              onClick={() => completeCinematic(eventData.id)}
              className="px-6 py-2.5 min-h-[44px] rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Folytatás a Történetben
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
