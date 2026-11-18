import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import { KODVAROS_INHABITANTS } from '../data/kodvarosData';
import { PersonalityProfile } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';

const TRAIT_LABELS: Record<keyof PersonalityProfile, string> = {
  analytical: 'Logikus / Elemző',
  intuitive: 'Intuitív',
  preserver: 'Emlékőrző',
  releaser: 'Elengedő',
  explorer: 'Felfedező',
  architect: 'Építész',
};

interface CitizenInteractionProps {
  ringId: 1 | 2 | 3;
  isKodvarosUnlocked: boolean;
  preferredNpcId?: string | null;
  personality?: PersonalityProfile;
}

export const CitizenInteraction: React.FC<CitizenInteractionProps> = ({
  ringId,
  isKodvarosUnlocked,
  preferredNpcId,
  personality: externalPersonality,
}) => {
  const { spiralState, talkToKodvarosTopic } = useGame();
  const activePersonality = externalPersonality || spiralState.personality;

  const ringNpcs = KODVAROS_INHABITANTS.filter((n) => n.ringId === ringId);
  const [selectedNpcId, setSelectedNpcId] = useState<string>(
    preferredNpcId && ringNpcs.some((n) => n.id === preferredNpcId)
      ? preferredNpcId
      : ringNpcs[0]?.id || ''
  );
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [dialogueStyleFilter, setDialogueStyleFilter] = useState<'all' | 'analytical' | 'intuitive'>('all');

  useEffect(() => {
    if (preferredNpcId && ringNpcs.some((n) => n.id === preferredNpcId)) {
      setSelectedNpcId(preferredNpcId);
      setActiveTopicId(null);
      setActiveBranchId(null);
    } else if (!ringNpcs.some((n) => n.id === selectedNpcId) && ringNpcs[0]) {
      setSelectedNpcId(ringNpcs[0].id);
      setActiveTopicId(null);
      setActiveBranchId(null);
    }
  }, [ringId, preferredNpcId]);

  const selectedNpc = ringNpcs.find((n) => n.id === selectedNpcId) || ringNpcs[0];

  const chosenChoiceSet = new Set(Object.values(spiralState.choiceHistory));
  const activeReactions = (selectedNpc?.decisionReactions || []).filter((r) =>
    chosenChoiceSet.has(r.requiresChoiceId)
  );
  const activeTopic = selectedNpc?.topics.find((t) => t.id === activeTopicId) || null;

  // Live evaluation of spiralState.personality against every branch on every render
  const sortedTraits = useMemo(() => {
    return (Object.entries(activePersonality) as [
      keyof PersonalityProfile,
      number
    ][]).sort((a, b) => b[1] - a[1]);
  }, [activePersonality]);

  const topTrait = sortedTraits[0];
  const logicalScore = activePersonality.analytical || 0;
  const intuitiveScore = activePersonality.intuitive || 0;
  const dominantStyle: 'Logikus' | 'Intuitív' | 'Kiegyensúlyozott' =
    logicalScore > intuitiveScore
      ? 'Logikus'
      : intuitiveScore > logicalScore
      ? 'Intuitív'
      : 'Kiegyensúlyozott';

  const evaluatedBranches = useMemo(() => {
    if (!activeTopic?.personalityBranches) return [];

    return activeTopic.personalityBranches
      .map((branch) => {
        const playerVal = activePersonality[branch.trait] || 0;
        const unlocked = playerVal >= branch.minValue;
        const mastery = playerVal >= branch.minValue + 2;
        const matchesTopTrait = branch.trait === topTrait[0];
        const resolved = spiralState.worldState.kodvarosTalkedInhabitants.includes(branch.id);
        return {
          ...branch,
          playerVal,
          unlocked,
          mastery,
          matchesTopTrait,
          resolved,
        };
      })
      .filter((b) => {
        if (dialogueStyleFilter === 'all') return true;
        if (dialogueStyleFilter === 'analytical') {
          return b.trait === 'analytical' || b.trait === 'architect' || b.trait === 'preserver';
        }
        return b.trait === 'intuitive' || b.trait === 'explorer' || b.trait === 'releaser';
      })
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.matchesTopTrait !== b.matchesTopTrait) return a.matchesTopTrait ? -1 : 1;
        return b.playerVal - a.playerVal;
      });
  }, [activeTopic, activePersonality, topTrait, dialogueStyleFilter, spiralState.worldState.kodvarosTalkedInhabitants]);

  const activeBranch =
    activeTopic?.personalityBranches?.find((b) => b.id === activeBranchId) || null;

  if (!selectedNpc) return null;

  return (
    <div className="space-y-4">
      {/* Player SpiralState Personality Evaluator Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/85 border border-slate-800 space-y-2 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Spirál-profil:</span>
            <span className="text-cyan-300 font-bold">
              {TRAIT_LABELS[topTrait[0]]} ({topTrait[1]})
            </span>
          </div>
          <div className="px-2 py-0.5 rounded bg-slate-950 border border-cyan-500/30 text-amber-300 tabular-nums">
            Logikus ({logicalScore}) vs. Intuitív ({intuitiveScore}) · Irány: {dominantStyle}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 tabular-nums">
          {sortedTraits.map(([k, val]) => (
            <span
              key={k}
              className={`px-2 py-0.5 rounded border ${
                k === topTrait[0]
                  ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              {TRAIT_LABELS[k]}: {val}
            </span>
          ))}
        </div>
      </div>

      {/* Citizen Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ringNpcs.map((npc) => {
          const active = npc.id === selectedNpc.id;
          const met = spiralState.worldState.kodvarosTalkedInhabitants.includes(npc.id);
          return (
            <button
              key={npc.id}
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedNpcId(npc.id);
                setActiveTopicId(null);
                setActiveBranchId(null);
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                active
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/70 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>{npc.symbol}</span>
                {met && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-sm font-cinzel font-bold text-slate-100 mt-1">{npc.name}</div>
              <div className="text-[11px] text-slate-400">{npc.role}</div>
            </button>
          );
        })}
      </div>

      {/* Main Dialogue Panel */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
        <div>
          <div className="text-xs font-mono text-cyan-300">{selectedNpc.origin}</div>
          <p className="text-sm text-slate-200 italic mt-1.5 leading-relaxed">
            {selectedNpc.greeting}
          </p>
        </div>

        {/* Dynamic Reactions to Previous Choices (Viktor / Lena / Mira / Levente) */}
        {activeReactions.length > 0 && (
          <div className="space-y-2">
            {activeReactions.map((reaction) => (
              <div
                key={reaction.requiresChoiceId}
                className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/35 text-xs"
              >
                <div className="font-mono font-bold text-amber-300 uppercase text-[11px] mb-1">
                  Korábbi Döntésedre Reagál · {reaction.title}
                </div>
                <p className="text-slate-200 leading-relaxed">{reaction.reactionText}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dialogue Topics */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Párbeszéd-témák (dinamikus személyiség-ellenőrzéssel):
          </div>
          {selectedNpc.topics.map((topic) => {
            const asked = spiralState.worldState.kodvarosTalkedInhabitants.includes(topic.id);
            const isOpenTopic = activeTopicId === topic.id;
            const availableBranchesCount = (topic.personalityBranches || []).filter(
              (b) => (activePersonality[b.trait] || 0) >= b.minValue
            ).length;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  if (!isKodvarosUnlocked) {
                    soundEngine.playMechanicalTick(-2);
                    return;
                  }
                  talkToKodvarosTopic(selectedNpc.id, topic.id);
                  setActiveTopicId(topic.id);
                  setActiveBranchId(null);
                }}
                disabled={!isKodvarosUnlocked}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between gap-2 ${
                  !isKodvarosUnlocked
                    ? 'border-slate-800 bg-slate-950/50 text-slate-500 cursor-not-allowed'
                    : isOpenTopic
                    ? 'border-cyan-400 bg-cyan-950/35 text-cyan-100 cursor-pointer'
                    : 'border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 text-slate-200 cursor-pointer'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{topic.question}</span>
                </span>
                <span className="inline-flex items-center gap-2 shrink-0 font-mono text-[10px]">
                  {topic.personalityBranches && (
                    <span className="text-cyan-300">
                      {availableBranchesCount}/{topic.personalityBranches.length} ág nyitva
                    </span>
                  )}
                  {asked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Citizen Base Answer & Dynamic SpiralState Personality-Driven Options */}
        {activeTopic && (
          <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/40 text-xs space-y-3">
            <div className="space-y-1.5">
              <div className="font-mono font-bold text-cyan-300">
                {selectedNpc.name} válasza:
              </div>
              <p className="text-slate-100 leading-relaxed">{activeTopic.answer}</p>
              {activeTopic.unlockSecretId && (
                <div className="text-amber-300 font-mono pt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Titok feloldva a „Küldetések & Titok” fülön és az ARCHÍV-82-ben!</span>
                </div>
              )}
            </div>

            {activeTopic.personalityBranches && activeTopic.personalityBranches.length > 0 && (
              <div className="pt-2.5 border-t border-cyan-500/20 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Dinamikus Válaszopciók (Spirál-személyiség szerint):</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {(['all', 'analytical', 'intuitive'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          soundEngine.playUiClick();
                          setDialogueStyleFilter(mode);
                        }}
                        className={`px-2 py-0.5 rounded border cursor-pointer ${
                          dialogueStyleFilter === mode
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode === 'all' ? 'Összes' : mode === 'analytical' ? 'Logikus' : 'Intuitív'}
                      </button>
                    ))}
                  </div>
                </div>

                {evaluatedBranches.length === 0 ? (
                  <div className="text-[11px] font-mono text-slate-400 italic p-2 rounded bg-slate-950/60">
                    Nincs erre a stílusra szűrt ág ebben a témában — válts „Összes” nézetre!
                  </div>
                ) : (
                  evaluatedBranches.map((branch) => {
                    const selected = activeBranchId === branch.id;

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        disabled={!branch.unlocked}
                        onClick={() => {
                          if (!branch.unlocked) return;
                          talkToKodvarosTopic(
                            selectedNpc.id,
                            activeTopic.id,
                            branch.id,
                            branch.bonusResonance || 10
                          );
                          setActiveBranchId(branch.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                          !branch.unlocked
                            ? 'border-slate-800 bg-slate-950/50 text-slate-500 cursor-not-allowed'
                            : selected
                            ? 'border-amber-400 bg-amber-950/30 text-amber-100 cursor-pointer'
                            : 'border-cyan-500/35 bg-slate-950/75 hover:border-amber-400/60 text-slate-200 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!branch.unlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              {branch.unlocked && branch.matchesTopTrait && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[10px] font-mono">
                                  ★ Profilodhoz ajánlott
                                </span>
                              )}
                              {branch.mastery && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-mono">
                                  Mesteri ({branch.playerVal})
                                </span>
                              )}
                            </div>
                            <span>{branch.label}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono whitespace-nowrap">
                          {branch.resolved
                            ? '✓ Kimenet rögzítve'
                            : branch.unlocked
                            ? `+${branch.bonusResonance || 10} Rez.`
                            : `${TRAIT_LABELS[branch.trait]} ≥ ${branch.minValue} (${branch.playerVal})`}
                        </span>
                      </button>
                    );
                  })
                )}

                {activeBranch && (
                  <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-500/40 text-xs text-amber-100 leading-relaxed">
                    <span className="font-mono font-bold text-amber-300 block mb-1">
                      Dinamikus Kimenet ({TRAIT_LABELS[activeBranch.trait]} · {activePersonality[activeBranch.trait] || 0}):
                    </span>
                    {activeBranch.outcomeText}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
