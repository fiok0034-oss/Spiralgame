import React, { useState } from 'react';
import { SpiralState, Relic, Achievement, Guardian } from '../types/game';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';

interface SpiralProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  spiralState: SpiralState;
  relics: Relic[];
  achievements: Achievement[];
  guardians: Guardian[];
}

export const SpiralProfileModal: React.FC<SpiralProfileModalProps> = ({
  isOpen,
  onClose,
  spiralState,
  relics,
  achievements,
  guardians,
}) => {
  const { echoes } = useGame();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'personality' | 'echoes' | 'guardians' | 'relics' | 'achievements'
  >('profile');

  if (!isOpen) return null;

  const p = spiralState.personality;
  const maxTrait = Math.max(4, p.analytical, p.intuitive, p.preserver, p.releaser, p.explorer, p.architect);

  const traits = [
    { label: 'Tudományos Elemző', value: p.analytical, color: 'bg-cyan-400' },
    { label: 'Rezonáns Intuitív', value: p.intuitive, color: 'bg-indigo-400' },
    { label: 'Kassarah (Megőrző)', value: p.preserver, color: 'bg-sky-400' },
    { label: 'Ir-Haya (Elengedő)', value: p.releaser, color: 'bg-purple-400' },
    { label: 'Mélyre Ásó Felfedező', value: p.explorer, color: 'bg-amber-400' },
    { label: 'Kódvárosi Építész', value: p.architect, color: 'bg-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-5">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold tracking-wider text-cyan-300 uppercase font-mono">
              SPIRÁLPROFIL · TUDATI ÁLLAPOT & VISSZHANGOK
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5 tabular-nums">
              {spiralState.loopState}. Időhurok · Rezonancia: {spiralState.resonancePoints} · Befejezések: {spiralState.completedEndings.length}/4
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white px-3 py-2 min-h-[40px] text-xs font-mono border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
          >
            BEZÁRÁS
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 bg-slate-950/40 border-b border-slate-800 text-xs font-mono overflow-x-auto">
          {[
            { id: 'profile', label: 'Tudati Mutatók' },
            { id: 'personality', label: 'Belső Iránytű' },
            { id: 'echoes', label: `Visszhangok (${echoes.length})` },
            { id: 'guardians', label: `Kilenc Őrző (${spiralState.guardianAwareness}/9)` },
            { id: 'relics', label: `Relikviák (${relics.filter((r) => r.isAcquired).length}/${relics.length})` },
            { id: 'achievements', label: `Eredmények (${achievements.filter((a) => a.isUnlocked).length}/${achievements.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                soundEngine.playUiClick();
              }}
              className={`px-3 py-1.5 min-h-[36px] rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">SPIRÁL TUDATOSSÁG</span>
                    <span className="text-cyan-300 font-bold tabular-nums">{spiralState.spiralAwareness}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${spiralState.spiralAwareness}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">EMLÉKEZET INTEGRITÁS</span>
                    <span className="text-cyan-300 font-bold tabular-nums">{spiralState.memoryIntegrity}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${spiralState.memoryIntegrity}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">IDŐVONAL STABILITÁS</span>
                    <span className="text-cyan-300 font-bold tabular-nums">{spiralState.timeStability}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full transition-all duration-500" style={{ width: `${spiralState.timeStability}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">VALÓSÁG KOHÉZIÓ</span>
                    <span className="text-cyan-300 font-bold tabular-nums">{spiralState.realityIntegrity}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${spiralState.realityIntegrity}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-cyan-500/20 text-center">
                <p className="text-sm font-cinzel italic text-cyan-200">
                  „A világ emlékszik rád. Minden mozdulatod nyomot hagy a jégben.”
                </p>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  CSURIK KONRÁD · A SPIRÁL LEHELETE
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-4">
              <p className="text-xs font-mono text-slate-400">
                A játékbeli döntéseid és filozófiai válaszaid alakítják, hogyan szólalnak meg az Őrzők és a Végtelen:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {traits.map((tr) => (
                  <div key={tr.label} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-slate-200">{tr.label}</span>
                      <span className="text-cyan-300 font-bold tabular-nums">{tr.value}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${tr.color} rounded-full transition-all`}
                        style={{ width: `${Math.min(100, Math.round((tr.value / maxTrait) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'echoes' && (
            <div className="space-y-3">
              {echoes.length === 0 ? (
                <p className="text-xs font-mono text-slate-500">
                  Még nem születtek visszhangok. Döntéseid a későbbi fejezetekben visszaköszönnek majd!
                </p>
              ) : (
                echoes.map((ec) => (
                  <div key={ec.id} className="p-4 rounded-xl border border-cyan-500/30 bg-slate-950/80 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-cyan-400 uppercase">
                      <span>{ec.category} visszhang</span>
                      <span>Forrás: {ec.originSceneId}</span>
                    </div>
                    <div className="text-sm font-cinzel font-bold text-slate-100">{ec.title}</div>
                    <p className="text-xs text-slate-400">{ec.description}</p>
                    <p className="text-xs font-mono text-emerald-300 pt-1">{ec.manifestationText}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'guardians' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guardians.map((g) => (
                <div key={g.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-cyan-400 font-bold">{g.symbol}</span>
                      <span className="text-slate-500 text-[10px]">Őrző #{g.id}</span>
                    </div>
                    <h4 className="text-sm font-cinzel font-bold text-slate-100">{g.name}</h4>
                    <div className="text-xs text-cyan-300/80 font-mono mt-0.5">{g.title}</div>
                    <p className="text-xs text-slate-400 mt-2">{g.philosophicalDomain}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300 italic font-serif">
                    {g.dialoguePreview}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'relics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relics.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border transition-all ${
                    r.isAcquired ? 'bg-slate-950/60 border-cyan-500/30' : 'bg-slate-950/20 border-slate-800/50 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{r.iconSymbol}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{r.name}</h4>
                      <div className="text-[11px] font-mono text-cyan-400">{r.origin}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {r.isAcquired ? r.description : 'Még nem lelted fel az időrétegekben.'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ach.isUnlocked ? 'bg-cyan-950/30 border-cyan-400/40' : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={ach.isUnlocked ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      {ach.isUnlocked ? '✓ FELOLDVA' : 'LAKAT ALATT'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{ach.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
