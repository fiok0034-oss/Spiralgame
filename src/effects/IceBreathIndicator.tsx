import React, { useEffect, useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface IceBreathIndicatorProps {
  enabled?: boolean;
}

export const IceBreathIndicator: React.FC<IceBreathIndicatorProps> = ({ enabled = true }) => {
  const [pulsePhase, setPulsePhase] = useState<'idle' | 'beat1' | 'pause' | 'beat2' | 'exhale'>('idle');

  useEffect(() => {
    if (!enabled) return;

    // Cycle timing: 8.5 second breathing rhythm
    const runCycle = () => {
      setPulsePhase('beat1');
      setTimeout(() => {
        setPulsePhase('pause');
        setTimeout(() => {
          setPulsePhase('beat2');
          setTimeout(() => {
            setPulsePhase('exhale');
            setTimeout(() => {
              setPulsePhase('idle');
            }, 2500);
          }, 350);
        }, 180);
      }, 350);
    };

    runCycle();
    const interval = window.setInterval(runCycle, 9000);
    return () => clearInterval(interval);
  }, [enabled]);

  const handleManualBreath = () => {
    soundEngine.playIceBreath();
  };

  return (
    <div
      onClick={handleManualBreath}
      title="A Jég lélegzete (Kattintásra rezonál)"
      className="cursor-pointer group flex items-center gap-2 text-xs font-mono text-cyan-400/80 hover:text-cyan-300 transition-colors select-none"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <span
          className={`absolute inset-0 rounded-full border border-cyan-400/40 transition-all duration-300 ${
            pulsePhase === 'beat1' || pulsePhase === 'beat2'
              ? 'scale-150 border-cyan-300 opacity-90'
              : pulsePhase === 'exhale'
              ? 'scale-125 opacity-40'
              : 'scale-100 opacity-20'
          }`}
        />
        {/* Core pulsing dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full bg-cyan-400 transition-all duration-200 ${
            pulsePhase === 'beat1' || pulsePhase === 'beat2'
              ? 'scale-150 bg-white shadow-[0_0_8px_#22d3ee]'
              : 'scale-100'
          }`}
        />
      </div>
      <span className="hidden sm:inline tracking-wider uppercase text-[11px] opacity-75 group-hover:opacity-100">
        Jéglégzés
      </span>
    </div>
  );
};
