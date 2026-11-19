import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { EchoRecord, GuardianProgress, SpiralState } from '../types/game';
import { STORY_NODES } from '../data/storyData';
import { KODVAROS_QUESTS, KODVAROS_SIDE_QUESTS } from '../data/kodvarosData';
import { GUARDIAN_DIMENSIONS } from '../data/expansionData';
import { StoryBranchingTree } from './StoryBranchingTree';
import { ActiveQuestSummary, MemorySyncVisualizer } from './MemorySyncVisualizer';
import { soundEngine } from '../audio/SoundEngine';

interface StoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  initialViewMode?: 'log' | 'tree' | 'sync';
}

type FilterMode = 'all' | 'choices_only' | 'current_speaker';

const buildMissionContext = (sceneId: string, spiralState: SpiralState) => {
  const node = STORY_NODES[sceneId];
  const pendingSideQuests = KODVAROS_SIDE_QUESTS.filter(
    (sq) => !spiralState.worldState.kodvarosSolvedSideQuests.includes(sq.id)
  );

  if (sceneId.startsWith('v1_')) {
    return {
      title: 'I. Fejezet · Viktor Antarktiszi Vizsgálata',
      objective: !spiralState.worldState.radarAnomalyFound
        ? 'Kalibráld a Georadart (-3200m anomália) és hangold be a 82.0 / 142.8 MHz-es rádiócsatornákat.'
        : 'Ereszkedj le a Subglaciális Obeliszkhez, és döntsd el, megérinted vagy jegyzőkönyvezed a követ.',
    };
  }
  if (sceneId.startsWith('l1_') || sceneId === 'transition_to_lena') {
    return {
      title: 'II. Fejezet · Dr. Lena & A Projekt Δ–0',
      objective:
        'Vizsgáld meg az 1979-es jégmagot, oldd meg a Fáziszárást, és határozd meg a 142.8 MHz-es visszacsatolt adás tartalmát.',
    };
  }
  if (sceneId.startsWith('m1_')) {
    return {
      title: 'III. Fejezet · Mira & A Második Kapu',
      objective:
        'Nézz szembe a Másik Mirával a Tükrök Főterén, és hangold össze az Obszervatórium lencséjét Levente felé.',
    };
  }
  if (sceneId.startsWith('lev1_')) {
    return {
      title: 'IV. Fejezet · Levente & Az Élő Kulcs',
      objective: !spiralState.worldState.leventeChapterCompleted
        ? 'Nyisd ki a családi bádogdobozt, kösd össze a 4 tudati pólust, és fordítsd el az Élő Kulcsot a Zárkőben!'
        : 'Lépj be a Kódváros Három Körébe!',
    };
  }
  if (sceneId.startsWith('k1_')) {
    const missingRings = [
      !spiralState.worldState.kodvarosRing1Done ? '1. Kör (Jég)' : null,
      !spiralState.worldState.kodvarosRing2Done ? '2. Kör (Hang)' : null,
      !spiralState.worldState.kodvarosRing3Done ? '3. Kör (Tükör)' : null,
    ].filter(Boolean);
    return {
      title: 'V. Fejezet · Kódváros & A Három Kör',
      objective:
        missingRings.length > 0
          ? `Teljesítsd a hátralévő köröket: ${missingRings.join(', ')}. Aktív Főtér-mellékküldetések: ${pendingSideQuests.length} db.`
          : 'Mindhárom kör harmonizálva! Egyesítsd a Három Kört a Központi Tengelyen (k1_three_rings).',
    };
  }
  if (sceneId === 'g1_chamber_beyond_ninth') {
    return {
      title: 'Θ–∞–Δ · A Kilencediken Túli Kamra',
      objective:
        'Mind a Kilenc Visszhang egyesült! Vizsgáld meg a Θ–∞–Δ jelet, és vidd tovább a felismerést a Végtelen Szeme elé.',
    };
  }
  if (sceneId.startsWith('g1_realm_') || sceneId === 'g1_guardians_nexus') {
    const echoes = spiralState.worldState.collectedNineEchoIds.length;
    const clues = spiralState.worldState.collectedObserverClueIds.length;
    return {
      title: 'VI. Fejezet · A Kilenc Őrző Birodalmai',
      objective: `Járd be nem-lineárisan a 9 birodalom zónáit, oldd meg a próbákat, gyűjtsd össze a Visszhang-magokat (${echoes}/9) és a Rejtett Megfigyelő jeleit (${clues}/9).`,
    };
  }
  if (sceneId.startsWith('g1_')) {
    return {
      title: 'VI. Fejezet · A Kilenc Őrző Tanácsa',
      objective:
        'Lépj be a Kilenc Birodalom Csarnokába, és kösd össze az emlékeid erejét az Őrzőkkel.',
    };
  }
  return {
    title: node?.speaker || 'A Spirál Végső Küszöbe',
    objective: 'Válaszd ki a Végtelen előtti végső utadat az összegyűjtött visszhangjaid fényében.',
  };
};

const collectActiveQuests = (
  sceneId: string,
  spiralState: SpiralState,
  guardianProgress: Record<number, GuardianProgress>
): ActiveQuestSummary[] => {
  const missionCtx = buildMissionContext(sceneId, spiralState);
  const list: ActiveQuestSummary[] = [
    {
      id: `chapter_${sceneId}`,
      title: missionCtx.title,
      source: 'Fő történeti szál',
      targetHint: missionCtx.objective,
    },
  ];

  KODVAROS_SIDE_QUESTS.forEach((sq) => {
    if (!spiralState.worldState.kodvarosSolvedSideQuests.includes(sq.id)) {
      list.push({
        id: sq.id,
        title: sq.title,
        source: `${sq.ringId}. Kör · Főtéri Mellékküldetés`,
        targetHint: `${sq.giverName} segítségével indítsd el a ${sq.miniGameLabel.replace(' Indítása', '')} próbát!`,
      });
    }
  });

  KODVAROS_QUESTS.forEach((kq) => {
    if (!spiralState.worldState.kodvarosCompletedQuests.includes(kq.id)) {
      list.push({
        id: kq.id,
        title: kq.title,
        source: `${kq.ringId}. Kör · Kódváros Küldetés`,
        targetHint: kq.description,
      });
    }
  });

  GUARDIAN_DIMENSIONS.forEach((dim) => {
    const prog = guardianProgress[dim.guardianId];
    if (prog && prog.encountered && !prog.realmCompleted) {
      const pendingQuest = dim.quests.find((q) => !prog.completedQuestIds.includes(q.id));
      if (pendingQuest) {
        list.push({
          id: `${dim.guardianId}_${pendingQuest.id}`,
          title: `${dim.dimensionName}: ${pendingQuest.title}`,
          source: `${dim.guardianId}. Őrző Birodalma`,
          targetHint: pendingQuest.description,
        });
      }
    }
  });

  return list;
};

const ECHO_CATEGORY_HU: Record<EchoRecord['category'], string> = {
  choice: 'Döntés',
  discovery: 'Felfedezés',
  guardian: 'Őrző',
  reality: 'Valóság',
};

const synthesizeEchoTip = (
  echo: EchoRecord,
  sceneId: string,
  spiralState: SpiralState,
  activeQuests: ActiveQuestSummary[]
): {
  matchedQuest: ActiveQuestSummary;
  matchedChoiceNote: string;
  tipText: string;
} => {
  const chosenKeys = Object.values(spiralState.choiceHistory);
  const targetedHere = echo.targetScenes.includes(sceneId);
  const originSpeaker = STORY_NODES[echo.originSceneId]?.speaker || echo.originSceneId;

  // Cross-reference echo with active quests
  const matchedQuest =
    activeQuests.find((q) => {
      if (echo.originSceneId.startsWith('v1_') && q.id.includes('r1')) return true;
      if (echo.originSceneId.startsWith('l1_') && q.id.includes('r2')) return true;
      if (echo.originSceneId.startsWith('m1_') && q.id.includes('r3')) return true;
      return targetedHere;
    }) || activeQuests[0];

  // Cross-reference past player choices
  let matchedChoiceNote = `Forrás: ${originSpeaker}`;
  if (chosenKeys.includes('c_v1_touch_obelisk')) {
    matchedChoiceNote = 'Korábbi döntésed (Viktor megérintette az obeliszket) felerősíti a fizikai nyomok rezonanciáját.';
  } else if (chosenKeys.includes('c_v1_document_obelisk')) {
    matchedChoiceNote = 'Korábbi döntésed (Viktor jegyzőkönyve) pontosítja a koordináta-összevetést.';
  } else if (chosenKeys.includes('c_l1_expose_project')) {
    matchedChoiceNote = 'Lena leleplező döntése megnyitotta a 142.8 MHz-es rejtett csatornákhoz tartozó nyomokat.';
  } else if (chosenKeys.includes('c_m1_keep_pain')) {
    matchedChoiceNote = 'Mira emlékőrző döntése közvetlenül stabilizálja a jelenlegi szinkron-hidat.';
  }

  const directEffectNote = targetedHere
    ? 'Ez a visszhang közvetlen egyezést mutat a jelenlegi helyszíneddel!'
    : `Az eredeti jelenet (${originSpeaker}) közvetett iránytűt ad az aktív küldetésedhez.`;

  let sceneTip = `Narratív iránymutatás: „${echo.manifestationText}” — figyeld a jelenet interaktív pontjait és az ARCHÍV-82 kapcsolódó bizonyítékait!`;

  if (sceneId === 'k1_three_rings') {
    const nextSq = KODVAROS_SIDE_QUESTS.find(
      (sq) => !spiralState.worldState.kodvarosSolvedSideQuests.includes(sq.id)
    );
    sceneTip = nextSq
      ? `Tipp az aktív küldetéshez („${nextSq.title}”): keresd fel ${nextSq.giverName} lakót a Három Körben, és teljesítsd a ${nextSq.miniGameLabel.replace(' Indítása', '')} próbát!`
      : 'Mindhárom Kör (Ψ–JÉG, Ω–HANG, ∞–TÜKÖR) lezárult — lépj tovább a Központi Tengely egyesítésével!';
  } else if (sceneId.startsWith('k1_ring1_')) {
    sceneTip =
      'Tipp az 1. Körhöz: beszélj Sárával a Jégharangról, és gyűjtsd be az 1959-es lajstromot a csarnok vizsgálati pontjából.';
  } else if (sceneId.startsWith('k1_ring2_')) {
    sceneTip =
      'Tipp a 2. Körhöz: hangold be a Rézhúros Viadukt három pillérét (285 / 432 / 528 Hz), és elemezd Tamás 1982-es távirat-szalagját az ARCHÍV-82-ben.';
  } else if (sceneId.startsWith('k1_ring3_')) {
    sceneTip =
      'Tipp a 3. Körhöz: a Valóság-szerkesztőben fordítsd meg a gravitációt, hogy hozzáférj a mennyezetről lógó Negyedik Alapkő titkához.';
  } else if (sceneId.startsWith('lev1_')) {
    sceneTip =
      'Tipp Levente fejezetéhez: vizsgáld meg az 1989-es EEG-t és táviratot a bádogdobozban, majd aktiváld a Négyes Zárkövet a kapu feloldásához.';
  } else if (sceneId.startsWith('l1_')) {
    sceneTip =
      'Tipp Lena fejezetéhez: a 3200 méteres fúrásmag lézeres elemzése és a Projekt Δ–0 karton feltárja az 1979-es kísérlet valódi okát.';
  } else if (sceneId.startsWith('m1_')) {
    sceneTip =
      'Tipp Mira fejezetéhez: a Másik Mira kérdéseire adott válaszod és az Obszervatórium fókuszálása közvetlenül előkészíti Levente kulcsát.';
  } else if (sceneId.startsWith('g1_realm_') || sceneId === 'g1_guardians_nexus') {
    sceneTip =
      'Tipp a Kilenc Birodalomhoz: a szentélyzónákban emeld ki a Visszhang-magot (9/9 nyitja a Titkos Kamrát), és keresd a különös apró anomáliákat a zónatérképen!';
  } else if (sceneId === 'g1_chamber_beyond_ninth') {
    sceneTip =
      'Tipp A Kilencediken Túli Kamrához: vizsgáld meg a Θ–∞–Δ szimbólumot, mielőtt továbbindulsz a Végtelen elé.';
  }

  return {
    matchedQuest,
    matchedChoiceNote,
    tipText: `${directEffectNote} ${sceneTip}`,
  };
};

export const StoryLog: React.FC<StoryLogProps> = ({ isOpen, onClose, initialViewMode = 'log' }) => {
  const {
    storyLog,
    activeSceneId,
    clearStoryLog,
    echoes,
    spiralState,
    guardianProgress,
    syncEchoTip,
  } = useGame();

  const [viewMode, setViewMode] = useState<'log' | 'tree' | 'sync'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological, desc = newest first
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialViewMode if provided
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  // Collect unique speakers for filtering
  const uniqueSpeakers = useMemo(() => {
    const set = new Set<string>();
    storyLog.forEach((entry) => {
      if (entry.speaker) set.add(entry.speaker);
    });
    return Array.from(set);
  }, [storyLog]);

  // Filtered and sorted entries
  const displayedEntries = useMemo(() => {
    let result = [...storyLog];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (entry) =>
          entry.speaker.toLowerCase().includes(q) ||
          (entry.speakerRole && entry.speakerRole.toLowerCase().includes(q)) ||
          entry.text.toLowerCase().includes(q) ||
          (entry.location && entry.location.toLowerCase().includes(q)) ||
          (entry.chosenOption &&
            (entry.chosenOption.label.toLowerCase().includes(q) ||
              (entry.chosenOption.reflection &&
                entry.chosenOption.reflection.toLowerCase().includes(q))))
      );
    }

    // Filter mode
    if (filterMode === 'choices_only') {
      result = result.filter((entry) => !!entry.chosenOption);
    } else if (filterMode === 'current_speaker' && selectedSpeaker !== 'all') {
      result = result.filter((entry) => entry.speaker === selectedSpeaker);
    }

    // Sort order
    if (sortOrder === 'desc') {
      result.reverse();
    }

    return result;
  }, [storyLog, searchQuery, filterMode, selectedSpeaker, sortOrder]);

  const missionCtx = useMemo(
    () => buildMissionContext(activeSceneId, spiralState),
    [activeSceneId, spiralState]
  );

  const activeQuests = useMemo(
    () => collectActiveQuests(activeSceneId, spiralState, guardianProgress),
    [activeSceneId, spiralState, guardianProgress]
  );

  const synchronizedTips = useMemo(() => {
    return echoes.map((echo) => {
      const isSynced = spiralState.worldState.syncedEchoIds.includes(echo.id);
      const resonatesHere = echo.targetScenes.includes(activeSceneId);
      const analysis = synthesizeEchoTip(echo, activeSceneId, spiralState, activeQuests);
      return {
        echo,
        isSynced,
        resonatesHere,
        ...analysis,
      };
    });
  }, [echoes, spiralState, activeSceneId, activeQuests]);

  const unlockedTips = useMemo(
    () => synchronizedTips.filter((t) => t.isSynced),
    [synchronizedTips]
  );

  const syncedCount = unlockedTips.length;

  const [lastSyncBanner, setLastSyncBanner] = useState<string | null>(null);
  const [activePulseEchoId, setActivePulseEchoId] = useState<string | null>(null);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
  const [showLogTipsPanel, setShowLogTipsPanel] = useState<boolean>(true);
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleTriggerEchoSync = (echoId: string) => {
    const res = syncEchoTip(echoId);
    const echo = echoes.find((e) => e.id === echoId);
    const title = echo?.title || echoId;
    setActivePulseEchoId(echoId);
    setLastSyncBanner(
      res.syncedNow
        ? `✓ „${title}” szinkronizálva az aktuális küldetéssel (+5 Rezonancia)! Új tipp jelent meg a Narratív Tippek részben.`
        : `✓ „${title}” összevetve az aktív küldetésekkel.`
    );
  };

  const handleSyncAllEchoes = () => {
    let newlySynced = 0;
    echoes.forEach((echo) => {
      if (!spiralState.worldState.syncedEchoIds.includes(echo.id)) {
        const res = syncEchoTip(echo.id);
        if (res.syncedNow) newlySynced++;
      }
    });
    if (echoes.length > 0) {
      setActivePulseEchoId(echoes[echoes.length - 1].id);
    }
    setLastSyncBanner(
      newlySynced > 0
        ? `✓ ${newlySynced} új Visszhang-emlék szinkronizálva! (+${newlySynced * 5} Rezonancia)`
        : '✓ Minden Visszhang-emlék szinkronban van az aktív küldetésekkel.'
    );
  };

  const handleJumpToLogEntry = (entryId: string) => {
    setSearchQuery('');
    setFilterMode('all');
    setSelectedSpeaker('all');
    setSortOrder('asc');
    setHighlightedEntryId(entryId);
    setViewMode('log');
    window.setTimeout(() => {
      const targetEl = entryRefs.current[entryId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const choicesCount = useMemo(
    () => storyLog.filter((entry) => !!entry.chosenOption).length,
    [storyLog]
  );

  const scrollToBottom = () => {
    soundEngine.playUiClick();
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyTranscript = () => {
    soundEngine.playDiscovery();
    const formatted = storyLog
      .map((entry, idx) => {
        const time = entry.timestamp ? `[${entry.timestamp}] ` : '';
        const loc = entry.location ? `(${entry.location}) ` : '';
        const role = entry.speakerRole ? ` - ${entry.speakerRole}` : '';
        let str = `--- #${idx + 1} ${time}${loc}\n${entry.speaker}${role}:\n${entry.text}\n`;
        if (entry.chosenOption) {
          str += `➜ VÁLASZTOTT DÖNTÉS: "${entry.chosenOption.label}"\n`;
          if (entry.chosenOption.reflection) {
            str += `  Gondolat: ${entry.chosenOption.reflection}\n`;
          }
        }
        return str;
      })
      .join('\n');

    navigator.clipboard?.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Helper for speaker color tags
  const getSpeakerColorClass = (speaker: string) => {
    const s = speaker.toUpperCase();
    if (s.includes('VIKTOR')) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    if (s.includes('LENA')) return 'text-violet-400 border-violet-500/40 bg-violet-950/40';
    if (s.includes('MIRA')) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    if (s.includes('LEVENTE')) return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (s.includes('VÉGTELEN') || s.includes('INFINITE'))
      return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
    return 'text-slate-300 border-slate-700 bg-slate-900/60';
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="storylog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={containerRef}
        className={`w-full ${
          viewMode === 'tree' || viewMode === 'sync' ? 'max-w-6xl' : 'max-w-4xl'
        } h-[94vh] max-h-[920px] bg-slate-950/95 border border-cyan-500/40 rounded-2xl flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden transition-all duration-300`}
      >
        {/* TOP TITLE & VIEW SWITCHER HEADER */}
        <div className="p-3.5 sm:p-5 border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📜</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="storylog-title"
                    className="text-base sm:text-xl font-cinzel font-bold text-slate-100 tracking-wider"
                  >
                    TÖRTÉNETI NAPLÓ // IDŐVONAL-ARCHÍVUM
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    ÁLLANDÓ EMLÉKEZET
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                  Rögzített narratív szakaszok, párbeszédek és az elágazási döntési fa
                </p>
              </div>
            </div>

            {/* VIEW MODE SWITCHER TABS */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setViewMode('log');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'log'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>📜</span>
                <span>Időrendi Napló</span>
                <span className="text-[10px] text-cyan-400/80 tabular-nums">({storyLog.length})</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setViewMode('tree');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>🌳</span>
                <span>Elágazási Fa</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  TÉRKÉP
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setViewMode('sync');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'sync'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-400/80 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>🌀</span>
                <span>Emlékszinkronizáció</span>
                <span className="text-[10px] text-purple-300 tabular-nums">({echoes.length})</span>
              </button>
            </div>

            {/* COPY & CLOSE BUTTONS */}
            <div className="flex items-center gap-2">
              {viewMode === 'log' && (
                <button
                  onClick={handleCopyTranscript}
                  title="Teljes napló másolása szövegként"
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{copied ? '✓ Másolva!' : '📋 Másolás'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-700 hover:border-red-500/50 bg-slate-900/80 hover:bg-red-950/40 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                ✕ Bezárás [ESC]
              </button>
            </div>
          </div>

          {/* METRICS & QUICK SUMMARY (SHOWN IN LOG VIEW) */}
          {viewMode === 'log' && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/60 mt-3">
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">{storyLog.length}</span>
                <span>szakasz rögzítve</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-amber-400 font-bold">{choicesCount}</span>
                <span>kulcsdöntés</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-slate-500">Jelenlegi pont:</span>
                <span className="text-cyan-300">{activeSceneId}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                  className="text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800"
                >
                  <span>{sortOrder === 'asc' ? '⬇️ Időrendi' : '⬆️ Legfrissebb elöl'}</span>
                </button>

                {sortOrder === 'asc' && (
                  <button
                    onClick={scrollToBottom}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
                  >
                    Ugrás a végére ↓
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SEARCH & FILTER CONTROLS (SHOWN IN LOG VIEW) */}
          {viewMode === 'log' && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Keresés szövegben, szereplőben, döntésben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/70 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setFilterMode('all');
                    setSelectedSpeaker('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mind ({storyLog.length})
                </button>

                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setFilterMode('choices_only');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    filterMode === 'choices_only'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡ Csak döntések</span>
                  <span className="text-[10px] opacity-75">({choicesCount})</span>
                </button>

                {uniqueSpeakers.length > 1 && (
                  <select
                    value={filterMode === 'current_speaker' ? selectedSpeaker : 'all'}
                    onChange={(e) => {
                      soundEngine.playUiClick();
                      if (e.target.value === 'all') {
                        setFilterMode('all');
                        setSelectedSpeaker('all');
                      } else {
                        setFilterMode('current_speaker');
                        setSelectedSpeaker(e.target.value);
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="all">Szereplő szűrés...</option>
                    {uniqueSpeakers.map((spk) => (
                      <option key={spk} value={spk}>
                        {spk}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BODY: CONDITIONAL VIEW BETWEEN TREE, ECHO SYNC, AND LOG */}
        {viewMode === 'tree' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <StoryBranchingTree onClose={onClose} />
          </div>
        ) : viewMode === 'sync' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-slate-950">
            {/* Active Quests Overview */}
            <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-purple-300 font-bold uppercase tracking-wider">
                  Aktív Küldetések & Emlékszinkronizáció
                </span>
                <span className="text-cyan-300 tabular-nums">
                  Szinkronizálva: {syncedCount}/{echoes.length} Visszhang-emlék
                </span>
              </div>
              <h3 className="text-base font-cinzel font-bold text-slate-100">
                {missionCtx.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {missionCtx.objective}
              </p>
              {activeQuests.length > 1 && (
                <div className="pt-2 border-t border-purple-500/20 flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {activeQuests.slice(1, 5).map((q) => (
                    <span
                      key={q.id}
                      className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-cyan-200"
                    >
                      {q.source}: {q.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Recharts Memory Synchronization Graph */}
            <MemorySyncVisualizer
              echoes={echoes}
              syncedEchoIds={spiralState.worldState.syncedEchoIds}
              storyLog={storyLog}
              activeSceneId={activeSceneId}
              missionTitle={missionCtx.title}
              activeQuests={activeQuests}
              activePulseEchoId={activePulseEchoId}
              onTriggerSync={handleTriggerEchoSync}
              onSyncAllEchoes={handleSyncAllEchoes}
              onJumpToLogEntry={handleJumpToLogEntry}
            />

            {lastSyncBanner && (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/25 text-xs font-mono text-emerald-200">
                {lastSyncBanner}
              </div>
            )}

            {/* Dedicated 'Narratív Tippek' Section */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/15 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                    Narratív Tippek · Összevetve az Aktív Küldetésekkel
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Sikeresen szinkronizált múltbeli döntéseid és Visszhang-emlékeid alapján feltárt kontextuális útmutatások ({unlockedTips.length} feloldott tipp)
                  </p>
                </div>
              </div>

              {unlockedTips.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 text-xs font-mono text-slate-400">
                  Még nincs feloldott narratív tipped. Szinkronizálj egy Visszhang-emléket a fenti diagramon vagy az alábbi listában!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unlockedTips.map(({ echo, matchedQuest, matchedChoiceNote, tipText }) => (
                    <div
                      key={`tip_${echo.id}`}
                      className="p-3.5 rounded-xl bg-slate-950/85 border border-cyan-500/35 space-y-1.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px]">
                        <span className="text-amber-300 font-bold uppercase">
                          Célküldetés: {matchedQuest.title}
                        </span>
                        <span className="text-emerald-300">✓ Szinkronizálva</span>
                      </div>
                      <div className="font-cinzel font-bold text-slate-100 text-sm">
                        {echo.title}
                      </div>
                      <div className="text-[11px] font-mono text-purple-300">
                        {matchedChoiceNote}
                      </div>
                      <p className="text-slate-200 leading-relaxed">{tipText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {echoes.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
                <div className="text-2xl">🌀</div>
                <div className="text-sm font-cinzel font-bold text-slate-200">
                  Még nincs rögzített Visszhang-emléked
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ahogy fontos történeti döntéseket hozol Viktor, Lena, Mira, Levente vagy Kódváros jeleneteiben, a Visszhang-emlékek automatikusan megjelennek itt, és konkrét Narratív Tippekké szinkronizálhatók.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {synchronizedTips.map(({ echo, isSynced, resonatesHere, matchedQuest, tipText }) => (
                  <div
                    key={echo.id}
                    className={`rounded-xl border p-4 transition-colors space-y-3 ${
                      isSynced
                        ? 'border-cyan-400/50 bg-cyan-950/15'
                        : 'border-slate-800 bg-slate-900/75'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-purple-300 font-bold uppercase">
                            Visszhang-emlék · {ECHO_CATEGORY_HU[echo.category] || echo.category}
                          </span>
                          {resonatesHere && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-400/40 text-amber-300">
                              Közvetlen rezonancia ebben a jelenetben
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm md:text-base font-cinzel font-bold text-slate-100 mt-0.5">
                          {echo.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{echo.description}</p>
                        <div className="text-[11px] font-mono text-cyan-300/80 mt-1">
                          Összevetett küldetés: {matchedQuest.title}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerEchoSync(echo.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                          isSynced
                            ? 'bg-slate-900 border border-cyan-500/40 text-cyan-200 hover:bg-slate-800'
                            : 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                        }`}
                      >
                        {isSynced ? '✓ Szinkronizálva (Újraolvasás)' : 'Emlék Szinkronizálása (+5 Rez.)'}
                      </button>
                    </div>

                    {isSynced ? (
                      <div className="p-3.5 rounded-xl bg-slate-950/85 border border-cyan-500/35 text-xs space-y-1.5">
                        <div className="font-mono font-bold text-cyan-300 uppercase text-[11px]">
                          Szinkronizált Narratív Tipp az Aktív Küldetéshez:
                        </div>
                        <p className="text-slate-200 leading-relaxed">{tipText}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-slate-500 italic">
                        Szinkronizáld ezt a visszhangot a fenti gombbal, hogy feloldd a hozzá tartozó Narratív Tippet!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* LOG ENTRIES TIMELINE BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-950">
              {/* Compact Narratív Tippek Panel inside Chronological Log */}
              {unlockedTips.length > 0 && (
                <div className="rounded-xl border border-amber-500/35 bg-amber-950/15 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-amber-300">
                      💡 Narratív Tippek ({unlockedTips.length} aktív szinkron)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playUiClick();
                        setShowLogTipsPanel((prev) => !prev);
                      }}
                      className="text-[11px] font-mono text-cyan-300 hover:underline cursor-pointer"
                    >
                      {showLogTipsPanel ? 'Elrejtés' : 'Megjelenítés'}
                    </button>
                  </div>
                  {showLogTipsPanel && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {unlockedTips.slice(0, 4).map(({ echo, matchedQuest, tipText }) => (
                        <div
                          key={`log_tip_${echo.id}`}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/25 text-xs space-y-1"
                        >
                          <div className="font-mono text-[10px] text-amber-300">
                            {echo.title} → {matchedQuest.title}
                          </div>
                          <p className="text-slate-200 leading-relaxed">{tipText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          {displayedEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono">
              <span className="text-3xl mb-2">📡</span>
              <p className="text-sm text-slate-400">Nincs a szűrésnek megfelelő naplóbejegyzés.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                  setSelectedSpeaker('all');
                }}
                className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Szűrők visszaállítása
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-5 space-y-6 pl-4 sm:pl-6">
              {displayedEntries.map((entry, index) => {
                const entryKey = entry.id || `${entry.sceneId}_${index}`;
                const isCurrentActive =
                  entry.sceneId === activeSceneId && !entry.chosenOption;
                const isHighlighted = highlightedEntryId === entry.id;
                const entryIndex = sortOrder === 'asc' ? index + 1 : displayedEntries.length - index;

                return (
                  <div
                    key={entryKey}
                    ref={(el) => {
                      if (entry.id) entryRefs.current[entry.id] = el;
                    }}
                    className={`relative rounded-xl border transition-all ${
                      isHighlighted
                        ? 'bg-purple-950/35 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.3)]'
                        : isCurrentActive
                        ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    } p-4 sm:p-5`}
                  >
                    {/* Node Dot on Timeline Line */}
                    <div
                      className={`absolute -left-[23px] sm:-left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 ${
                        isCurrentActive
                          ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_10px_#22d3ee] animate-pulse'
                          : entry.chosenOption
                          ? 'bg-amber-400 border-amber-200'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    />

                    {/* Metadata Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/70 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400/90">#{String(entryIndex).padStart(2, '0')}</span>
                        {entry.location && (
                          <span className="text-slate-300 flex items-center gap-1">
                            <span>📍</span>
                            <span>{entry.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.timestamp && <span>{entry.timestamp}</span>}
                        {entry.atmosphere && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">
                            {entry.atmosphere}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Speaker Header Card */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getSpeakerColorClass(
                          entry.speaker
                        )}`}
                      >
                        {entry.speaker}
                      </span>
                      {entry.speakerRole && (
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                          // {entry.speakerRole}
                        </span>
                      )}
                    </div>

                    {/* Narrative Dialogue / Text Content */}
                    <div className="text-sm sm:text-base font-sans text-slate-200 leading-relaxed whitespace-pre-line">
                      {entry.text}
                    </div>

                    {/* Technical Subtext note */}
                    {entry.subtext && (
                      <div className="mt-3 pt-2 text-xs font-mono text-cyan-300/80 italic flex items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                        <span>ℹ️</span>
                        <span>{entry.subtext}</span>
                      </div>
                    )}

                    {/* KEY PLAYER CHOICE BOX */}
                    {entry.chosenOption ? (
                      <div className="mt-4 pt-3 border-t border-amber-500/30 bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 sm:p-4">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Meghozott Döntésed</span>
                          </span>
                          <span className="text-[10px] text-amber-400/80 font-normal">
                            Rögzítve
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-cinzel font-semibold text-amber-100 mt-1">
                          « {entry.chosenOption.label} »
                        </div>
                        {entry.chosenOption.reflection && (
                          <p className="text-xs font-sans text-slate-300 italic mt-1.5 pl-2 border-l-2 border-amber-500/40">
                            {entry.chosenOption.reflection}
                          </p>
                        )}
                      </div>
                    ) : isCurrentActive ? (
                      <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-2 text-xs font-mono text-cyan-300">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span>Jelenlegi jelenet: választás folyamatban...</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Tekints vissza a képernyőre!</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Összesen: <strong className="text-slate-200">{storyLog.length}</strong> szakasz,{' '}
              <strong className="text-amber-300">{choicesCount}</strong> döntés
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/50 px-2 py-1 rounded">
                <span className="text-red-300 text-[11px]">Valóban törlöd az előzményeket?</span>
                <button
                  onClick={() => {
                    soundEngine.playDiscovery();
                    clearStoryLog();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Igen
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                >
                  Mégse
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-[11px]"
                title="Napló előzmények visszaállítása az aktuális pontra"
              >
                Napló alaphelyzet
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Vissza a Játékhoz
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
