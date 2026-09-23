import React, { useState } from 'react';
import { SpiralState, Relic, Achievement, Guardian } from '../types/game';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'guardians' | 'relics' | 'achievements'>('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌀</span>
            <div>
              <h2 className="text-base font-semibold tracking-wider text-cyan-300 uppercase font-mono">
                SPIRÁLPROFIL // TUDATI ÁLLAPOT & KÁNON
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Időhurok állapot: {spiralState.loopState}. iteráció · Visszhangok: {spiralState.echoCount}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 text-xs font-mono border border-slate-700 rounded hover:border-slate-500 transition-colors cursor-pointer"
          >
            BEZÁRÁS
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 bg-slate-950/40 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('profile');
              soundEngine.playUiClick();
            }}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tudati Mutatók
          </button>
          <button
            onClick={() => {
              setActiveTab('guardians');
              soundEngine.playUiClick();
            }}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'guardians'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kilenc Őrző ({spiralState.guardianAwareness}/9)
          </button>
          <button
            onClick={() => {
              setActiveTab('relics');
              soundEngine.playUiClick();
            }}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'relics'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Relikviák ({relics.filter((r) => r.isAcquired).length}/{relics.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('achievements');
              soundEngine.playUiClick();
            }}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Eredmények ({achievements.filter((a) => a.isUnlocked).length}/{achievements.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spiral Awareness */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">SPIRÁL TUDATOSSÁG</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {spiralState.spiralAwareness}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${spiralState.spiralAwareness}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    A tudatosság mértéke, amellyel a játékos érzékeli a nem-lineáris időt.
                  </p>
                </div>

                {/* Memory Integrity */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">EMLÉKEZET INTEGRITÁS</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {spiralState.memoryIntegrity}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${spiralState.memoryIntegrity}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    Kassarah területe: a múlt eseményeinek torzulásmentes megőrzése.
                  </p>
                </div>

                {/* Time Stability */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">IDŐVONAL STABILITÁS</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {spiralState.timeStability}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${spiralState.timeStability}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    A paradoxonok és időszeletek egymásra hatásának egyensúlya.
                  </p>
                </div>

                {/* Reality Integrity */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">VALÓSÁG KOHÉZIÓ</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {spiralState.realityIntegrity}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${spiralState.realityIntegrity}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    Mennyire tartja meg a fizikai világ az alakját a tudat szorításában.
                  </p>
                </div>
              </div>

              {/* Core Philosophy Quote */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-cyan-500/20 text-center">
                <p className="text-sm font-cinzel italic text-cyan-200">
                  „A világ emlékszik rád. Minden mozdulatod nyomot hagy a jégben.”
                </p>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  CSURIK KONRÁD // A SPIRÁL LEHELETE
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guardians' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guardians.map((g) => (
                <div
                  key={g.id}
                  className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between"
                >
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
                    r.isAcquired
                      ? 'bg-slate-950/60 border-cyan-500/30'
                      : 'bg-slate-950/20 border-slate-800/50 opacity-40'
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
                    ach.isUnlocked
                      ? 'bg-cyan-950/30 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-50'
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
