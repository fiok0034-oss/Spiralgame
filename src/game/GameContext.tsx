import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SpiralState,
  GameChapterId,
  MemoryFragment,
  Relic,
  Achievement,
  RadioChannel,
  ChoiceOption,
} from '../types/game';
import {
  INITIAL_MEMORIES,
  INITIAL_RELICS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_RADIO_CHANNELS,
  GUARDIANS_LIST,
  STORY_NODES,
} from '../data/storyData';
import { soundEngine } from '../audio/SoundEngine';

interface GameContextType {
  spiralState: SpiralState;
  activeChapter: GameChapterId;
  activeSceneId: string;
  memories: MemoryFragment[];
  relics: Relic[];
  achievements: Achievement[];
  radioChannels: RadioChannel[];
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
}

const DEFAULT_SPIRAL_STATE: SpiralState = {
  spiralAwareness: 12,
  memoryIntegrity: 78,
  timeStability: 85,
  realityIntegrity: 92,
  guardianAwareness: 0,
  consciousnessDepth: 1,
  choiceHistory: {},
  worldState: {
    radarAnomalyFound: false,
    obeliskTouched: false,
    radioFrequencyUnlocked: false,
    subglacialDescentComplete: false,
    lenaConsciousnessLinked: false,
    miraSecondGateOpened: false,
    leventeDreamAttuned: false,
    kodvarosRingsCompleted: 0,
    kassarahMemoryHarmonized: false,
    irHayaOblivionAccepted: false,
    infiniteAcknowledged: false,
    chosenPath: null,
  },
  echoCount: 0,
  loopState: 1,
};

const STORAGE_KEY = 'spiral_breath_save_v1';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spiralState, setSpiralState] = useState<SpiralState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.spiralState) return parsed.spiralState;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SPIRAL_STATE;
  });

  const [activeChapter, setActiveChapter] = useState<GameChapterId>('menu');
  const [activeSceneId, setActiveSceneId] = useState<string>('v1_intro');

  const [memories, setMemories] = useState<MemoryFragment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.memories) return parsed.memories;
      }
    } catch {
      // fallback
    }
    return INITIAL_MEMORIES;
  });

  const [relics, setRelics] = useState<Relic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.relics) return parsed.relics;
      }
    } catch {
      // fallback
    }
    return INITIAL_RELICS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.achievements) return parsed.achievements;
      }
    } catch {
      // fallback
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [radioChannels, setRadioChannels] = useState<RadioChannel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.radioChannels) return parsed.radioChannels;
      }
    } catch {
      // fallback
    }
    return INITIAL_RADIO_CHANNELS;
  });

  const [isFractured, setIsFractured] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Autosave
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          spiralState,
          memories,
          relics,
          achievements,
          radioChannels,
        })
      );
    } catch {
      // Safe storage
    }
  }, [spiralState, memories, relics, achievements, radioChannels]);

  const unlockMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isUnlocked: true } : m))
    );
    soundEngine.playDiscovery();
  };

  const acquireRelic = (id: string) => {
    setRelics((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAcquired: true } : r))
    );
    soundEngine.playDiscovery();
  };

  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isUnlocked: true } : a))
    );
    soundEngine.playDiscovery();
  };

  const discoverRadioChannel = (frequency: number) => {
    setRadioChannels((prev) =>
      prev.map((c) => (c.frequency === frequency ? { ...c, discovered: true } : c))
    );
  };

  const triggerRealityFracture = () => {
    setIsFractured(true);
    soundEngine.playRealityFracture();
    setTimeout(() => {
      setIsFractured(false);
    }, 700);
  };

  const startNewGame = () => {
    soundEngine.startAmbientDrone();
    soundEngine.startIceBreathing();
    setSpiralState({ ...DEFAULT_SPIRAL_STATE, loopState: spiralState.loopState + 1 });
    setActiveChapter('chapter1_viktor');
    setActiveSceneId('v1_intro');
  };

  const continueGame = () => {
    soundEngine.startAmbientDrone();
    soundEngine.startIceBreathing();
    // determine chapter from scene
    setActiveChapter('chapter1_viktor');
  };

  const jumpToChapter = (chapter: GameChapterId, sceneId?: string) => {
    soundEngine.playUiClick();
    setActiveChapter(chapter);
    if (sceneId) {
      setActiveSceneId(sceneId);
    }
  };

  const makeChoice = (choice: ChoiceOption) => {
    soundEngine.playUiClick();

    // Apply effects
    if (choice.effect) {
      const e = choice.effect;
      setSpiralState((prev) => ({
        ...prev,
        spiralAwareness: Math.min(
          100,
          Math.max(0, prev.spiralAwareness + (e.spiralAwarenessDelta || 0))
        ),
        memoryIntegrity: Math.min(
          100,
          Math.max(0, prev.memoryIntegrity + (e.memoryIntegrityDelta || 0))
        ),
        timeStability: Math.min(
          100,
          Math.max(0, prev.timeStability + (e.timeStabilityDelta || 0))
        ),
        realityIntegrity: Math.min(
          100,
          Math.max(0, prev.realityIntegrity + (e.realityIntegrityDelta || 0))
        ),
        guardianAwareness: Math.min(
          9,
          Math.max(0, prev.guardianAwareness + (e.guardianAwarenessDelta || 0))
        ),
        consciousnessDepth: Math.min(
          7,
          Math.max(1, prev.consciousnessDepth + (e.consciousnessDepthDelta || 0))
        ),
        echoCount: prev.echoCount + (e.echoCountDelta || 1),
        choiceHistory: {
          ...prev.choiceHistory,
          [activeSceneId]: choice.id,
        },
      }));

      if (e.unlockMemoryId) unlockMemory(e.unlockMemoryId);
      if (e.unlockRelicId) acquireRelic(e.unlockRelicId);
      if (e.unlockAchievementId) unlockAchievement(e.unlockAchievementId);
      if (e.triggerFracture) triggerRealityFracture();
    }

    // Switch scene
    setActiveSceneId(choice.nextSceneId);

    // Dynamic chapter mapping based on scene ID
    if (choice.nextSceneId.startsWith('v1_')) {
      setActiveChapter('chapter1_viktor');
    } else if (choice.nextSceneId.startsWith('l1_') || choice.nextSceneId === 'transition_to_lena') {
      setActiveChapter('chapter2_lena');
    } else if (choice.nextSceneId.startsWith('m1_')) {
      setActiveChapter('chapter3_mira');
    } else if (choice.nextSceneId.startsWith('lev1_')) {
      setActiveChapter('chapter4_levente');
    } else if (choice.nextSceneId.startsWith('k1_')) {
      setActiveChapter('chapter5_kodvaros');
    } else if (choice.nextSceneId.startsWith('g1_')) {
      setActiveChapter('chapter6_guardians');
    } else if (choice.nextSceneId.startsWith('inf_') || choice.nextSceneId.startsWith('ending_')) {
      setActiveChapter('chapter_final');
    }
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
