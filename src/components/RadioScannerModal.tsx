import React, { useState, useEffect } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { RadioChannel } from '../types/game';

interface RadioScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: RadioChannel[];
  onChannelDiscovered: (freq: number) => void;
}

export const RadioScannerModal: React.FC<RadioScannerModalProps> = ({
  isOpen,
  onClose,
  channels,
  onChannelDiscovered,
}) => {
  const [currentFreq, setCurrentFreq] = useState<number>(95.4);
  const [activeChannel, setActiveChannel] = useState<RadioChannel | null>(null);
  const [tuningCloseness, setTuningCloseness] = useState<number>(0);
  const [isMorsePlaying, setIsMorsePlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      soundEngine.stopRadioStatic();
      return;
    }

    soundEngine.startRadioStatic(0.5);

    return () => {
      soundEngine.stopRadioStatic();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Check proximity to any channel
    let closestChannel: RadioChannel | null = null;
    let minDiff = 999;

    channels.forEach((ch) => {
      const diff = Math.abs(ch.frequency - currentFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closestChannel = ch;
      }
    });

    if (closestChannel && minDiff < 1.2) {
      const closeness = Math.max(0, 1 - minDiff / 1.2);
      setTuningCloseness(closeness);
      setActiveChannel(closestChannel);
      soundEngine.updateRadioTuning(closeness);

      if (closeness > 0.85 && !(closestChannel as RadioChannel).discovered) {
        onChannelDiscovered((closestChannel as RadioChannel).frequency);
      }
    } else {
      setTuningCloseness(0);
      setActiveChannel(null);
      soundEngine.updateRadioTuning(0.1);
    }
  }, [currentFreq, channels, isOpen, onChannelDiscovered]);

  const handlePlayMorse = () => {
    if (isMorsePlaying) return;
    setIsMorsePlaying(true);
    // Beep out Δ-82 in morse: -.. . .-.. - .-  ---.. ..---
    const pattern = [1, 0, 0, 10, 0, 10, 0, 1, 0, 0, 10, 1, 10, 0, 1, 10, 1, 1, 1, 0, 0, 10, 0, 0, 1, 1, 1];
    let idx = 0;
    const interval = window.setInterval(() => {
      if (idx >= pattern.length) {
        clearInterval(interval);
        setIsMorsePlaying(false);
        return;
      }
      const val = pattern[idx];
      if (val === 10) {
        // pause
      } else {
        soundEngine.playMorseBeep(val === 1);
      }
      idx++;
    }, 120);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📻</span>
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase font-mono">
                ARCHÍV-82 TÁBORI RÁDIÓEGYSÉG
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Rövidhullámú analóg vevő & demodulátor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm font-mono border border-slate-700 rounded px-2 hover:border-slate-500 transition-colors cursor-pointer"
          >
            BEZÁRÁS
          </button>
        </div>

        {/* Frequency Dial Display */}
        <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-5 mb-5 text-center">
          <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase mb-1">
            VÉTELI FREKVENCIA
          </div>
          <div className="text-4xl font-mono font-bold text-cyan-300 tracking-wider tabular-nums drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            {currentFreq.toFixed(1)}{' '}
            <span className="text-sm font-normal text-cyan-500">MHz</span>
          </div>

          {/* Tuner scale bar */}
          <div className="relative mt-4 mb-2 h-6 border-t border-b border-cyan-500/30 flex items-center justify-between px-2 text-[10px] font-mono text-slate-500">
            <span>70.0</span>
            <span>82.0</span>
            <span>104.2</span>
            <span>142.8</span>
            <span>200.0</span>
            <span>432.0</span>
            {/* Needle indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] transition-all"
              style={{
                left: `${Math.min(
                  98,
                  Math.max(2, ((currentFreq - 70) / (450 - 70)) * 100)
                )}%`,
              }}
            />
          </div>

          <input
            type="range"
            min="70.0"
            max="450.0"
            step="0.2"
            value={currentFreq}
            onChange={(e) => setCurrentFreq(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer mt-3"
          />

          {/* Preset quick jump buttons */}
          <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-slate-800">
            {channels.map((ch) => (
              <button
                key={ch.frequency}
                onClick={() => {
                  setCurrentFreq(ch.frequency);
                  soundEngine.playUiClick();
                }}
                className={`text-[11px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  Math.abs(currentFreq - ch.frequency) < 0.5
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ch.frequency} MHz
              </button>
            ))}
          </div>
        </div>

        {/* Signal & Decoded Transmission Section */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[140px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                JEL-ZAJ VISZONY:
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    tuningCloseness > 0.7
                      ? 'bg-emerald-400 animate-pulse'
                      : tuningCloseness > 0.2
                      ? 'bg-amber-400'
                      : 'bg-slate-600'
                  }`}
                />
                <span className="text-xs font-mono text-cyan-300">
                  {Math.round(tuningCloseness * 100)}%
                </span>
              </div>
            </div>

            {activeChannel && tuningCloseness > 0.6 ? (
              <div className="animate-in fade-in duration-300">
                <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
                  [BEJÖVŐ ADÁS] {activeChannel.label}
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-sans italic bg-slate-900/60 p-3 rounded border border-cyan-500/20">
                  {activeChannel.content}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500 italic py-6 text-center">
                [Csak magas frekvenciájú sarki statikus háttérzaj hallható...]
              </div>
            )}
          </div>

          {activeChannel?.type === 'morse' && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={handlePlayMorse}
                disabled={isMorsePlaying}
                className="px-3 py-1.5 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/30 text-cyan-200 text-xs font-mono rounded transition-colors cursor-pointer"
              >
                {isMorsePlaying ? 'Lejátszás...' : '🔊 Morze-kód meghallgatása'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
