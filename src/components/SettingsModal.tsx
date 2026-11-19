import React from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: (val: boolean) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  reducedMotion,
  onToggleReducedMotion,
  onResetGame,
}) => {
  const [master, setMaster] = React.useState(soundEngine.masterVolume);
  const [ambient, setAmbient] = React.useState(soundEngine.ambientVolume);
  const [sfx, setSfx] = React.useState(soundEngine.sfxVolume);
  const [isMuted, setIsMuted] = React.useState(soundEngine.isMuted);
  const [confirmingReset, setConfirmingReset] = React.useState(false);

  if (!isOpen) return null;

  const handleMasterChange = (val: number) => {
    setMaster(val);
    soundEngine.setVolumes(val, ambient, sfx);
  };

  const handleAmbientChange = (val: number) => {
    setAmbient(val);
    soundEngine.setVolumes(master, val, sfx);
  };

  const handleSfxChange = (val: number) => {
    setSfx(val);
    soundEngine.setVolumes(master, ambient, val);
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase font-mono">
              BEÁLLÍTÁSOK & AKUSZTIKA
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmingReset(false);
              onClose();
            }}
            className="text-slate-300 hover:text-white px-3 py-2 min-h-[40px] text-xs font-mono border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
          >
            BEZÁRÁS
          </button>
        </div>

        <div className="space-y-5 text-xs font-mono">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span>NÉMÍTÁS (CSEND MÓD)</span>
            <button
              onClick={handleMuteToggle}
              className={`px-3 py-1 rounded transition-colors font-bold cursor-pointer ${
                isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? 'NÉMÍTVA' : 'HANG AKTÍV'}
            </button>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>FŐ HANGERŐ</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(master * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={master}
              onChange={(e) => handleMasterChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Ambient / Drone Volume */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>ATMOSZFÉRA & JÉGLÉGZÉS</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(ambient * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambient}
              onChange={(e) => handleAmbientChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>EFFEKTUSOK & RÁDIÓ</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(sfx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfx}
              onChange={(e) => handleSfxChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <div>CSÖKKENTETT MOZGÁS</div>
              <div className="text-[10px] text-slate-500">Hóvihar és kameramozgás kikapcsolása</div>
            </div>
            <button
              onClick={() => onToggleReducedMotion(!reducedMotion)}
              className={`px-3 py-1 rounded transition-colors font-bold cursor-pointer ${
                reducedMotion
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {reducedMotion ? 'BEKAPCSOLVA' : 'KIKAPCSOLVA'}
            </button>
          </div>

          {/* Reset Save Data */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-400 text-[11px]">Teljes idővonal visszaállítása:</span>
              {!confirmingReset && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    setConfirmingReset(true);
                  }}
                  className="px-3.5 py-2 min-h-[40px] bg-rose-950/60 hover:bg-rose-900 border border-rose-500/35 text-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Újraindítás
                </button>
              )}
            </div>
            {confirmingReset && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 space-y-2.5">
                <p className="text-[11px] text-rose-200 leading-relaxed">
                  Biztosan törlöd a teljes mentést és alaphelyzetbe állítod a Spirál idővonalát? Minden feloldott emlék, birodalom és befejezés törlődik.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setConfirmingReset(false);
                    }}
                    className="px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                  >
                    Mégse
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingReset(false);
                      onResetGame();
                      onClose();
                    }}
                    className="px-3 py-2 min-h-[40px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Igen, teljes törlés
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
