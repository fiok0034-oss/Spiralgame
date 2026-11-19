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

export type MiniGameId =
  | 'georadar'
  | 'radio'
  | 'symbol_puzzle'
  | 'rings_puzzle'
  | 'guardian_test'
  | 'infinite_mirror'
  | 'sound_resonance'
  | 'spiral_mechanism'
  | 'timeline_reconstruction'
  | 'memory_reconstruction'
  | 'gravity_puzzle'
  | 'spatial_maze'
  | 'symbol_translation'
  | 'light_shadow'
  | 'consciousness_trial'
  | 'coordinate_triangulation'
  | 'crystal_resonance'
  | 'reality_splice'
  | 'nine_layer_final'
  | 'acoustic_phase_lock'
  | 'mirror_paradox'
  | 'neural_key_sync'
  | 'echo_viaduct_tuning'
  | 'mirror_city_symmetry'
  | 'ocean_memory_dive'
  | 'desert_trace_reconstruction'
  | 'time_fracture_paradox'
  | 'mirror_reflection_labyrinth'
  | 'cathedral_silence_tuning'
  | 'soul_machine_circuit'
  | 'inverted_sky_navigation'
  | 'silent_garden_symbiosis'
  | 'infinite_threshold_recognition';

export interface PersonalityProfile {
  analytical: number; // Tudományos, elemző, bizonyíték-alapú
  intuitive: number;  // Álmodó, rezonáns, belső hangra hallgató
  preserver: number;  // Kassarah felé hajló (emlékezet megőrzése)
  releaser: number;   // Ir-Haya felé hajló (elengedés, tisztulás)
  explorer: number;   // Kíváncsi, mélyre ásó felfedező
  architect: number;  // Mira / Kódváros építő, valóságformáló
}

export interface RealityWarpState {
  timelineLayer: '1982' | '1983' | 'timeless';
  gravityInverted: boolean;
  hiddenDoorsBridged: boolean;
  echoPermeability: number; // 1 to 3
  kodvarosSymmetry: 'order' | 'paradox' | 'mirror';
}

export interface EchoRecord {
  id: string;
  originSceneId: string;
  title: string;
  description: string;
  manifestationText: string;
  targetScenes: string[];
  createdAt: number;
  category: 'choice' | 'discovery' | 'guardian' | 'reality';
}

export interface SpiralAbility {
  id: string;
  name: string;
  symbol: string;
  domain: 'antarktisz' | 'tudat' | 'ido' | 'kodvaros' | 'vegtelen';
  description: string;
  usageEffect: string;
  level: number; // 0 = locked, 1..3 = unlocked & upgradable
  maxLevel: number;
  unlockHint: string;
  combinableWith: string[];
}

export interface AbilitySynergy {
  id: string;
  abilityA: string;
  abilityB: string;
  title: string;
  description: string;
  secretRevealed: string;
  unlockMemoryId?: string;
  unlockSecretId?: string;
}

export interface ArtifactPart {
  id: string;
  name: string;
  layer: number; // 1 = outer, 2 = inner, 3 = core
  description: string;
  clueText: string;
  isInspected: boolean;
}

export interface InspectableArtifact {
  id: string;
  name: string;
  subtitle: string;
  origin: string;
  symbol: string;
  description: string;
  uvHiddenText: string;
  spiralGlyph: string;
  parts: ArtifactPart[];
  combinableWithId?: string;
  combinationResultId?: string;
  isUnlocked: boolean;
  isDisassembled: boolean;
  isUvScanned: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'document' | 'photo' | 'audio' | 'artifact' | 'coordinate';
  date: string;
  source: string;
  summary: string;
  fullContent: string;
  hiddenAnnotation: string;
  coordinates?: string;
  audioFreq?: number;
  isUnlocked: boolean;
  isAnalyzed: boolean;
}

export interface EvidenceDeduction {
  id: string;
  evidenceA: string;
  evidenceB: string;
  title: string;
  conclusion: string;
  rewardResonance: number;
  unlockSecretId?: string;
  unlockMemoryId?: string;
  isSolved: boolean;
}

export interface PersonnelFile {
  id: string;
  name: string;
  role: string;
  expedition: string;
  status: string;
  clearance: string;
  bio: string;
  secretNote: string;
  isUnlocked: boolean;
}

export interface ExpeditionLog {
  id: string;
  code: string;
  year: string;
  leader: string;
  objective: string;
  outcome: string;
  anomalyReading: string;
  isUnlocked: boolean;
}

export interface GuardianQuest {
  id: string;
  title: string;
  description: string;
  objectiveType: 'interact' | 'minigame' | 'philosophy';
  isCompleted: boolean;
}

export interface GuardianDimension {
  guardianId: number;
  dimensionName: string;
  atmosphereTag: string;
  storyArc: string;
  philosophicalQuestion: string;
  philosophicalChoices: {
    id: string;
    label: string;
    consequenceText: string;
    alignment: 'preserver' | 'releaser' | 'architect';
  }[];
  quests: GuardianQuest[];
  miniGameId: MiniGameId;
  secretLocationTitle: string;
  secretLocationText: string;
  requiredAbilityId: string;
  cinematicEventId: string;
  rewardTitle: string;
  consequenceTag: string;
}

export interface GuardianProgress {
  encountered: boolean;
  completedQuestIds: string[];
  miniGameCleared: boolean;
  philosophyChoiceId: string | null;
  secretUnlocked: boolean;
  realmCompleted: boolean;
  // Story Expansion 03 fields (safely defaulted in migration)
  visitedZones?: string[];
  currentZoneId?: string;
  inspectedRealmObjects?: string[];
  decisions?: Record<string, string>;
  trustLevel?: number;
  echoCoreCollected?: boolean;
  observerClueFound?: boolean;
  unlockedSecrets?: string[];
  trialOutcomeId?: string | null;
  rewardClaimed?: boolean;
}

export interface RealmZoneNode {
  id: string;
  guardianId: number;
  code: string;
  name: string;
  subtitle: string;
  zoneType: 'entry' | 'exploration' | 'mechanism' | 'sanctum' | 'secret';
  x: number; // SVG topology map 0..340
  y: number; // SVG topology map 0..200
  description: string;
  ambientHint: string;
  connectedZoneIds: string[];
  requiresZoneId?: string;
  requiresAbilityId?: string;
  requiresCrossEffectId?: string;
  requiresDeductionId?: string;
  requiresGravityInverted?: boolean;
  requiresAllEchoes?: boolean;
  unlockHint?: string;
  secretId?: string;
  hotspots: SceneHotspot[];
  hasMiniGame?: boolean;
  hasEchoCore?: boolean;
  hasObserverClue?: boolean;
  isTrialZone?: boolean;
  guardianDialogue?: {
    prompt: string;
    response: string;
  };
}

export interface RealmCrossEffect {
  id: string;
  sourceGuardianId: number;
  targetGuardianId: number;
  requiresChoiceId?: string;
  requiresEchoId?: string;
  title: string;
  description: string;
  visualShiftText: string;
}

export interface RealmTrialOption {
  id: string;
  label: string;
  nuanceNote: string;
  trustDelta: number;
  alignment: keyof PersonalityProfile;
  consequenceText: string;
  unlockMemoryId?: string;
  unlockRelicId?: string;
}

export interface RealmReactionHook {
  id: string;
  title: string;
  text: string;
  requiresChoiceId?: string;
  requiresAnyChoiceIds?: string[];
  requiresEchoId?: string;
  requiresMinTrust?: number;
}

export interface GuardianRealmDefinition {
  guardianId: number;
  realmTitle: string;
  biomeTag: string;
  entrySceneId: string;
  accentColor: string;
  bgToneClass: string;
  soundProfileLabel: string;
  soundChord: number[];
  introNarrative: string;
  pastConnectionText: string;
  echoCoreId: string;
  echoCoreTitle: string;
  echoCoreLore: string;
  echoConnectionHint: string;
  observerClueId: string;
  observerClueTitle: string;
  observerClueSummary: string;
  observerClueDetail: string;
  trialTitle: string;
  trialPrompt: string;
  trialOptions: RealmTrialOption[];
  reactions: RealmReactionHook[];
  rewardAbilityUpgradeId?: string;
  rewardRelicId?: string;
  rewardMemoryId?: string;
  rewardSummary: string;
  zones: RealmZoneNode[];
}

export interface SecretDiscovery {
  id: string;
  title: string;
  layer: 1 | 2 | 3; // 1 = glyph/surface, 2 = synergy/investigation, 3 = meta/ng+
  hint: string;
  loreText: string;
  spiralWord?: string;
  spiralMeaning?: string;
  coordinates?: string;
  isUnlocked: boolean;
}

export interface CinematicEventData {
  id: string;
  title: string;
  chapterLabel: string;
  subtitle: string;
  phases: {
    title: string;
    narrative: string;
    promptLabel: string;
    actionLabel: string;
    frequencyHz: number;
    visualMode: 'wave' | 'portal' | 'fracture' | 'gravity' | 'convergence';
  }[];
  completionText: string;
  rewardResonance: number;
}

export interface SpiralState {
  spiralAwareness: number;      // 0 - 100
  memoryIntegrity: number;      // 0 - 100
  timeStability: number;        // 0 - 100
  realityIntegrity: number;     // 0 - 100
  guardianAwareness: number;    // 0 - 9
  consciousnessDepth: number;   // 1 - 7
  resonancePoints: number;      // Upgrade currency earned from exploration & puzzles
  choiceHistory: Record<string, string>;
  worldState: {
    radarAnomalyFound: boolean;
    obeliskTouched: boolean;
    radioFrequencyUnlocked: boolean;
    subglacialDescentComplete: boolean;
    lenaConsciousnessLinked: boolean;
    miraSecondGateOpened: boolean;
    leventeDreamAttuned: boolean;
    leventeChapterCompleted: boolean;
    kodvarosRingsCompleted: number;
    kodvarosRing1Done: boolean;
    kodvarosRing2Done: boolean;
    kodvarosRing3Done: boolean;
    kodvarosTalkedInhabitants: string[];
    kodvarosCompletedQuests: string[];
    kodvarosExploredRings: number[];
    kodvarosExploredLandmarks: string[];
    kodvarosSolvedSideQuests: string[];
    syncedEchoIds: string[];
    kassarahMemoryHarmonized: boolean;
    irHayaOblivionAccepted: boolean;
    infiniteAcknowledged: boolean;
    chosenPath: 'close' | 'share' | 'new_world' | 'covenant' | 'meta_room' | null;
    discoveredRadarTargets: string[];
    completedMiniGames: MiniGameId[];
    completedCinematics: string[];
    unlockedSynergies: string[];
    discoveredSecrets: string[];
    inspectedHotspots: string[];
    // Story Expansion 03 fields
    collectedNineEchoIds: string[];
    collectedObserverClueIds: string[];
    observerConvergenceTriggered: boolean;
    chamberBeyondNinthUnlocked: boolean;
    chamberBeyondNinthCompleted: boolean;
    chamberBeyondChoiceId: string | null;
    realmCrossEffectsTriggered: string[];
    // Story Expansion 04: The Final Revelation
    chamberStagesCompleted: number[];
    chamberCostChoiceId: string | null;
    finalTrialsSolved: string[];
    guardianCouncilVerdictDone: boolean;
    infiniteEncountersCompleted: number;
    revealedTwists: string[];
    echoAudioListenedIds: string[];
  };
  personality: PersonalityProfile;
  realityWarp: RealityWarpState;
  echoCount: number;
  loopState: number;
  completedEndings: string[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  reflection?: string;
  requiresAbilityId?: string;
  requiresRealityWarp?: Partial<RealityWarpState>;
  requiresNgPlus?: boolean;
  requiresChoiceIds?: string[];
  requiresMinPersonality?: Partial<PersonalityProfile>;
  requiresWorldFlags?: Partial<SpiralState['worldState']>;
  requiresMiniGameId?: MiniGameId;
  personalityBias?: Partial<PersonalityProfile>;
  echoCreated?: {
    title: string;
    description: string;
    manifestationText: string;
    targetScenes: string[];
  };
  effect?: {
    spiralAwarenessDelta?: number;
    memoryIntegrityDelta?: number;
    timeStabilityDelta?: number;
    realityIntegrityDelta?: number;
    guardianAwarenessDelta?: number;
    consciousnessDepthDelta?: number;
    resonancePointsDelta?: number;
    echoCountDelta?: number;
    unlockMemoryId?: string;
    unlockRelicId?: string;
    unlockAchievementId?: string;
    unlockAbilityId?: string;
    unlockEvidenceId?: string;
    unlockArtifactId?: string;
    unlockSecretId?: string;
    setWorldFlags?: Partial<SpiralState['worldState']>;
    triggerFracture?: boolean;
    triggerCinematicId?: string;
  };
  nextSceneId: string;
}

export interface SceneHotspot {
  id: string;
  label: string;
  kind: 'inspect' | 'document' | 'photo' | 'audio' | 'mechanism' | 'secret_door';
  description: string;
  revealText: string;
  requiredAbilityId?: string;
  requiredRealityGravityInverted?: boolean;
  artifactId?: string;
  evidenceId?: string;
  miniGameId?: MiniGameId;
  resonanceReward?: number;
}

export interface SceneDynamicVariant {
  id: string;
  title: string;
  text: string;
  requiresChoiceId?: string;
  requiresAnyChoiceIds?: string[];
  requiresMinPersonality?: Partial<PersonalityProfile>;
  requiresWorldFlag?: keyof SpiralState['worldState'];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole?: string;
  text: string;
  ngPlusText?: string; // New Game+ extra revelation!
  subtext?: string;
  location?: string;
  timestamp?: string;
  atmosphere?: 'calm' | 'tension' | 'discovery' | 'fracture' | 'cosmic' | 'silence' | 'storm';
  illustrationKey?: keyof typeof import('../assets/images').GAME_IMAGES;
  choices: ChoiceOption[];
  interactiveComponent?: MiniGameId;
  cinematicEventId?: string;
  hotspots?: SceneHotspot[];
  dynamicVariants?: SceneDynamicVariant[];
}

export interface StoryLogEntry {
  id: string;
  sceneId: string;
  speaker: string;
  speakerRole?: string;
  location?: string;
  timestamp?: string;
  text: string;
  subtext?: string;
  atmosphere?: string;
  chosenOption?: {
    id: string;
    label: string;
    reflection?: string;
  };
  recordedAt: number;
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
  frequency: number;
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

export interface KodvarosPersonalityBranch {
  id: string;
  trait: keyof PersonalityProfile;
  minValue: number;
  label: string;
  outcomeText: string;
  bonusResonance?: number;
}

export interface KodvarosDecisionReaction {
  requiresChoiceId: string;
  title: string;
  reactionText: string;
}

export interface KodvarosDialogueTopic {
  id: string;
  question: string;
  answer: string;
  resonanceReward?: number;
  unlockSecretId?: string;
  personalityBranches?: KodvarosPersonalityBranch[];
}

export interface KodvarosInhabitant {
  id: string;
  ringId: 1 | 2 | 3;
  name: string;
  role: string;
  origin: string;
  symbol: string;
  greeting: string;
  decisionReactions?: KodvarosDecisionReaction[];
  topics: KodvarosDialogueTopic[];
}

export interface KodvarosQuest {
  id: string;
  ringId: 1 | 2 | 3;
  title: string;
  description: string;
  objectiveType: 'dialogue' | 'minigame' | 'story' | 'inspect';
  requiredTargetId?: string;
  rewardResonance: number;
  unlockMemoryId?: string;
  rewardText: string;
}

export interface KodvarosSideQuest {
  id: string;
  ringId: 1 | 2 | 3;
  code: string;
  title: string;
  giverName: string;
  summary: string;
  steps: string[];
  requiredMiniGameId: MiniGameId;
  miniGameLabel: string;
  requiredNpcId: string;
  requiredTopicId: string;
  rewardResonance: number;
  unlockMemoryId?: string;
  unlockSecretId?: string;
  rewardDescription: string;
}

export interface KodvarosDistrictLandmark {
  id: string;
  label: string;
  tag: string;
  x: number; // SVG 0..320 coordinate
  y: number; // SVG 0..190 coordinate
  sceneId: string;
  description: string;
  miniGameId?: MiniGameId;
  npcId?: string;
}

export interface KodvarosLoreEntry {
  id: string;
  title: string;
  tag: string;
  body: string;
}

export interface KodvarosLinkedStoryEvent {
  id: string;
  label: string;
  characterTag: string;
  chapterId: GameChapterId;
  sceneId: string;
  summary: string;
}

export interface KodvarosRingData {
  ringId: 1 | 2 | 3;
  code: string;
  name: string;
  subtitle: string;
  accentColor: string;
  entrySceneId: string;
  coreSceneId: string;
  lore: string;
  architecturalLaw: string;
  secretId: string;
  landmarks: KodvarosDistrictLandmark[];
  loreEntries: KodvarosLoreEntry[];
  linkedStoryEvents: KodvarosLinkedStoryEvent[];
}

// Story Expansion 04: Final Revelation types
export interface EchoCoreSecretData {
  echoCoreId: string;
  guardianId: number;
  title: string;
  hiddenMemoryTitle: string;
  hiddenMemoryText: string;
  audioMessageTitle: string;
  audioMessageText: string;
  audioFreqHz: number;
  anomalyDescription: string;
  unansweredQuestion: string;
  spiralNatureHint: string;
  worldMutation: {
    artifactId: string;
    artifactAwakenedNote: string;
    radioFreq: number;
    radioWhisper: string;
    mapConnectionLabel: string;
    guardianDialogueShift: string;
  };
}

export interface ChamberStageData {
  stage: number;
  title: string;
  subtitle: string;
  narrative: string;
  atmosphereHint: string;
  interactivePrompt: string;
}

export interface NarrativeTwistData {
  id: string;
  number: number;
  title: string;
  previousAssumption: string;
  revealedTruth: string;
  keyEvidenceLabel: string;
  retroactiveMeaning: string;
}

export interface FinalTrialOption {
  id: string;
  label: string;
  explanation: string;
}

export interface FinalTrialQuestion {
  id: string;
  index: number;
  title: string;
  categoryLabel: string;
  prompt: string;
  clueSummary: string;
  options: FinalTrialOption[];
  correctOptionId: string;
  revelationText: string;
  twistId?: string;
}

export interface GuardianCouncilEvaluation {
  guardianId: number;
  stance: 'ally' | 'challenger' | 'sacrifice' | 'neutral';
  stanceLabel: string;
  reasonText: string;
  secretRevelation?: string;
  trustScore: number;
}


