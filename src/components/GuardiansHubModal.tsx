import React, { useState } from 'react';
import { CheckCircle2, Lock, Sparkles, Compass, Play, X } from 'lucide-react';
import { useGame } from '../game/GameContext';
import { GUARDIANS_LIST } from '../data/storyData';
import { GUARDIAN_DIMENSIONS } from '../data/expansionData';
import { GUARDIAN_REALMS, REALM_CROSS_EFFECTS } from '../data/guardianRealmsData';
import { MiniGameRouter } from './MiniGameSuite';
import { soundEngine } from '../audio/SoundEngine';

interface GuardiansHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuardiansHubModal: React.FC<GuardiansHubModalProps> = ({ isOpen, onClose }) => {
  const {
    guardianProgress,
    abilities,
    spiralState,
    jumpToChapter,
    completeGuardianQuest,
    completeGuardianMiniGame,
    makeGuardianPhilosophyChoice,
    unlockGuardianSecret,
    setActiveCinematicId,
  } = useGame();

  const [selectedGuardianId, setSelectedGuardianId] = useState<number>(1);
  const [showMiniGame, setShowMiniGame] = useState<boolean>(false);

  if (!isOpen) return null;

  const guardian = GUARDIANS_LIST.find((g) => g.id === selectedGuardianId) || GUARDIANS_LIST[0];
  const dim = GUARDIAN_DIMENSIONS.find((d) => d.guardianId === selectedGuardianId) || GUARDIAN_DIMENSIONS[0];
  const realm = GUARDIAN_REALMS.find((r) => r.guardianId === selectedGuardianId) || GUARDIAN_REALMS[0];
  const canTravelDirect = spiralState.worldState.leventeChapterCompleted;
  const echoesCount = spiralState.worldState.collectedNineEchoIds.length;
  const observerCount = spiralState.worldState.collectedObserverClueIds.length;
  const prog = guardianProgress[selectedGuardianId] || {
    encountered: true,
    completedQuestIds: [],
    miniGameCleared: false,
    philosophyChoiceId: null,
    secretUnlocked: false,
    realmCompleted: false,
  };

  const reqAbility = abilities.find((a) => a.id === dim.requiredAbilityId);
  const hasReqAbility = Boolean(reqAbility && reqAbility.level > 0);
  const completedCount = Object.values(guardianProgress).filter((p) => p.realmCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 bg-slate-950/70">
          <div>
            <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
              A KILENC ŐRZŐ BIRODALMAI · DIMENZIÓ-KAPUK
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
              Befejezett birodalmak: {completedCount}/9 · Kilenc Visszhang: {echoesCount}/9 · Megfigyelő nyomai: {observerCount}/9
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

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left 9 Guardians Selector */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-3.5 space-y-2">
            {GUARDIANS_LIST.map((g) => {
              const gp = guardianProgress[g.id];
              const isSelected = g.id === selectedGuardianId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGuardianId(g.id);
                    setShowMiniGame(false);
                    soundEngine.playUiClick();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/35'
                      : 'border-slate-800 bg-slate-950/70 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span style={{ color: g.colorHex }} className="font-bold">
                      {g.symbol} · #{g.id}
                    </span>
                    <span className={gp?.realmCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                      {gp?.realmCompleted
                        ? '✓ Teljesítve'
                        : `${gp?.completedQuestIds.length || 0}/3 küldetés`}
                    </span>
                  </div>
                  <div className="text-sm font-cinzel font-bold text-slate-100 mt-0.5">{g.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{g.title}</div>
                </button>
              );
            })}
          </div>

          {/* Right Guardian Dimension Workspace */}
          <div className="lg:col-span-8 overflow-y-auto p-5 bg-slate-950/40 space-y-5">
            {/* Dimension Title Banner */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider" style={{ color: guardian.colorHex }}>
                    {guardian.symbol} · {dim.atmosphereTag}
                  </div>
                  <h3 className="text-xl font-cinzel font-bold text-slate-100 mt-0.5">
                    {dim.dimensionName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canTravelDirect ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playRealmSoundscape(selectedGuardianId);
                        onClose();
                        jumpToChapter('chapter6_guardians', realm.entrySceneId);
                      }}
                      className="px-3.5 py-2 min-h-[40px] rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Belépés a Bejárható Birodalomba →</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-400 inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bejárás Levente kulcsa után nyílik</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setActiveCinematicId(dim.cinematicEventId);
                    }}
                    className="px-3.5 py-2 min-h-[40px] rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-xs font-mono text-purple-200 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Esemény</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mt-3">{dim.storyArc}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 tabular-nums">
                <span>Bejárt zónák: {(prog.visitedZones || []).length}/6</span>
                <span>·</span>
                <span className={prog.echoCoreCollected ? 'text-amber-300' : ''}>
                  Visszhang-mag ({realm.echoCoreTitle}): {prog.echoCoreCollected ? '✓ Begyűjtve' : 'Hiányzik'}
                </span>
                <span>·</span>
                <span className={prog.observerClueFound ? 'text-purple-300' : ''}>
                  Megfigyelő nyoma: {prog.observerClueFound ? '✓ Észlelve' : 'Rejtett'}
                </span>
              </div>
              {REALM_CROSS_EFFECTS.filter(
                (fx) =>
                  fx.targetGuardianId === selectedGuardianId &&
                  Boolean(
                    fx.requiresEchoId &&
                      spiralState.worldState.collectedNineEchoIds.includes(fx.requiresEchoId)
                  )
              ).map((fx) => (
                <div
                  key={fx.id}
                  className="mt-2.5 p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/35 text-xs text-amber-200 font-mono"
                >
                  ✦ Aktív birodalomközi hatás: {fx.visualShiftText}
                </div>
              ))}
            </div>

            {/* 3 Complex Quests */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                Küldetések ({prog.completedQuestIds.length}/3)
              </h4>
              {dim.quests.map((q) => {
                const done = prog.completedQuestIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      done
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/80'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        <span>{q.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
                    </div>
                    {q.objectiveType === 'interact' && !done && (
                      <button
                        type="button"
                        onClick={() => completeGuardianQuest(selectedGuardianId, q.id)}
                        className="px-3.5 py-2 min-h-[38px] rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono text-cyan-200 cursor-pointer whitespace-nowrap"
                      >
                        Interakció Végrehajtása
                      </button>
                    )}
                    {q.objectiveType === 'minigame' && (
                      <button
                        type="button"
                        onClick={() => setShowMiniGame((s) => !s)}
                        className="px-3.5 py-2 min-h-[38px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-xs font-mono text-amber-200 cursor-pointer whitespace-nowrap"
                      >
                        {showMiniGame ? 'Minijáték Elrejtése' : prog.miniGameCleared ? 'Próba Újrajátszása' : 'Dimenzió-puzzle Indítása'}
                      </button>
                    )}
                    {q.objectiveType === 'philosophy' && (
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        {done ? '✓ Megválaszolva' : 'Válaszolj alább'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Embedded Unique Guardian Mini-Game */}
            {showMiniGame && (
              <MiniGameRouter
                miniGameId={dim.miniGameId}
                onComplete={() => completeGuardianMiniGame(selectedGuardianId)}
                onClose={() => setShowMiniGame(false)}
              />
            )}

            {/* Philosophical Trial */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-mono text-cyan-300 uppercase">Filozófiai Próbája</div>
              <p className="text-sm font-cinzel italic text-slate-100">{dim.philosophicalQuestion}</p>
              <div className="space-y-2">
                {dim.philosophicalChoices.map((ch) => {
                  const chosen = prog.philosophyChoiceId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => makeGuardianPhilosophyChoice(selectedGuardianId, ch.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                        chosen
                          ? 'border-emerald-400 bg-emerald-950/30'
                          : 'border-slate-700 bg-slate-950/80 hover:border-cyan-400/60'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-100">{ch.label}</div>
                      {chosen && (
                        <div className="text-xs font-mono text-emerald-300 mt-1.5">
                          Következmény: {ch.consequenceText}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secret Location & Reward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Titkos Helyszín
                  </span>
                  {!hasReqAbility && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </div>
                <div className="text-sm font-cinzel font-bold text-slate-100">{dim.secretLocationTitle}</div>
                {prog.secretUnlocked ? (
                  <p className="text-xs text-emerald-200/90 leading-relaxed">{dim.secretLocationText}</p>
                ) : (
                  <>
                    <p className="text-xs text-slate-400">
                      Szükséges képesség: <span className="text-cyan-300">{reqAbility?.name || dim.requiredAbilityId}</span>
                    </p>
                    <button
                      type="button"
                      disabled={!hasReqAbility}
                      onClick={() => unlockGuardianSecret(selectedGuardianId)}
                      className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-mono cursor-pointer ${
                        hasReqAbility
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Titkos Szentély Feltárása
                    </button>
                  </>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Jutalom & Történeti Hatás
                </div>
                <div className="text-sm font-semibold text-slate-100">{dim.rewardTitle}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{dim.consequenceTag}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
