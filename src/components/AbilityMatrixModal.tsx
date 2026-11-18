import React, { useState } from 'react';
import { Sparkles, ArrowUpCircle, Link2, CheckCircle2, Lock, X } from 'lucide-react';
import { useGame } from '../game/GameContext';
import { ABILITY_SYNERGIES } from '../data/expansionData';

interface AbilityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbilityMatrixModal: React.FC<AbilityMatrixModalProps> = ({ isOpen, onClose }) => {
  const { abilities, spiralState, upgradeAbility, triggerSynergy } = useGame();
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const unlockedCount = abilities.filter((a) => a.level > 0).length;

  const handleSelectForSynergy = (id: string) => {
    if (!slotA || slotA === id) {
      setSlotA(slotA === id ? null : id);
      return;
    }
    setSlotB(id);
  };

  const handleSynthesize = () => {
    if (!slotA || !slotB) {
      setFeedback('Válassz két feloldott képességet a szinergia-kapcsolathoz!');
      return;
    }
    const res = triggerSynergy(slotA, slotB);
    setFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 bg-slate-950/70">
          <div>
            <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
              SPIRÁL-KÉPESSÉGEK MÁTRIXA (12 TÖRVÉNY)
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Aktív képességek: {unlockedCount}/12 · Elérhető Rezonancia:{' '}
              <span className="text-amber-300 font-bold tabular-nums">{spiralState.resonancePoints}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Synergy Combiner Bench */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4" />
                  <span>Képesség-szinergia Összekapcsoló ({spiralState.worldState.unlockedSynergies.length}/{ABILITY_SYNERGIES.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kattints két feloldott képességre alább, majd hozd létre közöttük a rezonáns hidat!
                </p>
              </div>
              <button
                type="button"
                onClick={handleSynthesize}
                className="px-4 py-2 min-h-[40px] rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase cursor-pointer whitespace-nowrap"
              >
                Szinergia Aktiválása
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/70">
                1. Képesség: <span className="text-cyan-300 font-semibold">{abilities.find((a) => a.id === slotA)?.name || 'Válassz a listából'}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/70">
                2. Képesség: <span className="text-cyan-300 font-semibold">{abilities.find((a) => a.id === slotB)?.name || 'Válassz a listából'}</span>
              </div>
            </div>

            {feedback && (
              <div className="text-xs font-mono text-amber-200 bg-amber-950/30 border border-amber-500/40 rounded-lg p-2.5">
                {feedback}
              </div>
            )}

            {/* Discovered Synergies */}
            {spiralState.worldState.unlockedSynergies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {ABILITY_SYNERGIES.filter((s) => spiralState.worldState.unlockedSynergies.includes(s.id)).map((syn) => (
                  <div key={syn.id} className="p-3 rounded-xl border border-emerald-500/35 bg-emerald-950/20 text-xs">
                    <div className="font-mono font-bold text-emerald-300">{syn.title}</div>
                    <p className="text-slate-300 mt-1">{syn.secretRevealed}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 12 Abilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {abilities.map((ab) => {
              const isUnlocked = ab.level > 0;
              const isSelected = slotA === ab.id || slotB === ab.id;
              const cost = ab.level === 0 ? 35 : 20 * ab.level;

              return (
                <div
                  key={ab.id}
                  onClick={() => isUnlocked && handleSelectForSynergy(ab.id)}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/20 cursor-pointer'
                      : isUnlocked
                      ? 'border-cyan-500/30 bg-slate-950/75 hover:border-cyan-400/70 cursor-pointer'
                      : 'border-slate-800 bg-slate-950/40 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-cyan-400 font-bold">{ab.symbol} · {ab.domain.toUpperCase()}</span>
                      <span className={isUnlocked ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                        {isUnlocked ? `${ab.level}/${ab.maxLevel}. szint` : 'Zárolt'}
                      </span>
                    </div>
                    <h4 className="text-sm font-cinzel font-bold text-slate-100">{ab.name}</h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ab.description}</p>
                    <p className="text-[11px] font-mono text-cyan-300/80 mt-2">
                      {isUnlocked ? ab.usageEffect : `Feloldás: ${ab.unlockHint}`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {isSelected ? 'Szinergiához kijelölve' : isUnlocked ? 'Kattints a kijelöléshez' : ''}
                    </span>

                    {ab.level < ab.maxLevel ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const res = upgradeAbility(ab.id);
                          setFeedback(res.message);
                        }}
                        className="px-3 py-1.5 min-h-[36px] rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono text-cyan-200 cursor-pointer inline-flex items-center gap-1"
                      >
                        {isUnlocked ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isUnlocked ? `Fejlesztés (${cost})` : `Feloldás (${cost})`}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Maximális
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
