import React from 'react';
import {
  getAudioPreferences,
  updateAudioPreferences,
} from '../audio/audioPreferences';
import { soundEngine } from '../audio/SoundEngine';
import { TTS_ENABLED } from '../config/featureFlags';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: (val: boolean) => void;
  onResetGame: () => void;
  onOpenPrototypeLab?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  reducedMotion,
  onToggleReducedMotion,
  onResetGame,
  onOpenPrototypeLab,
}) => {
  const [prefs, setPrefs] = React.useState(() => getAudioPreferences());
  const [confirmingReset, setConfirmingReset] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPrefs(getAudioPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const setField = <K extends keyof typeof prefs>(key: K, val: (typeof prefs)[K]) => {
    const next = updateAudioPreferences({ [key]: val });
    setPrefs(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-5">
          <h3 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase font-mono">
            Beállítások &amp; Akusztika
          </h3>
          <button
            type="button"
            onClick={() => {
              setConfirmingReset(false);
              onClose();
            }}
            className="text-slate-300 hover:text-white px-3 py-2 min-h-[40px] text-xs font-mono border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
          >
            Bezárás
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span>Némítás (Csend mód)</span>
            <button
              type="button"
              onClick={() => setField('isMuted', !prefs.isMuted)}
              className={`px-3 py-1.5 min-h-[38px] rounded transition-colors font-bold cursor-pointer ${
                prefs.isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {prefs.isMuted ? 'NÉMÍTVA' : 'HANG AKTÍV'}
            </button>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Fő hangerő</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(prefs.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.masterVolume}
              onChange={(e) => setField('masterVolume', Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Channel 1: Ambient */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>1. Atmoszféra &amp; Jéglégzés</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(prefs.ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.ambientVolume}
              onChange={(e) => setField('ambientVolume', Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {TTS_ENABLED && (
            <>
              {/* Channel 2: AI Narration */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>2. AI Narráció</span>
                  <span className="text-cyan-300 tabular-nums">{Math.round(prefs.narrationVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.narrationVolume}
                  onChange={(e) => setField('narrationVolume', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Channel 3: Character Dialogue */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>3. Karakter Párbeszédek</span>
                  <span className="text-cyan-300 tabular-nums">{Math.round(prefs.dialogueVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.dialogueVolume}
                  onChange={(e) => setField('dialogueVolume', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Channel 4: SFX */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>4. Effektusok &amp; Rádió</span>
              <span className="text-cyan-300 tabular-nums">{Math.round(prefs.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.sfxVolume}
              onChange={(e) => setField('sfxVolume', Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {TTS_ENABLED && (
            <>
              {/* Subtitles Toggle */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <div>Magyar feliratok</div>
                  <div className="text-[10px] text-slate-500">Időzített felirat narrációhoz és párbeszédekhez</div>
                </div>
                <button
                  type="button"
                  onClick={() => setField('subtitlesEnabled', !prefs.subtitlesEnabled)}
                  className={`px-3 py-1.5 min-h-[38px] rounded transition-colors font-bold cursor-pointer ${
                    prefs.subtitlesEnabled
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {prefs.subtitlesEnabled ? 'BEKAPCSOLVA' : 'KIKAPCSOLVA'}
                </button>
              </div>

              {/* Auto-Narrate Scenes Toggle */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <div>Automatikus jelenet-hang</div>
                  <div className="text-[10px] text-slate-500">AI felolvasás indítása jelenetváltáskor</div>
                </div>
                <button
                  type="button"
                  onClick={() => setField('autoNarrateScenes', !prefs.autoNarrateScenes)}
                  className={`px-3 py-1.5 min-h-[38px] rounded transition-colors font-bold cursor-pointer ${
                    prefs.autoNarrateScenes
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {prefs.autoNarrateScenes ? 'BEKAPCSOLVA' : 'KIKAPCSOLVA'}
                </button>
              </div>
            </>
          )}

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <div>Csökkentett mozgás</div>
              <div className="text-[10px] text-slate-500">Hóvihar és kameramozgás kikapcsolása</div>
            </div>
            <button
              type="button"
              onClick={() => onToggleReducedMotion(!reducedMotion)}
              className={`px-3 py-1.5 min-h-[38px] rounded transition-colors font-bold cursor-pointer ${
                reducedMotion
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {reducedMotion ? 'BEKAPCSOLVA' : 'KIKAPCSOLVA'}
            </button>
          </div>

          {onOpenPrototypeLab && (
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-cyan-500/30">
              <div>
                <div className="text-cyan-300">
                  {TTS_ENABLED ? 'Térbeli & AI hang prototípusok' : 'Térbeli hang & 3D prototípusok'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {TTS_ENABLED ? 'Phase 1 Labor (8 tesztmodul)' : 'Phase 1 Labor (5 tesztmodul)'}
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPrototypeLab}
                className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
              >
                Megnyitás
              </button>
            </div>
          )}

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
