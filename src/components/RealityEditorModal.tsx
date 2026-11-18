import React from 'react';
import { Sliders, Clock, ArrowUpDown, DoorOpen, Eye, Sparkles, X } from 'lucide-react';
import { useGame } from '../game/GameContext';

interface RealityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealityEditorModal: React.FC<RealityEditorModalProps> = ({ isOpen, onClose }) => {
  const { spiralState, abilities, artifacts, updateRealityWarp, addResonance } = useGame();

  if (!isOpen) return null;

  const warp = spiralState.realityWarp;
  const hasNinthGaze = (abilities.find((a) => a.id === 'ab_ninth_gaze')?.level || 0) > 0;
  const hasGravityAxis = (abilities.find((a) => a.id === 'ab_gravity_axis')?.level || 0) > 0;
  const hasBeacon = Boolean(artifacts.find((a) => a.id === 'art_harmonic_beacon')?.isUnlocked);
  const fullAccess =
    hasNinthGaze ||
    hasBeacon ||
    spiralState.consciousnessDepth >= 3 ||
    spiralState.loopState > 1;
  const basicAccess = fullAccess || hasGravityAxis || spiralState.spiralAwareness >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4 bg-slate-950/70">
          <div>
            <h2 className="text-base font-cinzel font-bold tracking-wider text-purple-300 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>VALÓSÁG-SZERKESZTŐ // IDŐ & GRAVITÁCIÓ</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Hozzáférés: {fullAccess ? 'Teljes (Kilencedik Réteg)' : basicAccess ? 'Részleges Szinkron' : 'Előnézet (Növeld a Spirál Tudatosságot 20%-ra)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 min-h-[40px] text-xs font-mono text-slate-300 hover:text-white border border-slate-700 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Bezárás</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Timeline Layer Switcher */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase">
              <Clock className="w-4 h-4" />
              <span>Aktív Időréteg Átváltása</span>
            </div>
            <p className="text-xs text-slate-400">
              Áthelyezi a megfigyelő tudatát az 1982-es bázis, az 1983-as labor vagy az Időtlen Kódváros rétege között.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['1982', '1983', 'timeless'] as const).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  disabled={!basicAccess}
                  onClick={() => updateRealityWarp({ timelineLayer: layer })}
                  className={`py-2.5 min-h-[40px] rounded-lg border text-xs font-mono font-semibold cursor-pointer ${
                    warp.timelineLayer === layer
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500/40'
                  } ${!basicAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {layer === '1982' ? '1982 · Bázis' : layer === '1983' ? '1983 · Labor' : 'Időtlen Réteg'}
                </button>
              ))}
            </div>
          </div>

          {/* Gravity Inversion & Hidden Doors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase">
                <ArrowUpDown className="w-4 h-4" />
                <span>Gravitációs Ellentengely</span>
              </div>
              <p className="text-xs text-slate-400">
                Megfordítja a le és fel irányát — Kódváros mennyezeti titkos ajtói elérhetővé válnak.
              </p>
              <button
                type="button"
                disabled={!basicAccess}
                onClick={() => updateRealityWarp({ gravityInverted: !warp.gravityInverted })}
                className={`w-full py-2 min-h-[40px] rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                  warp.gravityInverted
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {warp.gravityInverted ? 'Fordított Gravitáció: AKTÍV' : 'Normál Gravitáció (Átkapcsolás)'}
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 uppercase">
                <DoorOpen className="w-4 h-4" />
                <span>Rejtett Átjárók Áthidalása</span>
              </div>
              <p className="text-xs text-slate-400">
                Felfedi a jelenetekben elrejtett interakciós réseket és szinkronizálja az Őrző-kapukat.
              </p>
              <button
                type="button"
                disabled={!basicAccess}
                onClick={() => updateRealityWarp({ hiddenDoorsBridged: !warp.hiddenDoorsBridged })}
                className={`w-full py-2 min-h-[40px] rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                  warp.hiddenDoorsBridged
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {warp.hiddenDoorsBridged ? 'Átjárók Láthatók: BE' : 'Rejtett Átjárók Megnyitása'}
              </button>
            </div>
          </div>

          {/* Echo Permeability & Kodvaros Symmetry */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1.5 uppercase">
                <Eye className="w-4 h-4" /> Visszhang-áteresztő Képesség
              </span>
              <span className="text-cyan-300 font-bold tabular-nums">{warp.echoPermeability}. Szint</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              disabled={!basicAccess}
              value={warp.echoPermeability}
              onChange={(e) => updateRealityWarp({ echoPermeability: Number(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 mb-2">Kódváros Geometriai Szimmetria</div>
              <div className="grid grid-cols-3 gap-2">
                {(['order', 'paradox', 'mirror'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={!fullAccess && mode === 'mirror'}
                    onClick={() => updateRealityWarp({ kodvarosSymmetry: mode })}
                    className={`py-2 min-h-[38px] rounded-lg border text-xs font-mono cursor-pointer ${
                      warp.kodvarosSymmetry === mode
                        ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {mode === 'order' ? 'Rend' : mode === 'paradox' ? 'Paradoxon' : 'Tükörkép'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!fullAccess && (
            <div className="bg-purple-950/25 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono text-purple-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Szerezd meg a Kilencedik Tekintet képességet vagy lépj a 3. Tudatmélységbe a teljes Tükör-szimmetriához.</span>
              </span>
              {spiralState.resonancePoints >= 35 && (
                <button
                  type="button"
                  onClick={() => addResonance(0)}
                  className="hidden"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
