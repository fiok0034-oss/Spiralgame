export type CharacterId = 'viktor' | 'lena' | 'mira' | 'levente' | 'infinite';

export type GameChapterId = 
  | 'menu'
  | 'chapter1_viktor'
  | 'chapter2_lena'
  | 'chapter3_mira'
  | 'chapter4_levente'
  | 'chapter5_kodvaros'
  | 'chapter6_guardians'
  | 'chapter_final'
  | 'epilogue';

export interface SpiralState {
  spiralAwareness: number;      // 0 - 100
  memoryIntegrity: number;      // 0 - 100
  timeStability: number;        // 0 - 100
  realityIntegrity: number;     // 0 - 100
  guardianAwareness: number;    // 0 - 9
  consciousnessDepth: number;   // 1 - 7
  choiceHistory: Record<string, string>;
  worldState: {
    radarAnomalyFound: boolean;
    obeliskTouched: boolean;
    radioFrequencyUnlocked: boolean;
    subglacialDescentComplete: boolean;
    lenaConsciousnessLinked: boolean;
    miraSecondGateOpened: boolean;
    leventeDreamAttuned: boolean;
    kodvarosRingsCompleted: number;
    kassarahMemoryHarmonized: boolean;
    irHayaOblivionAccepted: boolean;
    infiniteAcknowledged: boolean;
    chosenPath: 'close' | 'share' | 'new_world' | 'meta_room' | null;
  };
  echoCount: number;
  loopState: number;
}

export interface ChoiceOption {
  id: string;
  label: string;
  reflection?: string;
  effect?: {
    spiralAwarenessDelta?: number;
    memoryIntegrityDelta?: number;
    timeStabilityDelta?: number;
    realityIntegrityDelta?: number;
    guardianAwarenessDelta?: number;
    consciousnessDepthDelta?: number;
    echoCountDelta?: number;
    unlockMemoryId?: string;
    unlockRelicId?: string;
    unlockAchievementId?: string;
    triggerFracture?: boolean;
  };
  nextSceneId: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole?: string;
  text: string;
  subtext?: string;
  location?: string;
  timestamp?: string;
  atmosphere?: 'calm' | 'tension' | 'discovery' | 'fracture' | 'cosmic' | 'silence' | 'storm';
  illustrationKey?: keyof typeof import('../assets/images').GAME_IMAGES;
  choices: ChoiceOption[];
  interactiveComponent?: 'georadar' | 'radio' | 'symbol_puzzle' | 'rings_puzzle' | 'guardian_test' | 'infinite_mirror';
}

export interface MemoryFragment {
  id: string;
  title: string;
  date: string;
  category: 'antarktisz' | 'tudat' | 'idotorzulas' | 'orzo' | 'vegtelen';
  preview: string;
  fullText: string;
  coordinates?: string;
  isUnlocked: boolean;
  relatedMemoryIds?: string[];
  resonanceLevel: number;
}

export interface Relic {
  id: string;
  name: string;
  origin: string;
  description: string;
  iconSymbol: string;
  isAcquired: boolean;
  acquiredAtChapter?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface RadioChannel {
  frequency: number; // e.g. 82.0, 104.2, 142.8, 432.0
  label: string;
  type: 'static' | 'morse' | 'voice' | 'echo';
  content: string;
  discovered: boolean;
}

export interface Guardian {
  id: number;
  name: string;
  title: string;
  philosophicalDomain: string;
  symbol: string;
  colorHex: string;
  isEncountered: boolean;
  dialoguePreview: string;
}
