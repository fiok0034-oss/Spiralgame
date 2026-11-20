import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  Flame,
  AlertTriangle,
  Eye,
  Compass,
  BookOpen,
  Scale,
  KeyRound,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import { GUARDIANS_LIST } from '../data/storyData';
import {
  CHAMBER_SEVEN_STAGES,
  REVELATION_TWISTS,
  FINAL_TRIALS,
  evaluateGuardianCouncil,
  evaluateMetaEndingEligibility,
} from '../data/finalRevelationData';
import { soundEngine } from '../audio/SoundEngine';
import { aiVoiceService } from '../audio/aiVoiceService';

const COST_CHOICE_LABELS: Record<string, { title: string; summary: string }> = {
  c_cost_preserve_pain: {
    title: 'Az Emlékek Teljes Terhe',
    summary: 'Megőrzöl minden 1959-es és 1982-es emléket — még azzal az árral is, hogy a fájdalom nyoma megmarad a világban.',
  },
  c_cost_release_memory: {
    title: 'A Láncok Elengedése',
    summary: 'Feloldod a múlt fogságát — elfogadva, hogy egy régi földi emlék csendben elhalványulhat a feledésben.',
  },
  c_cost_seal_alternate_branches: {
    title: 'Az Élő Jövő Határa',
    summary: 'Lezárod az elveszett, párhuzamos időágak ajtaját, hogy a négy túlélő egyetlen valódi jövőbe léphessen.',
  },
};

// =========================================================================
// 1. CHAMBER BEYOND THE NINTH: 7 INTERACTIVE STAGES
// =========================================================================
export const ChamberBeyondNinthExperience: React.FC = () => {
  const { spiralState, completeChamberStage } = useGame();
  const completedStages = spiralState.worldState.chamberStagesCompleted || [];

  const firstIncompleteStage = useMemo(() => {
    for (let s = 1; s <= 7; s++) {
      if (!completedStages.includes(s)) return s;
    }
    return 7;
  }, [completedStages]);

  const [viewingStage, setViewingStage] = useState<number>(firstIncompleteStage);

  // Stage 1: Mute 3 sounds
  const [mutedNoises, setMutedNoises] = useState<string[]>([]);
  // Stage 2: Align 3 triads
  const [alignedTriads, setAlignedTriads] = useState<string[]>([]);
  // Stage 3: Inspect 3 forgotten memories
  const [openedMemories, setOpenedMemories] = useState<string[]>([]);
  // Stage 4: Impossible encounter choice response
  const [impossibleReply, setImpossibleReply] = useState<'gratitude' | 'question' | null>(null);
  // Stage 6: Selected cost
  const [selectedCost, setSelectedCost] = useState<string>(
    spiralState.worldState.chamberCostChoiceId || ''
  );

  const highestUnlockedStage = Math.min(7, completedStages.length + 1);
  const activeStageNum = Math.min(viewingStage, highestUnlockedStage);
  const stageData =
    CHAMBER_SEVEN_STAGES.find((st) => st.stage === activeStageNum) || CHAMBER_SEVEN_STAGES[0];
  const isCurrentCompleted = completedStages.includes(activeStageNum);

  const handleCompleteAndAdvance = (
    stageNum: number,
    payload?: { costChoiceId?: string; resonanceDelta?: number; unlockEvidenceIds?: string[] }
  ) => {
    completeChamberStage(stageNum, payload);
    if (stageNum < 7) {
      setViewingStage(stageNum + 1);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-amber-400/45 bg-slate-950/95 p-4 sm:p-6 space-y-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold">
            Θ–∞–Δ · A Kilencediken Túli Kamra (7 Szakasz)
          </div>
          <h3 className="text-base sm:text-lg font-cinzel font-bold text-slate-100 mt-0.5">
            {stageData.title}
          </h3>
          <p className="text-xs font-mono text-slate-400">{stageData.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void aiVoiceService.playLine({
                lineId: `chamber_stage_${stageData.stage}`,
                speakerLabel: `KILENCEDIKEN TÚLI KAMRA · ${stageData.stage}. SZAKASZ`,
                persona: 'infinite',
                channel: 'narration',
                fxMode: 'infinite_resonance',
                text: `${stageData.title}. ${stageData.narrative}`,
              });
            }}
            className="px-3 py-1.5 min-h-[36px] rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-xs font-mono text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Szakasz felolvasása (AI Hang)</span>
          </button>
          <div className="text-xs font-mono text-emerald-300 tabular-nums font-bold">
            Haladás: {completedStages.length}/7 szakasz
          </div>
        </div>
      </div>

      {/* 7-Stage Step Selector Rail */}
      <div className="grid grid-cols-7 gap-1.5">
        {CHAMBER_SEVEN_STAGES.map((st) => {
          const done = completedStages.includes(st.stage);
          const unlocked = st.stage <= highestUnlockedStage;
          const active = st.stage === activeStageNum;
          return (
            <button
              key={st.stage}
              type="button"
              disabled={!unlocked}
              onClick={() => {
                soundEngine.playUiClick();
                setViewingStage(st.stage);
              }}
              className={`min-h-[40px] rounded-lg border text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1 tabular-nums ${
                active
                  ? 'border-amber-300 bg-amber-500/25 text-amber-100 cursor-pointer'
                  : done
                  ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400 cursor-pointer'
                  : unlocked
                  ? 'border-cyan-500/40 bg-slate-900 text-cyan-200 hover:border-cyan-400 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
              }`}
              title={st.title}
            >
              {done ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : null}
              <span>{st.stage}.</span>
            </button>
          );
        })}
      </div>

      {/* Narrative Body for Stage */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4 space-y-2.5">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
          {stageData.narrative}
        </p>
        <div className="text-xs font-mono text-cyan-300/90 pt-2 border-t border-slate-800/80">
          {stageData.atmosphereHint}
        </div>
      </div>

      {/* Interactive Controls per Stage */}
      {activeStageNum === 1 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-300">{stageData.interactivePrompt}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'wind', label: 'Sarki Szél Süvítése', freq: '285 Hz' },
              { id: 'static', label: '82.0 MHz Statika', freq: '432 Hz' },
              { id: 'pulse', label: '58 BPM Dobogás', freq: '528 Hz' },
            ].map((item) => {
              const muted = isCurrentCompleted || mutedNoises.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={muted}
                  onClick={() => {
                    soundEngine.playSilenceDrop();
                    setMutedNoises((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                  }}
                  className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                    muted
                      ? 'border-emerald-500/45 bg-emerald-950/25 text-emerald-200 cursor-default'
                      : 'border-cyan-500/40 bg-slate-900 hover:border-amber-400 text-slate-200 cursor-pointer'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {muted ? (
                    <VolumeX className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          {!isCurrentCompleted && (
            <button
              type="button"
              disabled={mutedNoises.length < 3}
              onClick={() => handleCompleteAndAdvance(1, { resonanceDelta: 15 })}
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold uppercase ${
                mutedNoises.length >= 3
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {mutedNoises.length >= 3
                ? 'Belépés a Teljes Csendbe (1. Szakasz Lezárása →)'
                : `Csendesítsd el mindhárom pontot (${mutedNoises.length}/3)`}
            </button>
          )}
        </div>
      )}

      {activeStageNum === 2 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-300">{stageData.interactivePrompt}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'triad_past', title: 'Múlt Triád', words: '„Ne felejts, ne félj, tarts ki”', hz: 432 },
              { id: 'triad_mirror', title: 'Tükör Triád', words: '„Láss tisztán, halld a csendet, vállald”', hz: 528 },
              { id: 'triad_warmth', title: 'Melegség Triád', words: '„Fordulj meg, maradj meleg, lépj át”', hz: 639 },
            ].map((tr) => {
              const active = isCurrentCompleted || alignedTriads.includes(tr.id);
              return (
                <button
                  key={tr.id}
                  type="button"
                  disabled={active}
                  onClick={() => {
                    soundEngine.playEchoSecretTone(tr.hz);
                    setAlignedTriads((prev) => (prev.includes(tr.id) ? prev : [...prev, tr.id]));
                  }}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition-colors ${
                    active
                      ? 'border-amber-400 bg-amber-950/30 text-amber-100 cursor-default'
                      : 'border-slate-700 bg-slate-900 hover:border-amber-400 text-slate-200 cursor-pointer'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-amber-300">{tr.title} · {tr.hz} Hz</div>
                  <div className="text-xs text-slate-300 mt-1">{tr.words}</div>
                </button>
              );
            })}
          </div>
          {(isCurrentCompleted || alignedTriads.length >= 3) && (
            <div className="p-3 rounded-xl border border-amber-400/40 bg-amber-950/20 text-xs font-cinzel text-amber-100 text-center">
              A Kilenc Szó Egyetlen Mondata: „Ne felejts, ne félj, láss tisztán — a csend túloldalán is emberi kéz vár.”
            </div>
          )}
          {!isCurrentCompleted && (
            <button
              type="button"
              disabled={alignedTriads.length < 3}
              onClick={() => handleCompleteAndAdvance(2, { resonanceDelta: 20 })}
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold uppercase ${
                alignedTriads.length >= 3
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {alignedTriads.length >= 3
                ? 'Kilenc Visszhang Összeillesztése (2. Szakasz →)'
                : `Aktiváld a három Triádot (${alignedTriads.length}/3)`}
            </button>
          )}
        </div>
      )}

      {activeStageNum === 3 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-300">{stageData.interactivePrompt}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              {
                id: 'mem_1959',
                year: '1959. Dec.',
                title: 'Kovács Áron Két Aláírása',
                text: 'Áron szándékosan töröltette a nevét az aktákból, hogy a bajtársak családjai ne kövessék a jelet a halálba.',
              },
              {
                id: 'mem_1979',
                year: '1979. Nov.',
                title: 'Lena 0 Hz-es Kazettája',
                text: 'A törölt Δ–0 szobában Lena még azelőtt hallotta Levente 58 BPM-es szívhangját, hogy a fiú megszületett volna.',
              },
              {
                id: 'mem_1989',
                year: '1989. Máj.',
                title: 'Pesti Kórtermi Rajz',
                text: 'Az ötéves Levente lázálmában egyetlen éjjel lerajzolta Kódváros Három Körét — az orvosok összetépték, de a jég megőrizte.',
              },
            ].map((m) => {
              const seen = isCurrentCompleted || openedMemories.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playDiscovery();
                    setOpenedMemories((prev) => (prev.includes(m.id) ? prev : [...prev, m.id]));
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    seen
                      ? 'border-cyan-400 bg-cyan-950/25'
                      : 'border-slate-700 bg-slate-900 hover:border-cyan-400/60'
                  }`}
                >
                  <div className="text-[11px] font-mono text-cyan-300 font-bold">{m.year}</div>
                  <div className="text-xs font-cinzel font-bold text-slate-100 mt-0.5">{m.title}</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {seen ? m.text : 'Kattints az elfelejtett emlék előhívásához...'}
                  </p>
                </button>
              );
            })}
          </div>
          {!isCurrentCompleted && (
            <button
              type="button"
              disabled={openedMemories.length < 3}
              onClick={() =>
                handleCompleteAndAdvance(3, {
                  resonanceDelta: 25,
                  unlockEvidenceIds: ['ev_rev_1959_compromise', 'ev_rev_1979_fourth_track'],
                })
              }
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold uppercase ${
                openedMemories.length >= 3
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {openedMemories.length >= 3
                ? 'Bizonyítékok Rögzítése az ARCHÍV-82-ben (3. Szakasz →)'
                : `Nyisd meg mindhárom elfeledett emléket (${openedMemories.length}/3)`}
            </button>
          )}
        </div>
      )}

      {activeStageNum === 4 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-300">{stageData.interactivePrompt}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCrystalResonance(528);
                setImpossibleReply('gratitude');
              }}
              className={`p-3 min-h-[44px] rounded-xl border text-left text-xs font-sans cursor-pointer ${
                impossibleReply === 'gratitude'
                  ? 'border-emerald-400 bg-emerald-950/25 text-emerald-100'
                  : 'border-slate-700 bg-slate-900 hover:border-cyan-400 text-slate-200'
              }`}
            >
              „Köszönöm nektek, Áron és Tamás — a névtelenségetek mentette meg Viktort és Leventét.”
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCrystalResonance(432);
                setImpossibleReply('question');
              }}
              className={`p-3 min-h-[44px] rounded-xl border text-left text-xs font-sans cursor-pointer ${
                impossibleReply === 'question'
                  ? 'border-cyan-400 bg-cyan-950/25 text-cyan-100'
                  : 'border-slate-700 bg-slate-900 hover:border-cyan-400 text-slate-200'
              }`}
            >
              „Ha te sosem érintetted meg a követ, Viktor árnyéka — mit üzentek nekünk a jövőbe?”
            </button>
          </div>
          {(impossibleReply || isCurrentCompleted) && (
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-slate-200 leading-relaxed">
              {impossibleReply === 'question'
                ? 'A fiatal, sértetlen Viktor elmosolyodik: „Ne félj attól, hogy elveszíted a múltat. A szeretet erősebb a hibátlan idővonalnál.”'
                : 'Tamás felemeli a meleg teáscsészét: „Add át Leventének: a budapesti ablak alatt mindig otthon van.”'}
            </div>
          )}
          {!isCurrentCompleted && (
            <button
              type="button"
              disabled={!impossibleReply}
              onClick={() => handleCompleteAndAdvance(4, { resonanceDelta: 20 })}
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold uppercase ${
                impossibleReply
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Továbblépés a Spirál Eredetéhez (4. Szakasz →)
            </button>
          )}
        </div>
      )}

      {activeStageNum === 5 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 text-xs text-cyan-100 leading-relaxed">
            <strong>4. Nagy Fordulat Feloldva:</strong> A Kilenc Birodalom nem börtön vagy ellenséges próba — kilenc bölcsőkamra volt, amely az emberi elme megroppanását akadályozta meg, míg össze nem érnek a szálak.
          </div>
          {!isCurrentCompleted && (
            <button
              type="button"
              onClick={() => handleCompleteAndAdvance(5, { resonanceDelta: 25 })}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold uppercase cursor-pointer"
            >
              Spirál Eredetének Rögzítése (5. Szakasz →)
            </button>
          )}
        </div>
      )}

      {activeStageNum === 6 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-300">{stageData.interactivePrompt}</div>
          <div className="space-y-2">
            {Object.entries(COST_CHOICE_LABELS).map(([id, info]) => {
              const active = selectedCost === id || spiralState.worldState.chamberCostChoiceId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSelectedCost(id);
                  }}
                  className={`w-full text-left p-3 min-h-[44px] rounded-xl border transition-colors cursor-pointer ${
                    active
                      ? 'border-amber-400 bg-amber-950/30'
                      : 'border-slate-700 bg-slate-900 hover:border-amber-400/60'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-cinzel font-bold text-amber-200">{info.title}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{info.summary}</div>
                </button>
              );
            })}
          </div>
          {!isCurrentCompleted && (
            <button
              type="button"
              disabled={!selectedCost}
              onClick={() =>
                handleCompleteAndAdvance(6, {
                  costChoiceId: selectedCost,
                  resonanceDelta: 25,
                })
              }
              className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold uppercase ${
                selectedCost
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {selectedCost
                ? 'A Választás Árának Felvállalása (6. Szakasz →)'
                : 'Válassz egyet a három visszafordíthatatlan ár közül'}
            </button>
          )}
        </div>
      )}

      {activeStageNum === 7 && (
        <div className="space-y-3">
          {!isCurrentCompleted ? (
            <button
              type="button"
              onClick={() => handleCompleteAndAdvance(7, { resonanceDelta: 40 })}
              className="w-full min-h-[44px] py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>A Végső Kapu Megnyitása (7/7 Szakasz Teljesítése)</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl border border-emerald-500/45 bg-emerald-950/25 text-xs font-mono text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Mind a 7 szakasz teljesítve! Válaszd ki alább a kamra végső fogadalmát a VII. Fejezetbe lépéshez.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. FINAL GUARDIAN COUNCIL PANEL (inf_guardian_council)
// =========================================================================
export const FinalGuardianCouncilPanel: React.FC = () => {
  const { spiralState, guardianProgress, confirmGuardianCouncilVerdict } = useGame();

  const evaluations = useMemo(
    () => evaluateGuardianCouncil(spiralState, guardianProgress),
    [spiralState, guardianProgress]
  );

  const alliesCount = evaluations.filter(
    (e) => e.stance === 'ally' || e.stance === 'sacrifice'
  ).length;
  const challengersCount = evaluations.filter((e) => e.stance === 'challenger').length;
  const verdictDone = spiralState.worldState.guardianCouncilVerdictDone;

  const stanceMeta = (stance: 'ally' | 'challenger' | 'sacrifice' | 'neutral') => {
    switch (stance) {
      case 'sacrifice':
        return {
          border: 'border-amber-400/60 bg-amber-950/20',
          badge: 'text-amber-200',
          Icon: Flame,
        };
      case 'ally':
        return {
          border: 'border-emerald-500/50 bg-emerald-950/20',
          badge: 'text-emerald-300',
          Icon: Shield,
        };
      case 'challenger':
        return {
          border: 'border-rose-500/50 bg-rose-950/20',
          badge: 'text-rose-300',
          Icon: AlertTriangle,
        };
      default:
        return {
          border: 'border-slate-700 bg-slate-900/70',
          badge: 'text-slate-300',
          Icon: Scale,
        };
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-4 sm:p-6 space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
            A Kilenc Őrző Végső Tanácskozása · Dinamikus Értékelés
          </div>
          <h3 className="text-base sm:text-lg font-cinzel font-bold text-slate-100 mt-0.5">
            Hogyan állnak melletted az Őrzők a Végső Küszöbön?
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
          <span className="text-emerald-300 font-bold">Szövetséges / Áldozat: {alliesCount}/9</span>
          <span className="text-slate-600">|</span>
          <span className="text-rose-300 font-bold">Kételkedő: {challengersCount}</span>
          <button
            type="button"
            onClick={() => {
              const summaryText = `A Kilenc Őrző Tanácskozásán ${alliesCount} őrző állt melléd, és ${challengersCount} kételkedik még. ${evaluations
                .slice(0, 3)
                .map((e) => e.reasonText)
                .join(' ')}`;
              void aiVoiceService.playLine({
                lineId: `guardian_council_${alliesCount}_${challengersCount}`,
                speakerLabel: 'A KILENC ŐRZŐ TANÁCSA',
                persona: 'infinite',
                channel: 'dialogue',
                fxMode: 'infinite_resonance',
                text: summaryText,
              });
            }}
            className="px-3 py-1.5 min-h-[34px] rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tanács összegzése (AI Hang)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {evaluations.map((ev) => {
          const g = GUARDIANS_LIST.find((item) => item.id === ev.guardianId)!;
          const meta = stanceMeta(ev.stance);
          const Icon = meta.Icon;
          return (
            <div key={ev.guardianId} className={`rounded-xl border p-3.5 space-y-2 ${meta.border}`}>
              <div className="flex items-center justify-between gap-2 text-xs font-mono">
                <span className="font-bold" style={{ color: g.colorHex }}>
                  {g.symbol} · {g.name}
                </span>
                <span className={`inline-flex items-center gap-1 font-bold ${meta.badge}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{ev.stanceLabel}</span>
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{ev.reasonText}</p>
              {ev.secretRevelation && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-200 leading-relaxed">
                  <strong className="font-mono uppercase text-amber-300">Őrzői Vallomás:</strong>{' '}
                  {ev.secretRevelation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-mono text-slate-400">
          A Tanács állásfoglalása közvetlenül beépül az Epilógusba és a Meta-feltételbe.
        </div>
        <button
          type="button"
          onClick={() => confirmGuardianCouncilVerdict(alliesCount)}
          className={`px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold uppercase cursor-pointer inline-flex items-center gap-2 ${
            verdictDone
              ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-200'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {verdictDone ? '✓ A Tanács Ítélete Rögzítve' : 'A Tanács Ítéletének Rögzítése'}
          </span>
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// 3. FINAL DEDUCTION TRIALS & 5 TWISTS PANEL (inf_final_trials)
// =========================================================================
export const FinalTrialsPanel: React.FC = () => {
  const { spiralState, solveFinalTrial } = useGame();
  const solvedIds = spiralState.worldState.finalTrialsSolved || [];
  const revealedTwists = spiralState.worldState.revealedTwists || [];

  const [trialFeedback, setTrialFeedback] = useState<
    Record<string, { correct: boolean; text: string }>
  >({});

  const handleSelectOption = (trialId: string, optionId: string) => {
    const res = solveFinalTrial(trialId, optionId);
    setTrialFeedback((prev) => ({
      ...prev,
      [trialId]: {
        correct: res.correct,
        text: res.revelation ? `${res.explanation} ${res.revelation}` : res.explanation,
      },
    }));
  };

  return (
    <div className="mb-8 space-y-6">
      {/* 4 Deduction Trials */}
      <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-4 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
              Logikai & Nyomozói Végső Próbák (Reflexmentes Szintézis)
            </div>
            <h3 className="text-base sm:text-lg font-cinzel font-bold text-slate-100 mt-0.5">
              Igazold a Történeti Összefüggéseket (Legalább 3/4 Próba Szükséges)
            </h3>
          </div>
          <div className="text-xs font-mono text-amber-300 font-bold tabular-nums">
            Megoldva: {solvedIds.length} / {FINAL_TRIALS.length}
          </div>
        </div>

        <div className="space-y-4">
          {FINAL_TRIALS.map((trial) => {
            const isSolved = solvedIds.includes(trial.id);
            const fb = trialFeedback[trial.id];
            return (
              <div
                key={trial.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  isSolved
                    ? 'border-emerald-500/50 bg-emerald-950/15'
                    : 'border-slate-800 bg-slate-900/75'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono text-cyan-300 font-bold uppercase">
                    {trial.categoryLabel}
                  </div>
                  {isSolved && (
                    <span className="text-xs font-mono text-emerald-300 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Igazolva
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-cinzel font-bold text-slate-100">
                  {trial.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{trial.prompt}</p>
                <div className="text-[11px] font-mono text-slate-400">Nyomravezető: {trial.clueSummary}</div>

                <div className="space-y-2 pt-1">
                  {trial.options.map((opt) => {
                    const chosenCorrect = isSolved && opt.id === trial.correctOptionId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(trial.id, opt.id)}
                        className={`w-full text-left p-3 min-h-[42px] rounded-lg border text-xs sm:text-sm transition-colors cursor-pointer ${
                          chosenCorrect
                            ? 'border-emerald-400 bg-emerald-950/35 text-emerald-100 font-semibold'
                            : 'border-slate-700 bg-slate-950/80 hover:border-cyan-400 text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {fb && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                      fb.correct
                        ? 'border-emerald-500/45 bg-emerald-950/30 text-emerald-200'
                        : 'border-rose-500/45 bg-rose-950/30 text-rose-200'
                    }`}
                  >
                    {fb.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Narrative Twists Archive Dossier */}
      <div className="rounded-2xl border border-amber-500/35 bg-slate-950/95 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Az Öt Összekapcsolt Nagy Fordulat (Visszamenőleges Értelem)</span>
          </div>
          <span className="text-xs font-mono text-slate-300 tabular-nums">
            {revealedTwists.length}/5 feltárva
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REVELATION_TWISTS.map((tw) => {
            const unlocked = revealedTwists.includes(tw.id);
            return (
              <div
                key={tw.id}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  unlocked
                    ? 'border-amber-400/50 bg-amber-950/15'
                    : 'border-slate-800 bg-slate-900/50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">{tw.title}</span>
                  {unlocked ? (
                    <Eye className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </div>
                {unlocked ? (
                  <>
                    <p className="text-xs text-slate-400">
                      <strong>Korábbi hit:</strong> {tw.previousAssumption}
                    </p>
                    <p className="text-xs text-slate-100 leading-relaxed">
                      <strong>Valódi igazság:</strong> {tw.revealedTruth}
                    </p>
                    <p className="text-[11px] font-mono text-cyan-300 pt-1">
                      ↳ {tw.retroactiveMeaning}
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-mono text-slate-500">
                    Oldd meg a kapcsolódó Végső Próbát vagy Kamra-szakaszt a feltárásához!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. META-ENDING TRANSPARENT ELIGIBILITY CHECKLIST (inf_final_encounter)
// =========================================================================
export const MetaChecklistPanel: React.FC = () => {
  const { spiralState, evidence, secrets } = useGame();
  const meta = useMemo(
    () => evaluateMetaEndingEligibility(spiralState, evidence, secrets),
    [spiralState, evidence, secrets]
  );

  return (
    <div className="mb-6 rounded-2xl border border-purple-500/40 bg-slate-950/90 p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-mono text-purple-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
          <KeyRound className="w-4 h-4" />
          <span>Titkos Meta-Út („Talán te”) Elérhetőségi Ellenőrző</span>
        </div>
        <span
          className={`text-xs font-mono font-bold ${
            meta.eligible ? 'text-emerald-300' : 'text-amber-300'
          }`}
        >
          {meta.eligible ? '✓ Minden Meta-feltétel Teljesült' : 'Feltételek Folyamatban'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {meta.checks.map((chk) => (
          <div
            key={chk.id}
            className={`p-3 rounded-xl border text-xs space-y-0.5 ${
              chk.passed
                ? 'border-emerald-500/45 bg-emerald-950/20 text-emerald-100'
                : 'border-slate-800 bg-slate-900/75 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 font-mono font-bold">
              <span>{chk.label}</span>
              {chk.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400">{chk.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 5. REACTIVE EPILOGUE CONSEQUENCE MATRIX (ending_*)
// =========================================================================
export const ReactiveEpilogueMatrix: React.FC = () => {
  const { spiralState, guardianProgress } = useGame();
  const chosen = useMemo(
    () => new Set(Object.values(spiralState.choiceHistory)),
    [spiralState.choiceHistory]
  );

  const council = useMemo(
    () => evaluateGuardianCouncil(spiralState, guardianProgress),
    [spiralState, guardianProgress]
  );
  const allies = council.filter((e) => e.stance === 'ally' || e.stance === 'sacrifice').length;
  const costKey = spiralState.worldState.chamberCostChoiceId;
  const costInfo = costKey ? COST_CHOICE_LABELS[costKey] : null;

  const outcomes = [
    {
      title: 'Viktor & Lena',
      detail: chosen.has('c_fin_viktor_sacrifice_memory')
        ? 'Viktor elengedte a kizárólagosságot — közösen hordozzák az 1982–1983-as frekvenciát.'
        : chosen.has('c_fin_viktor_anchor_love')
        ? 'Viktor és Lena az összes régi fájdalom teljes megtartásával álltak ki egymás mellett.'
        : 'Az 1982-es és 1983-as pólusok békében összekapcsolódtak.',
    },
    {
      title: 'Mira & Levente',
      detail: chosen.has('c_fin_levente_forge_new')
        ? 'Levente szabad elhatározásból kötött új szövetséget Mirával és a Másik Mira emlékével.'
        : 'Levente megőrizte budapesti otthonának valóságát a nyitott ablak alatt.',
    },
    {
      title: 'Kódváros Sorsa',
      detail: chosen.has('c_k1_r3_invert_crown')
        ? 'A megfordított korona miatt Kódváros egyenrangú társként tekintett vissza A Végtelenre.'
        : chosen.has('c_k1_r3_living_city')
        ? 'Kódváros élő, változó várossá vált Sára, Tamás és Kaelen vezetésével.'
        : 'A Három Kör megőrizte az 1959-es és 1982-es kutatók örökségét.',
    },
    {
      title: 'Kamra Ára & Tanács',
      detail: costInfo
        ? `${costInfo.title} · ${allies}/9 Őrző szövetséges · ${spiralState.worldState.revealedTwists.length}/5 Nagy Fordulat`
        : `${allies}/9 Őrző szövetséges · ${spiralState.worldState.collectedNineEchoIds.length}/9 Visszhang · ${spiralState.worldState.revealedTwists.length}/5 Fordulat`,
    },
  ];

  return (
    <div className="mb-8 rounded-2xl border border-amber-400/40 bg-slate-950/90 p-4 sm:p-5 space-y-3">
      <div className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
        <Compass className="w-4 h-4" />
        <span>Személyre Szabott Epilógus-Mátrix (Döntéseid Következményei)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {outcomes.map((o) => (
          <div key={o.title} className="p-3 rounded-xl border border-slate-800 bg-slate-900/75 space-y-1">
            <div className="text-xs font-cinzel font-bold text-cyan-300">{o.title}</div>
            <p className="text-xs text-slate-200 leading-relaxed">{o.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
