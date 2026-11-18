import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SpiralState,
  GameChapterId,
  MemoryFragment,
  Relic,
  Achievement,
  RadioChannel,
  ChoiceOption,
  StoryLogEntry,
  SpiralAbility,
  AbilitySynergy,
  InspectableArtifact,
  EvidenceItem,
  EvidenceDeduction,
  PersonnelFile,
  ExpeditionLog,
  GuardianProgress,
  SecretDiscovery,
  EchoRecord,
  MiniGameId,
  SceneHotspot,
  RealityWarpState,
  PersonalityProfile,
} from '../types/game';
import {
  INITIAL_MEMORIES,
  INITIAL_RELICS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_RADIO_CHANNELS,
  GUARDIANS_LIST,
  STORY_NODES,
} from '../data/storyData';
import {
  INITIAL_ABILITIES,
  ABILITY_SYNERGIES,
  INITIAL_ARTIFACTS,
  INITIAL_EVIDENCE,
  INITIAL_DEDUCTIONS,
  PERSONNEL_DB,
  EXPEDITION_DB,
  GUARDIAN_DIMENSIONS,
  INITIAL_SECRETS,
} from '../data/expansionData';
import {
  KODVAROS_INHABITANTS,
  KODVAROS_QUESTS,
  KODVAROS_SIDE_QUESTS,
} from '../data/kodvarosData';
import { soundEngine } from '../audio/SoundEngine';

interface RadarDiscoveryReward {
  resonance?: number;
  artifactId?: string;
  evidenceId?: string;
  memoryId?: string;
  abilityId?: string;
  secretId?: string;
  isPrimaryAnomaly?: boolean;
}

interface GameContextType {
  spiralState: SpiralState;
  activeChapter: GameChapterId;
  activeSceneId: string;
  memories: MemoryFragment[];
  relics: Relic[];
  achievements: Achievement[];
  radioChannels: RadioChannel[];
  storyLog: StoryLogEntry[];
  abilities: SpiralAbility[];
  artifacts: InspectableArtifact[];
  evidence: EvidenceItem[];
  deductions: EvidenceDeduction[];
  personnel: PersonnelFile[];
  expeditions: ExpeditionLog[];
  secrets: SecretDiscovery[];
  guardianProgress: Record<number, GuardianProgress>;
  echoes: EchoRecord[];
  activeCinematicId: string | null;
  activeMiniGameId: MiniGameId | null;
  activeArtifactId: string | null;
  isFractured: boolean;
  reducedMotion: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  jumpToChapter: (chapter: GameChapterId, sceneId?: string) => void;
  makeChoice: (choice: ChoiceOption) => void;
  unlockMemory: (id: string) => void;
  acquireRelic: (id: string) => void;
  unlockAchievement: (id: string) => void;
  discoverRadioChannel: (frequency: number) => void;
  triggerRealityFracture: () => void;
  setReducedMotion: (val: boolean) => void;
  clearStoryLog: () => void;
  // Ultimate Expansion actions
  setActiveCinematicId: (id: string | null) => void;
  setActiveMiniGameId: (id: MiniGameId | null) => void;
  setActiveArtifactId: (id: string | null) => void;
  unlockAbility: (id: string) => void;
  upgradeAbility: (id: string) => { success: boolean; message: string };
  triggerSynergy: (abilityA: string, abilityB: string) => {
    success: boolean;
    synergy?: AbilitySynergy;
    message: string;
  };
  unlockArtifact: (id: string) => void;
  inspectArtifactPart: (artifactId: string, partId: string) => void;
  disassembleArtifact: (artifactId: string) => void;
  uvScanArtifact: (artifactId: string) => void;
  combineArtifacts: (idA: string, idB: string) => {
    success: boolean;
    resultId?: string;
    message: string;
  };
  unlockEvidence: (id: string) => void;
  analyzeEvidence: (id: string) => void;
  solveDeduction: (evA: string, evB: string) => {
    success: boolean;
    deduction?: EvidenceDeduction;
    message: string;
  };
  unlockSecret: (id: string) => void;
  unlockPersonnel: (id: string) => void;
  completeGuardianQuest: (guardianId: number, questId: string) => void;
  completeGuardianMiniGame: (guardianId: number) => void;
  makeGuardianPhilosophyChoice: (guardianId: number, choiceId: string) => void;
  unlockGuardianSecret: (guardianId: number) => void;
  discoverRadarTarget: (targetId: string, reward: RadarDiscoveryReward) => void;
  completeMiniGame: (id: MiniGameId, resonanceReward?: number) => void;
  completeCinematic: (id: string) => void;
  inspectHotspot: (hotspot: SceneHotspot) => { unlocked: boolean; message: string };
  updateRealityWarp: (patch: Partial<RealityWarpState>) => void;
  triggerNgPlusLoop: (endingId?: string) => void;
  addResonance: (amount: number) => void;
  talkToKodvarosTopic: (
    inhabitantId: string,
    topicId: string,
    branchId?: string,
    bonusResonance?: number
  ) => void;
  completeKodvarosQuest: (questId: string) => void;
  markKodvarosRingExplored: (ringId: 1 | 2 | 3) => void;
  exploreKodvarosLandmark: (landmarkId: string) => void;
  claimKodvarosSideQuest: (questId: string) => { success: boolean; message: string };
  syncEchoTip: (echoId: string) => { syncedNow: boolean };
}

const DEFAULT_PERSONALITY: PersonalityProfile = {
  analytical: 1,
  intuitive: 1,
  preserver: 0,
  releaser: 0,
  explorer: 1,
  architect: 0,
};

const DEFAULT_REALITY_WARP: RealityWarpState = {
  timelineLayer: '1982',
  gravityInverted: false,
  hiddenDoorsBridged: false,
  echoPermeability: 1,
  kodvarosSymmetry: 'order',
};

const DEFAULT_SPIRAL_STATE: SpiralState = {
  spiralAwareness: 12,
  memoryIntegrity: 78,
  timeStability: 85,
  realityIntegrity: 92,
  guardianAwareness: 0,
  consciousnessDepth: 1,
  resonancePoints: 30,
  choiceHistory: {},
  worldState: {
    radarAnomalyFound: false,
    obeliskTouched: false,
    radioFrequencyUnlocked: false,
    subglacialDescentComplete: false,
    lenaConsciousnessLinked: false,
    miraSecondGateOpened: false,
    leventeDreamAttuned: false,
    leventeChapterCompleted: false,
    kodvarosRingsCompleted: 0,
    kodvarosRing1Done: false,
    kodvarosRing2Done: false,
    kodvarosRing3Done: false,
    kodvarosTalkedInhabitants: [],
    kodvarosCompletedQuests: [],
    kodvarosExploredRings: [],
    kodvarosExploredLandmarks: [],
    kodvarosSolvedSideQuests: [],
    syncedEchoIds: [],
    kassarahMemoryHarmonized: false,
    irHayaOblivionAccepted: false,
    infiniteAcknowledged: false,
    chosenPath: null,
    discoveredRadarTargets: [],
    completedMiniGames: [],
    completedCinematics: [],
    unlockedSynergies: [],
    discoveredSecrets: [],
    inspectedHotspots: [],
  },
  personality: DEFAULT_PERSONALITY,
  realityWarp: DEFAULT_REALITY_WARP,
  echoCount: 0,
  loopState: 1,
  completedEndings: [],
};

const createInitialGuardianProgress = (): Record<number, GuardianProgress> => {
  const map: Record<number, GuardianProgress> = {};
  GUARDIANS_LIST.forEach((g) => {
    map[g.id] = {
      encountered: g.id === 1 || g.id === 2,
      completedQuestIds: [],
      miniGameCleared: false,
      philosophyChoiceId: null,
      secretUnlocked: false,
      realmCompleted: false,
    };
  });
  return map;
};

const STORAGE_KEY = 'spiral_breath_save_v1';

const GameContext = createContext<GameContextType | undefined>(undefined);

const mergeById = <T extends { id: string }>(defaults: T[], saved?: T[]): T[] => {
  if (!Array.isArray(saved) || saved.length === 0) return defaults;
  const savedMap = new Map(saved.map((item) => [item.id, item]));
  return defaults.map((def) => {
    const existing = savedMap.get(def.id);
    return existing ? { ...def, ...existing } : def;
  });
};

const readSavedData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // safe fallback
  }
  return null;
};

const chapterFromScene = (sceneId: string): GameChapterId => {
  if (sceneId.startsWith('v1_')) return 'chapter1_viktor';
  if (sceneId.startsWith('l1_') || sceneId === 'transition_to_lena') return 'chapter2_lena';
  if (sceneId.startsWith('m1_')) return 'chapter3_mira';
  if (sceneId.startsWith('lev1_')) return 'chapter4_levente';
  if (sceneId.startsWith('k1_')) return 'chapter5_kodvaros';
  if (sceneId.startsWith('g1_')) return 'chapter6_guardians';
  if (sceneId.startsWith('inf_') || sceneId.startsWith('ending_')) return 'chapter_final';
  return 'chapter1_viktor';
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spiralState, setSpiralState] = useState<SpiralState>(() => {
    const parsed = readSavedData();
    if (parsed?.spiralState) {
      return {
        ...DEFAULT_SPIRAL_STATE,
        ...parsed.spiralState,
        worldState: {
          ...DEFAULT_SPIRAL_STATE.worldState,
          ...(parsed.spiralState.worldState || {}),
          discoveredRadarTargets: parsed.spiralState.worldState?.discoveredRadarTargets || [],
          completedMiniGames: parsed.spiralState.worldState?.completedMiniGames || [],
          completedCinematics: parsed.spiralState.worldState?.completedCinematics || [],
          unlockedSynergies: parsed.spiralState.worldState?.unlockedSynergies || [],
          discoveredSecrets: parsed.spiralState.worldState?.discoveredSecrets || [],
          inspectedHotspots: parsed.spiralState.worldState?.inspectedHotspots || [],
          kodvarosTalkedInhabitants: parsed.spiralState.worldState?.kodvarosTalkedInhabitants || [],
          kodvarosCompletedQuests: parsed.spiralState.worldState?.kodvarosCompletedQuests || [],
          kodvarosExploredRings: parsed.spiralState.worldState?.kodvarosExploredRings || [],
          kodvarosExploredLandmarks: parsed.spiralState.worldState?.kodvarosExploredLandmarks || [],
          kodvarosSolvedSideQuests: parsed.spiralState.worldState?.kodvarosSolvedSideQuests || [],
          syncedEchoIds: parsed.spiralState.worldState?.syncedEchoIds || [],
          kodvarosRing1Done:
            typeof parsed.spiralState.worldState?.kodvarosRing1Done === 'boolean'
              ? parsed.spiralState.worldState.kodvarosRing1Done
              : ['g1_guardians_confrontation', 'inf_final_encounter', 'ending_close', 'ending_share', 'ending_new_world', 'ending_meta_room'].includes(
                  parsed?.activeSceneId
                ),
          kodvarosRing2Done:
            typeof parsed.spiralState.worldState?.kodvarosRing2Done === 'boolean'
              ? parsed.spiralState.worldState.kodvarosRing2Done
              : ['g1_guardians_confrontation', 'inf_final_encounter', 'ending_close', 'ending_share', 'ending_new_world', 'ending_meta_room'].includes(
                  parsed?.activeSceneId
                ),
          kodvarosRing3Done:
            typeof parsed.spiralState.worldState?.kodvarosRing3Done === 'boolean'
              ? parsed.spiralState.worldState.kodvarosRing3Done
              : ['g1_guardians_confrontation', 'inf_final_encounter', 'ending_close', 'ending_share', 'ending_new_world', 'ending_meta_room'].includes(
                  parsed?.activeSceneId
                ),
          leventeChapterCompleted:
            typeof parsed.spiralState.worldState?.leventeChapterCompleted === 'boolean'
              ? parsed.spiralState.worldState.leventeChapterCompleted
              : ['k1_three_rings', 'g1_guardians_confrontation', 'inf_final_encounter', 'ending_close', 'ending_share', 'ending_new_world', 'ending_meta_room'].includes(
                  parsed?.activeSceneId
                ),
        },
        personality: {
          ...DEFAULT_PERSONALITY,
          ...(parsed.spiralState.personality || {}),
        },
        realityWarp: {
          ...DEFAULT_REALITY_WARP,
          ...(parsed.spiralState.realityWarp || {}),
        },
        completedEndings: parsed.spiralState.completedEndings || [],
      };
    }
    return DEFAULT_SPIRAL_STATE;
  });

  const [activeChapter, setActiveChapter] = useState<GameChapterId>('menu');
  const [activeSceneId, setActiveSceneId] = useState<string>(() => {
    const parsed = readSavedData();
    return typeof parsed?.activeSceneId === 'string' && STORY_NODES[parsed.activeSceneId]
      ? parsed.activeSceneId
      : 'v1_intro';
  });

  const [memories, setMemories] = useState<MemoryFragment[]>(() =>
    mergeById(INITIAL_MEMORIES, readSavedData()?.memories)
  );
  const [relics, setRelics] = useState<Relic[]>(() =>
    mergeById(INITIAL_RELICS, readSavedData()?.relics)
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    mergeById(INITIAL_ACHIEVEMENTS, readSavedData()?.achievements)
  );
  const [radioChannels, setRadioChannels] = useState<RadioChannel[]>(() => {
    const parsed = readSavedData();
    if (!Array.isArray(parsed?.radioChannels)) return INITIAL_RADIO_CHANNELS;
    return INITIAL_RADIO_CHANNELS.map((c) => {
      const found = parsed.radioChannels.find((sc: RadioChannel) => sc.frequency === c.frequency);
      return found ? { ...c, ...found } : c;
    });
  });

  const [abilities, setAbilities] = useState<SpiralAbility[]>(() =>
    mergeById(INITIAL_ABILITIES, readSavedData()?.abilities)
  );

  const [artifacts, setArtifacts] = useState<InspectableArtifact[]>(() => {
    const parsed = readSavedData();
    if (!Array.isArray(parsed?.artifacts)) return INITIAL_ARTIFACTS;
    return INITIAL_ARTIFACTS.map((def) => {
      const savedArt = parsed.artifacts.find((a: InspectableArtifact) => a.id === def.id);
      if (!savedArt) return def;
      return {
        ...def,
        ...savedArt,
        parts: mergeById(def.parts, savedArt.parts),
      };
    });
  });

  const [evidence, setEvidence] = useState<EvidenceItem[]>(() =>
    mergeById(INITIAL_EVIDENCE, readSavedData()?.evidence)
  );
  const [deductions, setDeductions] = useState<EvidenceDeduction[]>(() =>
    mergeById(INITIAL_DEDUCTIONS, readSavedData()?.deductions)
  );
  const [personnel, setPersonnel] = useState<PersonnelFile[]>(() =>
    mergeById(PERSONNEL_DB, readSavedData()?.personnel)
  );
  const [expeditions, setExpeditions] = useState<ExpeditionLog[]>(() =>
    mergeById(EXPEDITION_DB, readSavedData()?.expeditions)
  );
  const [secrets, setSecrets] = useState<SecretDiscovery[]>(() =>
    mergeById(INITIAL_SECRETS, readSavedData()?.secrets)
  );

  const [guardianProgress, setGuardianProgress] = useState<Record<number, GuardianProgress>>(() => {
    const parsed = readSavedData();
    const base = createInitialGuardianProgress();
    if (parsed?.guardianProgress) {
      Object.keys(base).forEach((k) => {
        const num = Number(k);
        if (parsed.guardianProgress[num]) {
          base[num] = { ...base[num], ...parsed.guardianProgress[num] };
        }
      });
    }
    return base;
  });

  const [echoes, setEchoes] = useState<EchoRecord[]>(() => {
    const parsed = readSavedData();
    return Array.isArray(parsed?.echoes) ? parsed.echoes : [];
  });

  const buildStoryLogEntry = (
    sceneId: string,
    chosenOption?: StoryLogEntry['chosenOption']
  ): StoryLogEntry => {
    const node = STORY_NODES[sceneId];
    return {
      id: `log_${Date.now()}_${sceneId}_${Math.random().toString(36).substring(2, 7)}`,
      sceneId,
      speaker: node?.speaker || 'ISMERETLEN NARRÁCIÓ',
      speakerRole: node?.speakerRole,
      location: node?.location,
      timestamp: node?.timestamp,
      text: node?.text || '',
      subtext: node?.subtext,
      atmosphere: node?.atmosphere,
      chosenOption,
      recordedAt: Date.now(),
    };
  };

  const [storyLog, setStoryLog] = useState<StoryLogEntry[]>(() => {
    const parsed = readSavedData();
    if (Array.isArray(parsed?.storyLog) && parsed.storyLog.length > 0) {
      return parsed.storyLog;
    }
    return [buildStoryLogEntry('v1_intro')];
  });

  const [activeCinematicId, setActiveCinematicId] = useState<string | null>(null);
  const [activeMiniGameId, setActiveMiniGameId] = useState<MiniGameId | null>(null);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [isFractured, setIsFractured] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Autosave everything deterministically
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          spiralState,
          activeSceneId,
          memories,
          relics,
          achievements,
          radioChannels,
          storyLog,
          abilities,
          artifacts,
          evidence,
          deductions,
          personnel,
          expeditions,
          secrets,
          guardianProgress,
          echoes,
        })
      );
    } catch {
      // Safe storage
    }
  }, [
    spiralState,
    activeSceneId,
    memories,
    relics,
    achievements,
    radioChannels,
    storyLog,
    abilities,
    artifacts,
    evidence,
    deductions,
    personnel,
    expeditions,
    secrets,
    guardianProgress,
    echoes,
  ]);

  // Track scene visits in storyLog
  useEffect(() => {
    setStoryLog((prev) => {
      if (prev.length === 0) return [buildStoryLogEntry(activeSceneId)];
      const last = prev[prev.length - 1];
      if (last.sceneId === activeSceneId) return prev;
      return [...prev, buildStoryLogEntry(activeSceneId)];
    });

    if (activeSceneId.startsWith('ending_')) {
      setSpiralState((prev) => ({
        ...prev,
        completedEndings: prev.completedEndings.includes(activeSceneId)
          ? prev.completedEndings
          : [...prev.completedEndings, activeSceneId],
      }));
    }

    const visitedRing: 1 | 2 | 3 | null = activeSceneId.startsWith('k1_ring1_')
      ? 1
      : activeSceneId.startsWith('k1_ring2_')
      ? 2
      : activeSceneId.startsWith('k1_ring3_')
      ? 3
      : null;

    if (visitedRing !== null) {
      setSpiralState((prev) => {
        if (prev.worldState.kodvarosExploredRings.includes(visitedRing)) return prev;
        return {
          ...prev,
          worldState: {
            ...prev.worldState,
            kodvarosExploredRings: [...prev.worldState.kodvarosExploredRings, visitedRing],
          },
        };
      });
    }
  }, [activeSceneId]);

  const addResonance = (amount: number) => {
    if (!amount) return;
    setSpiralState((prev) => ({
      ...prev,
      resonancePoints: Math.max(0, prev.resonancePoints + amount),
    }));
  };

  const unlockMemory = (id: string) => {
    setMemories((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target && !target.isUnlocked) soundEngine.playDiscovery();
      return prev.map((m) => (m.id === id ? { ...m, isUnlocked: true } : m));
    });
  };

  const acquireRelic = (id: string) => {
    setRelics((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target && !target.isAcquired) soundEngine.playDiscovery();
      return prev.map((r) => (r.id === id ? { ...r, isAcquired: true } : r));
    });
  };

  const unlockAchievement = (id: string) => {
    setAchievements((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && !target.isUnlocked) soundEngine.playDiscovery();
      return prev.map((a) =>
        a.id === id ? { ...a, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('hu-HU') } : a
      );
    });
  };

  const discoverRadioChannel = (frequency: number) => {
    setRadioChannels((prev) =>
      prev.map((c) => (c.frequency === frequency ? { ...c, discovered: true } : c))
    );
    if (Math.abs(frequency - 82.0) < 0.2) {
      unlockEvidence('ev_1982_morse_tape');
      setSpiralState((prev) => ({
        ...prev,
        worldState: { ...prev.worldState, radioFrequencyUnlocked: true },
      }));
    }
    if (Math.abs(frequency - 142.8) < 0.2) {
      unlockEvidence('ev_1983_lena_voice');
      unlockAbility('ab_echo_sight');
    }
  };

  const triggerRealityFracture = () => {
    setIsFractured(true);
    soundEngine.playRealityFracture();
    setTimeout(() => {
      setIsFractured(false);
    }, 700);
  };

  const unlockAbility = (id: string) => {
    setAbilities((prev) =>
      prev.map((ab) => (ab.id === id && ab.level === 0 ? { ...ab, level: 1 } : ab))
    );
  };

  const upgradeAbility = (id: string): { success: boolean; message: string } => {
    const target = abilities.find((a) => a.id === id);
    if (!target) return { success: false, message: 'Ismeretlen képesség.' };
    if (target.level >= target.maxLevel) {
      return { success: false, message: 'A képesség már elérte a maximális 3. szintet.' };
    }
    const cost = target.level === 0 ? 35 : 20 * target.level;
    if (spiralState.resonancePoints < cost) {
      return {
        success: false,
        message: `Legalább ${cost} Rezonancia-pont szükséges (${spiralState.resonancePoints} elérhető).`,
      };
    }

    setSpiralState((prev) => ({ ...prev, resonancePoints: prev.resonancePoints - cost }));
    setAbilities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, level: Math.min(a.maxLevel, a.level + 1) } : a))
    );
    soundEngine.playAbilityActivate(target.level + 1);
    return {
      success: true,
      message:
        target.level === 0
          ? `${target.name} feloldva (1. szint)!`
          : `${target.name} fejlesztve a ${target.level + 1}. szintre!`,
    };
  };

  const triggerSynergy = (
    abilityA: string,
    abilityB: string
  ): { success: boolean; synergy?: AbilitySynergy; message: string } => {
    const ab1 = abilities.find((a) => a.id === abilityA);
    const ab2 = abilities.find((a) => a.id === abilityB);
    if (!ab1 || !ab2 || ab1.level === 0 || ab2.level === 0) {
      return { success: false, message: 'Mindkét képességnek aktívnak kell lennie a szinergiához.' };
    }

    const match = ABILITY_SYNERGIES.find(
      (s) =>
        (s.abilityA === abilityA && s.abilityB === abilityB) ||
        (s.abilityA === abilityB && s.abilityB === abilityA)
    );

    if (!match) {
      soundEngine.playMechanicalTick(-1);
      return {
        success: false,
        message: 'Ez a két képesség jelenleg nem képez közvetlen rezonáns szinergiát.',
      };
    }

    const alreadyUnlocked = spiralState.worldState.unlockedSynergies.includes(match.id);
    if (!alreadyUnlocked) {
      soundEngine.playHarmonicChord([432, 528, 639]);
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + 25,
        spiralAwareness: Math.min(100, prev.spiralAwareness + 8),
        worldState: {
          ...prev.worldState,
          unlockedSynergies: [...prev.worldState.unlockedSynergies, match.id],
        },
      }));
      if (match.unlockMemoryId) unlockMemory(match.unlockMemoryId);
      if (match.unlockSecretId) unlockSecret(match.unlockSecretId);
      setEchoes((prev) => [
        {
          id: `echo_syn_${match.id}_${Date.now()}`,
          originSceneId: activeSceneId,
          title: `Szinergia: ${match.title}`,
          description: match.description,
          manifestationText: match.secretRevealed,
          targetScenes: ['k1_three_rings', 'g1_guardians_confrontation', 'inf_final_encounter'],
          createdAt: Date.now(),
          category: 'discovery',
        },
        ...prev,
      ]);
    } else {
      soundEngine.playCrystalResonance(528);
    }

    return {
      success: true,
      synergy: match,
      message: alreadyUnlocked
        ? `Szinergia újraaktiválva: ${match.title}`
        : `Új szinergia feltárva: ${match.title} (+25 Rezonancia)`,
    };
  };

  const unlockArtifact = (id: string) => {
    setArtifacts((prev) =>
      prev.map((art) => (art.id === id ? { ...art, isUnlocked: true } : art))
    );
  };

  const inspectArtifactPart = (artifactId: string, partId: string) => {
    let newlyInspected = false;
    setArtifacts((prev) =>
      prev.map((art) => {
        if (art.id !== artifactId) return art;
        return {
          ...art,
          parts: art.parts.map((p) => {
            if (p.id === partId && !p.isInspected) {
              newlyInspected = true;
              return { ...p, isInspected: true };
            }
            return p;
          }),
        };
      })
    );
    soundEngine.playMechanicalTick(2);
    if (newlyInspected) addResonance(5);
  };

  const disassembleArtifact = (artifactId: string) => {
    setArtifacts((prev) =>
      prev.map((art) => (art.id === artifactId ? { ...art, isDisassembled: !art.isDisassembled } : art))
    );
    soundEngine.playMechanicalTick(0);
  };

  const uvScanArtifact = (artifactId: string) => {
    const target = artifacts.find((a) => a.id === artifactId);
    if (target && !target.isUvScanned) {
      addResonance(10);
      soundEngine.playCrystalResonance(639);
    } else {
      soundEngine.playUiClick();
    }
    setArtifacts((prev) =>
      prev.map((art) => (art.id === artifactId ? { ...art, isUvScanned: true } : art))
    );
  };

  const combineArtifacts = (
    idA: string,
    idB: string
  ): { success: boolean; resultId?: string; message: string } => {
    const artA = artifacts.find((a) => a.id === idA);
    const artB = artifacts.find((a) => a.id === idB);
    if (!artA || !artB || !artA.isUnlocked || !artB.isUnlocked) {
      return { success: false, message: 'Mindkét tárgyat meg kell szerezned az egyesítéshez.' };
    }
    const matches =
      (artA.combinableWithId === artB.id && artA.combinationResultId) ||
      (artB.combinableWithId === artA.id && artB.combinationResultId);

    if (!matches) {
      soundEngine.playMechanicalTick(-2);
      return { success: false, message: 'Ezek a tárgyak nem illeszthetők össze mechanikusan.' };
    }

    const resultId = artA.combinationResultId || artB.combinationResultId || 'art_harmonic_beacon';
    const resultArt = artifacts.find((a) => a.id === resultId);
    if (resultArt && !resultArt.isUnlocked) {
      unlockArtifact(resultId);
      addResonance(35);
      unlockAbility('ab_ninth_gaze');
      soundEngine.playHarmonicChord([432, 528, 741]);
      return {
        success: true,
        resultId,
        message: `Sikeres szintézis! Létrejött: ${resultArt.name} (+35 Rezonancia, Kilencedik Tekintet feloldva).`,
      };
    }
    return {
      success: true,
      resultId,
      message: `${resultArt?.name || 'Spirál-Rezonátor'} már aktív a leltáradban.`,
    };
  };

  const unlockEvidence = (id: string) => {
    setEvidence((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target && !target.isUnlocked) soundEngine.playDiscovery();
      return prev.map((e) => (e.id === id ? { ...e, isUnlocked: true } : e));
    });
  };

  const analyzeEvidence = (id: string) => {
    const target = evidence.find((e) => e.id === id);
    if (target && !target.isAnalyzed) {
      addResonance(10);
      soundEngine.playCrystalResonance(528);
    }
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isAnalyzed: true } : e))
    );
  };

  const solveDeduction = (
    evA: string,
    evB: string
  ): { success: boolean; deduction?: EvidenceDeduction; message: string } => {
    const match = deductions.find(
      (d) =>
        (d.evidenceA === evA && d.evidenceB === evB) ||
        (d.evidenceA === evB && d.evidenceB === evA)
    );
    if (!match) {
      soundEngine.playMechanicalTick(-1);
      return {
        success: false,
        message: 'Nincs közvetlen ok-okozati összefüggés e két bizonyíték között.',
      };
    }

    if (!match.isSolved) {
      setDeductions((prev) =>
        prev.map((d) => (d.id === match.id ? { ...d, isSolved: true } : d))
      );
      addResonance(match.rewardResonance);
      if (match.unlockMemoryId) unlockMemory(match.unlockMemoryId);
      if (match.unlockSecretId) unlockSecret(match.unlockSecretId);
      if (match.id === 'ded_1959_connection') unlockPersonnel('per_kovacs');
      soundEngine.playHarmonicChord([396, 528, 639]);
      return {
        success: true,
        deduction: { ...match, isSolved: true },
        message: `Új következtetés rögzítve: ${match.title} (+${match.rewardResonance} Rezonancia)`,
      };
    }

    return {
      success: true,
      deduction: match,
      message: `Ez az összefüggés már az Archívum része: ${match.title}`,
    };
  };

  const unlockSecret = (id: string) => {
    setSecrets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isUnlocked: true } : s))
    );
    setSpiralState((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        discoveredSecrets: prev.worldState.discoveredSecrets.includes(id)
          ? prev.worldState.discoveredSecrets
          : [...prev.worldState.discoveredSecrets, id],
      },
    }));
  };

  const unlockPersonnel = (id: string) => {
    setPersonnel((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isUnlocked: true } : p))
    );
  };

  const checkRealmCompleted = (prog: GuardianProgress) =>
    prog.completedQuestIds.length >= 3 && prog.miniGameCleared && prog.philosophyChoiceId !== null;

  const completeGuardianQuest = (guardianId: number, questId: string) => {
    setGuardianProgress((prev) => {
      const curr = prev[guardianId] || {
        encountered: true,
        completedQuestIds: [],
        miniGameCleared: false,
        philosophyChoiceId: null,
        secretUnlocked: false,
        realmCompleted: false,
      };
      if (curr.completedQuestIds.includes(questId)) return prev;
      const updated: GuardianProgress = {
        ...curr,
        encountered: true,
        completedQuestIds: [...curr.completedQuestIds, questId],
      };
      updated.realmCompleted = checkRealmCompleted(updated);
      addResonance(15);
      soundEngine.playDiscovery();
      return { ...prev, [guardianId]: updated };
    });
  };

  const completeGuardianMiniGame = (guardianId: number) => {
    const dim = GUARDIAN_DIMENSIONS.find((d) => d.guardianId === guardianId);
    const questMiniGame = dim?.quests.find((q) => q.objectiveType === 'minigame');
    setGuardianProgress((prev) => {
      const curr = prev[guardianId];
      if (!curr) return prev;
      const questIds =
        questMiniGame && !curr.completedQuestIds.includes(questMiniGame.id)
          ? [...curr.completedQuestIds, questMiniGame.id]
          : curr.completedQuestIds;
      const updated: GuardianProgress = {
        ...curr,
        encountered: true,
        miniGameCleared: true,
        completedQuestIds: questIds,
      };
      updated.realmCompleted = checkRealmCompleted(updated);
      return { ...prev, [guardianId]: updated };
    });
  };

  const makeGuardianPhilosophyChoice = (guardianId: number, choiceId: string) => {
    const dim = GUARDIAN_DIMENSIONS.find((d) => d.guardianId === guardianId);
    const questPhil = dim?.quests.find((q) => q.objectiveType === 'philosophy');
    const selectedChoice = dim?.philosophicalChoices.find((c) => c.id === choiceId);

    setGuardianProgress((prev) => {
      const curr = prev[guardianId];
      if (!curr) return prev;
      const wasChosenBefore = curr.philosophyChoiceId !== null;
      const questIds =
        questPhil && !curr.completedQuestIds.includes(questPhil.id)
          ? [...curr.completedQuestIds, questPhil.id]
          : curr.completedQuestIds;
      const updated: GuardianProgress = {
        ...curr,
        encountered: true,
        philosophyChoiceId: choiceId,
        completedQuestIds: questIds,
      };
      updated.realmCompleted = checkRealmCompleted(updated);
      if (!wasChosenBefore) {
        addResonance(25);
        setSpiralState((sp) => ({
          ...sp,
          guardianAwareness: Math.min(9, sp.guardianAwareness + 1),
          personality: selectedChoice
            ? {
                ...sp.personality,
                [selectedChoice.alignment]: sp.personality[selectedChoice.alignment] + 2,
              }
            : sp.personality,
        }));
      }
      return { ...prev, [guardianId]: updated };
    });

    if (selectedChoice) {
      setEchoes((prev) => [
        {
          id: `echo_guard_${guardianId}_${Date.now()}`,
          originSceneId: activeSceneId,
          title: `${GUARDIANS_LIST.find((g) => g.id === guardianId)?.name || 'Őrző'} Próbája`,
          description: selectedChoice.label,
          manifestationText: selectedChoice.consequenceText,
          targetScenes: ['g1_guardians_confrontation', 'inf_final_encounter'],
          createdAt: Date.now(),
          category: 'guardian',
        },
        ...prev,
      ]);
    }
    soundEngine.playHarmonicChord([432, 528]);
  };

  const unlockGuardianSecret = (guardianId: number) => {
    const dim = GUARDIAN_DIMENSIONS.find((d) => d.guardianId === guardianId);
    if (!dim) return;
    const reqAbility = abilities.find((a) => a.id === dim.requiredAbilityId);
    if (!reqAbility || reqAbility.level === 0) return;

    setGuardianProgress((prev) => {
      const curr = prev[guardianId];
      if (!curr || curr.secretUnlocked) return prev;
      addResonance(20);
      soundEngine.playDiscovery();
      return {
        ...prev,
        [guardianId]: { ...curr, encountered: true, secretUnlocked: true },
      };
    });
  };

  const discoverRadarTarget = (targetId: string, reward: RadarDiscoveryReward) => {
    const already = spiralState.worldState.discoveredRadarTargets.includes(targetId);
    if (!already) {
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + (reward.resonance || 20),
        worldState: {
          ...prev.worldState,
          radarAnomalyFound: prev.worldState.radarAnomalyFound || Boolean(reward.isPrimaryAnomaly),
          discoveredRadarTargets: [...prev.worldState.discoveredRadarTargets, targetId],
        },
      }));
      if (reward.artifactId) unlockArtifact(reward.artifactId);
      if (reward.evidenceId) unlockEvidence(reward.evidenceId);
      if (reward.memoryId) unlockMemory(reward.memoryId);
      if (reward.abilityId) unlockAbility(reward.abilityId);
      if (reward.secretId) unlockSecret(reward.secretId);
      soundEngine.playDiscovery();
    }
  };

  const completeMiniGame = (id: MiniGameId, resonanceReward = 25) => {
    const firstTime = !spiralState.worldState.completedMiniGames.includes(id);
    if (firstTime) {
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + resonanceReward,
        spiralAwareness: Math.min(100, prev.spiralAwareness + 5),
        worldState: {
          ...prev.worldState,
          completedMiniGames: [...prev.worldState.completedMiniGames, id],
        },
      }));
      if (id === 'crystal_resonance') unlockAbility('ab_crystal_harmony');
      if (id === 'symbol_translation') unlockAbility('ab_spiral_decode');
      if (id === 'light_shadow') unlockAbility('ab_light_split');
      if (id === 'gravity_puzzle') unlockAbility('ab_gravity_axis');
      if (id === 'memory_reconstruction') unlockAbility('ab_memory_preserve');
      if (id === 'consciousness_trial') unlockAbility('ab_oblivion_seal');
      if (id === 'nine_layer_final') unlockAbility('ab_ninth_gaze');
      if (id === 'coordinate_triangulation') unlockEvidence('ev_crystal_vein');
      if (id === 'echo_viaduct_tuning') completeKodvarosQuest('kq_r2_viaduct');
      if (id === 'mirror_city_symmetry') completeKodvarosQuest('kq_r3_symmetry');
      soundEngine.playHarmonicChord([432, 528, 639]);
    }
  };

  const completeKodvarosQuest = (questId: string) => {
    const q = KODVAROS_QUESTS.find((item) => item.id === questId);
    if (!q) return;
    const alreadyDone = spiralState.worldState.kodvarosCompletedQuests.includes(questId);
    if (alreadyDone) return;
    setSpiralState((prev) => ({
      ...prev,
      resonancePoints: prev.resonancePoints + q.rewardResonance,
      worldState: {
        ...prev.worldState,
        kodvarosCompletedQuests: [...prev.worldState.kodvarosCompletedQuests, questId],
      },
    }));
    if (q.unlockMemoryId) unlockMemory(q.unlockMemoryId);
    soundEngine.playDiscovery();
  };

  const talkToKodvarosTopic = (
    inhabitantId: string,
    topicId: string,
    branchId?: string,
    bonusResonance = 0
  ) => {
    const npc = KODVAROS_INHABITANTS.find((n) => n.id === inhabitantId);
    const topic = npc?.topics.find((t) => t.id === topicId);
    if (!npc || !topic) return;

    const firstTimeTopic = !spiralState.worldState.kodvarosTalkedInhabitants.includes(topicId);
    const firstTimeBranch = Boolean(
      branchId && !spiralState.worldState.kodvarosTalkedInhabitants.includes(branchId)
    );
    const nextKeys = [
      ...(spiralState.worldState.kodvarosTalkedInhabitants.includes(inhabitantId) ? [] : [inhabitantId]),
      ...(firstTimeTopic ? [topicId] : []),
      ...(firstTimeBranch && branchId ? [branchId] : []),
    ];

    const reward =
      (firstTimeTopic ? topic.resonanceReward || 10 : 0) + (firstTimeBranch ? bonusResonance : 0);

    if (nextKeys.length > 0 || reward > 0) {
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + reward,
        worldState: {
          ...prev.worldState,
          kodvarosTalkedInhabitants: Array.from(
            new Set([...prev.worldState.kodvarosTalkedInhabitants, ...nextKeys])
          ),
        },
      }));
    }

    if (topic.unlockSecretId) unlockSecret(topic.unlockSecretId);

    // Check dialogue-based Kódváros quests
    KODVAROS_QUESTS.forEach((q) => {
      if (q.objectiveType === 'dialogue' && q.requiredTargetId === topicId) {
        completeKodvarosQuest(q.id);
      }
    });

    soundEngine.playUiClick();
  };

  const markKodvarosRingExplored = (ringId: 1 | 2 | 3) => {
    setSpiralState((prev) => {
      if (prev.worldState.kodvarosExploredRings.includes(ringId)) return prev;
      return {
        ...prev,
        worldState: {
          ...prev.worldState,
          kodvarosExploredRings: [...prev.worldState.kodvarosExploredRings, ringId],
        },
      };
    });
  };

  const exploreKodvarosLandmark = (landmarkId: string) => {
    setSpiralState((prev) => {
      if (prev.worldState.kodvarosExploredLandmarks.includes(landmarkId)) return prev;
      return {
        ...prev,
        resonancePoints: prev.resonancePoints + 5,
        worldState: {
          ...prev.worldState,
          kodvarosExploredLandmarks: [...prev.worldState.kodvarosExploredLandmarks, landmarkId],
        },
      };
    });
    soundEngine.playUiClick();
  };

  const claimKodvarosSideQuest = (questId: string): { success: boolean; message: string } => {
    const sq = KODVAROS_SIDE_QUESTS.find((item) => item.id === questId);
    if (!sq) return { success: false, message: 'Ismeretlen mellékküldetés.' };
    if (spiralState.worldState.kodvarosSolvedSideQuests.includes(questId)) {
      return { success: false, message: 'Ez a mellékküldetés már teljesítve lett.' };
    }
    const npcDone = spiralState.worldState.kodvarosTalkedInhabitants.includes(sq.requiredTopicId);
    const mgDone = spiralState.worldState.completedMiniGames.includes(sq.requiredMiniGameId);
    if (!npcDone || !mgDone) {
      soundEngine.playMechanicalTick(-2);
      return {
        success: false,
        message: 'Előbb teljesítsd a lakói párbeszédet és a hozzá tartozó minijátékot!',
      };
    }

    setSpiralState((prev) => ({
      ...prev,
      resonancePoints: prev.resonancePoints + sq.rewardResonance,
      spiralAwareness: Math.min(100, prev.spiralAwareness + 5),
      worldState: {
        ...prev.worldState,
        kodvarosSolvedSideQuests: [...prev.worldState.kodvarosSolvedSideQuests, questId],
      },
    }));
    if (sq.unlockMemoryId) unlockMemory(sq.unlockMemoryId);
    if (sq.unlockSecretId) unlockSecret(sq.unlockSecretId);
    soundEngine.playHarmonicChord([396, 528, 639]);
    return { success: true, message: `${sq.title} lezárva (+${sq.rewardResonance} Rezonancia)!` };
  };

  const syncEchoTip = (echoId: string): { syncedNow: boolean } => {
    const alreadySynced = spiralState.worldState.syncedEchoIds.includes(echoId);
    if (!alreadySynced) {
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + 5,
        worldState: {
          ...prev.worldState,
          syncedEchoIds: [...prev.worldState.syncedEchoIds, echoId],
        },
      }));
      soundEngine.playAbilityActivate(2);
      return { syncedNow: true };
    }
    soundEngine.playUiClick();
    return { syncedNow: false };
  };

  const completeCinematic = (id: string) => {
    setSpiralState((prev) => {
      if (prev.worldState.completedCinematics.includes(id)) return prev;
      return {
        ...prev,
        resonancePoints: prev.resonancePoints + 25,
        worldState: {
          ...prev.worldState,
          completedCinematics: [...prev.worldState.completedCinematics, id],
        },
      };
    });
    setActiveCinematicId(null);
    soundEngine.playDiscovery();
  };

  const inspectHotspot = (hotspot: SceneHotspot): { unlocked: boolean; message: string } => {
    if (hotspot.requiredAbilityId) {
      const ab = abilities.find((a) => a.id === hotspot.requiredAbilityId);
      if (!ab || ab.level === 0) {
        soundEngine.playMechanicalTick(-2);
        return {
          unlocked: false,
          message: `Szükséges képesség: ${ab?.name || hotspot.requiredAbilityId}`,
        };
      }
    }
    if (hotspot.requiredRealityGravityInverted && !spiralState.realityWarp.gravityInverted) {
      soundEngine.playMechanicalTick(-2);
      return {
        unlocked: false,
        message: 'Ez az átjáró a mennyezeten van — használd a Valóság-szerkesztőben a Gravitáció-fordítást!',
      };
    }

    const firstTime = !spiralState.worldState.inspectedHotspots.includes(hotspot.id);
    if (firstTime) {
      setSpiralState((prev) => ({
        ...prev,
        resonancePoints: prev.resonancePoints + (hotspot.resonanceReward || 15),
        worldState: {
          ...prev.worldState,
          inspectedHotspots: [...prev.worldState.inspectedHotspots, hotspot.id],
        },
      }));
    }

    if (hotspot.evidenceId) unlockEvidence(hotspot.evidenceId);
    if (hotspot.artifactId) {
      unlockArtifact(hotspot.artifactId);
      setActiveArtifactId(hotspot.artifactId);
    }
    if (hotspot.miniGameId) {
      setActiveMiniGameId(hotspot.miniGameId);
    }
    soundEngine.playDiscovery();
    return { unlocked: true, message: hotspot.revealText };
  };

  const updateRealityWarp = (patch: Partial<RealityWarpState>) => {
    soundEngine.playTimelineShift();
    setSpiralState((prev) => ({
      ...prev,
      realityWarp: { ...prev.realityWarp, ...patch },
    }));
  };

  const triggerNgPlusLoop = (endingId?: string) => {
    soundEngine.startAmbientDrone();
    soundEngine.startIceBreathing();
    soundEngine.playTimelineShift();

    setSpiralState((prev) => {
      const endings =
        endingId && !prev.completedEndings.includes(endingId)
          ? [...prev.completedEndings, endingId]
          : prev.completedEndings;
      return {
        ...DEFAULT_SPIRAL_STATE,
        loopState: prev.loopState + 1,
        resonancePoints: prev.resonancePoints + 40,
        echoCount: prev.echoCount + 1,
        completedEndings: endings,
        personality: prev.personality,
        worldState: {
          ...DEFAULT_SPIRAL_STATE.worldState,
          discoveredSecrets: prev.worldState.discoveredSecrets,
          unlockedSynergies: prev.worldState.unlockedSynergies,
        },
      };
    });
    setActiveChapter('chapter1_viktor');
    setActiveSceneId('v1_intro');
    setStoryLog([buildStoryLogEntry('v1_intro')]);
  };

  const startNewGame = () => {
    soundEngine.startAmbientDrone();
    soundEngine.startIceBreathing();
    setSpiralState((prev) => ({
      ...DEFAULT_SPIRAL_STATE,
      loopState: prev.loopState > 1 || prev.completedEndings.length > 0 ? prev.loopState + 1 : 1,
      completedEndings: prev.completedEndings,
      resonancePoints: 30 + prev.completedEndings.length * 25,
    }));
    setActiveChapter('chapter1_viktor');
    setActiveSceneId('v1_intro');
    setStoryLog([buildStoryLogEntry('v1_intro')]);
  };

  const continueGame = () => {
    soundEngine.startAmbientDrone();
    soundEngine.startIceBreathing();
    setActiveChapter(chapterFromScene(activeSceneId));
  };

  const clearStoryLog = () => {
    setStoryLog([buildStoryLogEntry(activeSceneId)]);
  };

  const jumpToChapter = (chapter: GameChapterId, sceneId?: string) => {
    const isPostLeventeScene = Boolean(
      sceneId &&
        (sceneId.startsWith('k1_') ||
          sceneId.startsWith('g1_') ||
          sceneId.startsWith('inf_') ||
          sceneId.startsWith('ending_'))
    );
    const isLockedByLeventeGate =
      (chapter === 'chapter5_kodvaros' ||
        chapter === 'chapter6_guardians' ||
        chapter === 'chapter_final' ||
        isPostLeventeScene) &&
      !spiralState.worldState.leventeChapterCompleted;

    if (isLockedByLeventeGate) {
      soundEngine.playMechanicalTick(-2);
      return;
    }

    soundEngine.playUiClick();
    setActiveChapter(chapter);
    if (sceneId) {
      setActiveSceneId(sceneId);
      setStoryLog((prev) => {
        if (prev[prev.length - 1]?.sceneId === sceneId) return prev;
        return [...prev, buildStoryLogEntry(sceneId)];
      });
    }
  };

  const makeChoice = (choice: ChoiceOption) => {
    if (choice.requiresAbilityId) {
      const req = abilities.find((a) => a.id === choice.requiresAbilityId);
      if (!req || req.level === 0) return;
    }
    if (choice.requiresNgPlus && spiralState.loopState <= 1) {
      return;
    }
    if (choice.requiresChoiceIds && choice.requiresChoiceIds.length > 0) {
      const chosenIds = new Set(Object.values(spiralState.choiceHistory));
      if (!choice.requiresChoiceIds.every((id) => chosenIds.has(id))) return;
    }
    if (choice.requiresMinPersonality) {
      const entries = Object.entries(choice.requiresMinPersonality) as [keyof PersonalityProfile, number][];
      if (!entries.every(([k, minVal]) => (spiralState.personality[k] || 0) >= (minVal || 0))) {
        return;
      }
    }
    if (choice.requiresWorldFlags) {
      const flagEntries = Object.entries(choice.requiresWorldFlags) as [
        keyof SpiralState['worldState'],
        unknown
      ][];
      if (
        !flagEntries.every(([k, expected]) => {
          const futureOverride = choice.effect?.setWorldFlags?.[k];
          const actual = futureOverride !== undefined ? futureOverride : spiralState.worldState[k];
          return actual === expected;
        })
      ) {
        return;
      }
    }
    if (
      choice.requiresMiniGameId &&
      !spiralState.worldState.completedMiniGames.includes(choice.requiresMiniGameId)
    ) {
      return;
    }
    if (
      choice.nextSceneId === 'k1_three_rings' &&
      !spiralState.worldState.leventeChapterCompleted &&
      !choice.effect?.setWorldFlags?.leventeChapterCompleted
    ) {
      return;
    }

    // Check if returning from ending into NG+
    if (activeSceneId.startsWith('ending_') && choice.nextSceneId === 'v1_intro') {
      triggerNgPlusLoop(activeSceneId);
      return;
    }

    soundEngine.playUiClick();

    setStoryLog((prev) => {
      const chosenData = {
        id: choice.id,
        label: choice.label,
        reflection: choice.reflection,
      };

      if (prev.length === 0) {
        return [
          buildStoryLogEntry(activeSceneId, chosenData),
          buildStoryLogEntry(choice.nextSceneId),
        ];
      }

      const updated = [...prev];
      let targetIdx = -1;
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].sceneId === activeSceneId) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx === -1) targetIdx = updated.length - 1;

      updated[targetIdx] = { ...updated[targetIdx], chosenOption: chosenData };
      updated.push(buildStoryLogEntry(choice.nextSceneId));
      return updated;
    });

    // Apply personality bias & echo creation
    if (choice.echoCreated) {
      setEchoes((prev) => [
        {
          id: `echo_${choice.id}_${Date.now()}`,
          originSceneId: activeSceneId,
          title: choice.echoCreated!.title,
          description: choice.echoCreated!.description,
          manifestationText: choice.echoCreated!.manifestationText,
          targetScenes: choice.echoCreated!.targetScenes,
          createdAt: Date.now(),
          category: 'choice',
        },
        ...prev.slice(0, 19),
      ]);
    }

    setSpiralState((prev) => {
      const e = choice.effect || {};
      const pb = choice.personalityBias || {};
      const mergedWorldState = e.setWorldFlags
        ? { ...prev.worldState, ...e.setWorldFlags }
        : { ...prev.worldState };
      const ringCount = [
        mergedWorldState.kodvarosRing1Done,
        mergedWorldState.kodvarosRing2Done,
        mergedWorldState.kodvarosRing3Done,
      ].filter(Boolean).length;
      if (ringCount > mergedWorldState.kodvarosRingsCompleted) {
        mergedWorldState.kodvarosRingsCompleted = ringCount;
      }

      return {
        ...prev,
        spiralAwareness: Math.min(100, Math.max(0, prev.spiralAwareness + (e.spiralAwarenessDelta || 0))),
        memoryIntegrity: Math.min(100, Math.max(0, prev.memoryIntegrity + (e.memoryIntegrityDelta || 0))),
        timeStability: Math.min(100, Math.max(0, prev.timeStability + (e.timeStabilityDelta || 0))),
        realityIntegrity: Math.min(100, Math.max(0, prev.realityIntegrity + (e.realityIntegrityDelta || 0))),
        guardianAwareness: Math.min(9, Math.max(0, prev.guardianAwareness + (e.guardianAwarenessDelta || 0))),
        consciousnessDepth: Math.min(7, Math.max(1, prev.consciousnessDepth + (e.consciousnessDepthDelta || 0))),
        resonancePoints: prev.resonancePoints + (e.resonancePointsDelta || 10),
        echoCount: prev.echoCount + (e.echoCountDelta || 1),
        choiceHistory: { ...prev.choiceHistory, [activeSceneId]: choice.id },
        worldState: mergedWorldState,
        personality: {
          analytical: prev.personality.analytical + (pb.analytical || 0),
          intuitive: prev.personality.intuitive + (pb.intuitive || 0),
          preserver: prev.personality.preserver + (pb.preserver || 0),
          releaser: prev.personality.releaser + (pb.releaser || 0),
          explorer: prev.personality.explorer + (pb.explorer || 0),
          architect: prev.personality.architect + (pb.architect || 0),
        },
      };
    });

    if (choice.effect) {
      const e = choice.effect;
      if (e.unlockMemoryId) unlockMemory(e.unlockMemoryId);
      if (e.unlockRelicId) acquireRelic(e.unlockRelicId);
      if (e.unlockAchievementId) unlockAchievement(e.unlockAchievementId);
      if (e.unlockAbilityId) unlockAbility(e.unlockAbilityId);
      if (e.unlockEvidenceId) unlockEvidence(e.unlockEvidenceId);
      if (e.unlockArtifactId) unlockArtifact(e.unlockArtifactId);
      if (e.unlockSecretId) unlockSecret(e.unlockSecretId);
      if (e.setWorldFlags?.kodvarosRing1Done) completeKodvarosQuest('kq_r1_seal');
      if (e.setWorldFlags?.kodvarosRing2Done) completeKodvarosQuest('kq_r2_viaduct');
      if (e.setWorldFlags?.kodvarosRing3Done) completeKodvarosQuest('kq_r3_symmetry');
      if (e.triggerFracture) triggerRealityFracture();
      if (e.triggerCinematicId) setActiveCinematicId(e.triggerCinematicId);
    }

    setActiveSceneId(choice.nextSceneId);
    setActiveChapter(chapterFromScene(choice.nextSceneId));
  };

  return (
    <GameContext.Provider
      value={{
        spiralState,
        activeChapter,
        activeSceneId,
        memories,
        relics,
        achievements,
        radioChannels,
        storyLog,
        abilities,
        artifacts,
        evidence,
        deductions,
        personnel,
        expeditions,
        secrets,
        guardianProgress,
        echoes,
        activeCinematicId,
        activeMiniGameId,
        activeArtifactId,
        isFractured,
        reducedMotion,
        startNewGame,
        continueGame,
        jumpToChapter,
        makeChoice,
        unlockMemory,
        acquireRelic,
        unlockAchievement,
        discoverRadioChannel,
        triggerRealityFracture,
        setReducedMotion,
        clearStoryLog,
        setActiveCinematicId,
        setActiveMiniGameId,
        setActiveArtifactId,
        unlockAbility,
        upgradeAbility,
        triggerSynergy,
        unlockArtifact,
        inspectArtifactPart,
        disassembleArtifact,
        uvScanArtifact,
        combineArtifacts,
        unlockEvidence,
        analyzeEvidence,
        solveDeduction,
        unlockSecret,
        unlockPersonnel,
        completeGuardianQuest,
        completeGuardianMiniGame,
        makeGuardianPhilosophyChoice,
        unlockGuardianSecret,
        discoverRadarTarget,
        completeMiniGame,
        completeCinematic,
        inspectHotspot,
        updateRealityWarp,
        triggerNgPlusLoop,
        addResonance,
        talkToKodvarosTopic,
        completeKodvarosQuest,
        markKodvarosRingExplored,
        exploreKodvarosLandmark,
        claimKodvarosSideQuest,
        syncEchoTip,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
