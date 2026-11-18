import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  Gamepad2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import { KODVAROS_SIDE_QUESTS } from '../data/kodvarosData';
import { soundEngine } from '../audio/SoundEngine';

interface QuestBoardProps {
  onOpenKodvaros?: () => void;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ onOpenKodvaros }) => {
  const {
    spiralState,
    setActiveMiniGameId,
    claimKodvarosSideQuest,
  } = useGame();

  const [ringFilter, setRingFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [feedback, setFeedback] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const visibleQuests = KODVAROS_SIDE_QUESTS.filter(
    (q) => ringFilter === 'all' || q.ringId === ringFilter
  );
  const solvedCount = spiralState.worldState.kodvarosSolvedSideQuests.length;

  return (
    <section
      aria-label="Kódváros Főtere Küldetéstábla"
      className="mb-8 rounded-2xl border border-cyan-500/35 bg-slate-900/85 p-5 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-300">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span>KÓDVÁROS FŐTERE · KÜLDETÉSTÁBLA (QUEST BOARD)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Három körökön átívelő mellékküldetés — oldd meg őket a város lakóival és a MiniGameSuite moduljaival!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-bold tabular-nums mr-1">
            {solvedCount}/{KODVAROS_SIDE_QUESTS.length} Lezárva
          </span>
          {(['all', 1, 2, 3] as const).map((f) => (
            <button
              key={String(f)}
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setRingFilter(f);
              }}
              className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                ringFilter === f
                  ? 'border-cyan-400 bg-cyan-950/45 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Összes Kör' : `${f}. Kör`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {visibleQuests.map((quest) => {
          const npcDone = spiralState.worldState.kodvarosTalkedInhabitants.includes(quest.requiredTopicId);
          const mgDone = spiralState.worldState.completedMiniGames.includes(quest.requiredMiniGameId);
          const claimed = spiralState.worldState.kodvarosSolvedSideQuests.includes(quest.id);
          const readyToClaim = npcDone && mgDone && !claimed;

          return (
            <div
              key={quest.id}
              className={`rounded-xl border p-4 transition-colors ${
                claimed
                  ? 'border-emerald-500/45 bg-emerald-950/15'
                  : readyToClaim
                  ? 'border-amber-400/50 bg-amber-950/15'
                  : 'border-slate-800 bg-slate-950/80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    {quest.code} · Megbízó: {quest.giverName}
                  </div>
                  <h4 className="text-base font-cinzel font-bold text-slate-100 mt-0.5">
                    {quest.title}
                  </h4>
                </div>
                <span
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                    claimed
                      ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                      : readyToClaim
                      ? 'border-amber-400/50 bg-amber-950/40 text-amber-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  {claimed ? '✓ Teljesítve' : quest.rewardDescription}
                </span>
              </div>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3">
                {quest.summary}
              </p>

              {/* Multi-step Checklist */}
              <div className="space-y-1.5 mb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  {npcDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={npcDone ? 'text-emerald-300 line-through opacity-80' : 'text-slate-300'}>
                    1. {quest.steps[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {mgDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={mgDone ? 'text-emerald-300 line-through opacity-80' : 'text-slate-300'}>
                    2. {quest.steps[1]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {claimed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={claimed ? 'text-emerald-300 line-through opacity-80' : 'text-slate-300'}>
                    3. {quest.steps[2]}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {onOpenKodvaros && !npcDone && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      onOpenKodvaros();
                    }}
                    className="px-3.5 py-2 min-h-[38px] rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lakó felkeresése (Három Kör)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    setActiveMiniGameId(quest.requiredMiniGameId);
                  }}
                  className={`px-3.5 py-2 min-h-[38px] rounded-lg border text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer ${
                    mgDone
                      ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/35 text-emerald-300'
                      : 'bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-slate-950 font-bold'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>{mgDone ? `${quest.miniGameLabel} (Újra)` : quest.miniGameLabel}</span>
                </button>

                {!claimed && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = claimKodvarosSideQuest(quest.id);
                      setFeedback({ id: quest.id, text: res.message, ok: res.success });
                    }}
                    className={`px-4 py-2 min-h-[38px] rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      readyToClaim
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Küldetés Lezárása</span>
                  </button>
                )}
              </div>

              {feedback && feedback.id === quest.id && (
                <div
                  className={`mt-3 p-2.5 rounded-lg border text-xs font-mono ${
                    feedback.ok
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                      : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
