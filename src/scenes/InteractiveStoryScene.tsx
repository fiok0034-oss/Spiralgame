import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Sliders,
  Gamepad2,
  Package,
  Lock,
  CheckCircle2,
  Eye,
  Volume2,
  FileText,
  DoorOpen,
  Globe,
  Box,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import { STORY_NODES } from '../data/storyData';
import { GAME_IMAGES, FALLBACK_IMAGES } from '../assets/images';
import { GeoRadarScanner } from '../components/GeoRadarScanner';
import { MiniGameRouter, MINI_GAME_CATALOG } from '../components/MiniGameSuite';
import { StoryLog } from '../components/StoryLog';
import { QuestBoard } from '../components/QuestBoard';
import { GuardianRealmExplorer } from '../components/GuardianRealmExplorer';
import {
  FinalGuardianCouncilPanel,
  FinalTrialsPanel,
  MetaChecklistPanel,
  ReactiveEpilogueMatrix,
} from '../components/FinalRevelationPanels';
import { evaluateMetaEndingEligibility } from '../data/finalRevelationData';
import { PersonalityProfile, SceneHotspot, SpiralState } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';
import { spatialSoundscapeEngine } from '../audio/SpatialSoundscapeEngine';
import { aiVoiceService, SubtitleState } from '../audio/aiVoiceService';
import { resolveSceneVoiceMapping } from '../audio/voicePersonaMapper';
import { getAudioPreferences } from '../audio/audioPreferences';
import { LivingAnomalyWhisper } from '../components/LivingAnomalyWhisper';
import { TTS_ENABLED } from '../config/featureFlags';

const SceneSpatialViewport = lazy(() =>
  import('../components/SceneSpatialViewport').then((m) => ({
    default: m.SceneSpatialViewport,
  }))
);

const PERSONALITY_LABELS: Record<keyof PersonalityProfile, string> = {
  analytical: 'Elemző',
  intuitive: 'Intuitív',
  preserver: 'Emlékőrző',
  releaser: 'Elengedő',
  explorer: 'Felfedező',
  architect: 'Építész',
};

interface InteractiveStorySceneProps {
  onOpenRadio: () => void;
  onOpenArchive: () => void;
  onOpenStoryLog?: (mode?: 'log' | 'tree') => void;
  onOpenArtifacts?: () => void;
  onOpenAbilities?: () => void;
  onOpenGuardians?: () => void;
  onOpenRealityEditor?: () => void;
  onOpenMiniGamesHub?: () => void;
  onOpenKodvaros?: () => void;
  onSubtitleChange?: (sub: SubtitleState | null) => void;
}

export const InteractiveStoryScene: React.FC<InteractiveStorySceneProps> = ({
  onOpenRadio,
  onOpenArchive,
  onOpenStoryLog,
  onOpenArtifacts,
  onOpenAbilities,
  onOpenGuardians,
  onOpenRealityEditor,
  onOpenMiniGamesHub,
  onOpenKodvaros,
  onSubtitleChange,
}) => {
  const {
    activeChapter,
    activeSceneId,
    makeChoice,
    jumpToChapter,
    spiralState,
    storyLog,
    echoes,
    abilities,
    artifacts,
    inspectHotspot,
    guardianProgress,
    evidence,
    secrets,
    reducedMotion,
  } = useGame();

  const [imgLoadError, setImgLoadError] = useState(false);
  const [isLocalStoryLogOpen, setIsLocalStoryLogOpen] = useState(false);
  const [initialLogView, setInitialLogView] = useState<'log' | 'tree'>('log');
  const [hotspotFeedback, setHotspotFeedback] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [use3DSceneView, setUse3DSceneView] = useState(false);
  const [spatialDeskToast, setSpatialDeskToast] = useState<string | null>(null);
  const [showAllSystems, setShowAllSystems] = useState(false);

  const handleOpenLog = (mode: 'log' | 'tree' = 'log') => {
    soundEngine.playUiClick();
    setInitialLogView(mode);
    if (onOpenStoryLog) {
      onOpenStoryLog(mode);
    } else {
      setIsLocalStoryLogOpen(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'l' || e.key === 'L') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        handleOpenLog('log');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenStoryLog]);

  const currentNode = STORY_NODES[activeSceneId] || STORY_NODES['v1_intro'];
  const illustrationKey = currentNode.illustrationKey;
  const rawIllustrationSrc = illustrationKey ? GAME_IMAGES[illustrationKey] : null;
  const fallbackIllustrationSrc = illustrationKey ? FALLBACK_IMAGES[illustrationKey] : null;
  const currentImgSrc = imgLoadError ? fallbackIllustrationSrc : (rawIllustrationSrc || fallbackIllustrationSrc);

  const triggerSceneVoice = (nodeId: string, speaker: string, text: string) => {
    if (!TTS_ENABLED) return;
    const mapping = resolveSceneVoiceMapping(nodeId, speaker);
    setVoiceLoading(true);
    setVoicePlaying(true);
    void aiVoiceService.playLine({
      lineId: `scene_${nodeId}`,
      speakerLabel: mapping.speakerLabel,
      persona: mapping.persona,
      channel: mapping.channel,
      fxMode: mapping.fxMode,
      text: text.slice(0, 1450),
      onSubtitle: (sub) => {
        setVoiceLoading(false);
        onSubtitleChange?.(sub);
        if (!sub.isActive && !sub.errorNote) {
          setVoicePlaying(false);
        }
      },
      onComplete: () => {
        setVoiceLoading(false);
        setVoicePlaying(false);
      },
    });
  };

  const stopSceneVoice = () => {
    aiVoiceService.stop();
    setVoiceLoading(false);
    setVoicePlaying(false);
    onSubtitleChange?.(null);
  };

  useEffect(() => {
    setImgLoadError(false);
    setHotspotFeedback(null);
    setSpatialDeskToast(null);
    stopSceneVoice();
    soundEngine.setAtmosphereProfile(currentNode.atmosphere);
    if (currentNode.atmosphere === 'silence') {
      soundEngine.playSilenceDrop();
    }
    if (TTS_ENABLED && getAudioPreferences().autoNarrateScenes) {
      triggerSceneVoice(currentNode.id, currentNode.speaker, currentNode.text);
    }
    return () => {
      aiVoiceService.stop();
    };
  }, [activeSceneId]);

  const sceneEchoes = echoes.filter((e) => e.targetScenes.includes(activeSceneId));
  const chosenChoiceSet = new Set(Object.values(spiralState.choiceHistory));
  const activeDynamicVariants = (currentNode.dynamicVariants || []).filter((variant) => {
    if (variant.requiresChoiceId && !chosenChoiceSet.has(variant.requiresChoiceId)) return false;
    if (
      variant.requiresAnyChoiceIds &&
      !variant.requiresAnyChoiceIds.some((cid) => chosenChoiceSet.has(cid))
    ) {
      return false;
    }
    if (variant.requiresWorldFlag && !spiralState.worldState[variant.requiresWorldFlag]) {
      return false;
    }
    if (variant.requiresMinPersonality) {
      const entries = Object.entries(variant.requiresMinPersonality) as [
        keyof PersonalityProfile,
        number
      ][];
      if (!entries.every(([k, minVal]) => (spiralState.personality[k] || 0) >= (minVal || 0))) {
        return false;
      }
    }
    return true;
  });
  const unlockedAbilitiesCount = abilities.filter((a) => a.level > 0).length;
  const unlockedArtifactsCount = artifacts.filter((a) => a.isUnlocked).length;
  const completedGuardiansCount = Object.values(guardianProgress).filter((g) => g.realmCompleted).length;

  const isNgPlus = spiralState.loopState > 1;
  const revealAll = showAllSystems || isNgPlus;
  const showArtifactsBtn =
    revealAll || unlockedArtifactsCount > 0 || activeChapter !== 'chapter1_viktor';
  const showAbilitiesBtn =
    revealAll || unlockedAbilitiesCount > 0 || activeChapter !== 'chapter1_viktor';
  const showGuardiansBtn =
    revealAll ||
    completedGuardiansCount > 0 ||
    spiralState.guardianAwareness > 0 ||
    activeChapter === 'chapter5_kodvaros' ||
    activeChapter === 'chapter6_guardians' ||
    activeChapter === 'chapter_final';
  const showKodvarosBtn =
    revealAll ||
    spiralState.worldState.leventeChapterCompleted ||
    spiralState.worldState.kodvarosRingsCompleted > 0 ||
    activeChapter === 'chapter5_kodvaros' ||
    activeChapter === 'chapter6_guardians' ||
    activeChapter === 'chapter_final';
  const showRealityBtn =
    revealAll ||
    spiralState.realityIntegrity < 90 ||
    activeChapter === 'chapter3_mira' ||
    activeChapter === 'chapter4_levente' ||
    activeChapter === 'chapter5_kodvaros' ||
    activeChapter === 'chapter6_guardians' ||
    activeChapter === 'chapter_final';
  const showMiniGamesBtn =
    revealAll ||
    spiralState.worldState.completedMiniGames.length > 0 ||
    activeSceneId !== 'v1_intro';
  const hasHiddenSystems =
    !showArtifactsBtn ||
    !showAbilitiesBtn ||
    !showGuardiansBtn ||
    !showKodvarosBtn ||
    !showRealityBtn ||
    !showMiniGamesBtn;

  const handleHotspotClick = (hs: SceneHotspot) => {
    if (hs.kind === 'document') {
      spatialSoundscapeEngine.playPaperRustle(0.2);
    } else if (hs.kind === 'mechanism') {
      spatialSoundscapeEngine.playCrtSwitchClick(-0.2);
    } else if (hs.kind === 'secret_door') {
      spatialSoundscapeEngine.playIceFracture(0);
    } else if (hs.kind === 'audio') {
      spatialSoundscapeEngine.playCrystalChime(528, 0.15);
    }
    const res = inspectHotspot(hs);
    setHotspotFeedback({ id: hs.id, text: res.message, ok: res.unlocked });
  };

  const hotspotIcon = (kind: SceneHotspot['kind']) => {
    switch (kind) {
      case 'document':
        return FileText;
      case 'photo':
        return Search;
      case 'audio':
        return Volume2;
      case 'secret_door':
        return DoorOpen;
      case 'mechanism':
        return Sliders;
      default:
        return Eye;
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-6 md:py-8 text-slate-100 transition-transform duration-500 ${
        spiralState.realityWarp.gravityInverted ? 'border-t-2 border-amber-500/30' : ''
      }`}
    >
      {/* Location & Time Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/20 pb-3 mb-4 text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-semibold">{currentNode.location || 'Antarktisz, 82°16’S'}</span>
          {spiralState.loopState > 1 && (
            <span className="text-amber-300 font-semibold">· {spiralState.loopState}. Időhurok</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span>{currentNode.timestamp || 'Δ–82 IDŐVONAL'}</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            type="button"
            onClick={() => handleOpenLog('log')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-colors cursor-pointer text-xs font-mono font-semibold"
          >
            <span>Napló</span>
            <span className="text-[11px] text-cyan-400 tabular-nums">({storyLog.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenLog('tree')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-colors cursor-pointer text-xs font-mono font-semibold"
          >
            <span>Döntési Fa</span>
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            type="button"
            onClick={() => jumpToChapter('menu')}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Főmenü
          </button>
        </div>
      </div>

      {/* Tactical Explorer Strip (Progressively disclosed in early Chapter 1, expandable anytime) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {onOpenArtifacts && showArtifactsBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenArtifacts(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tárgyak ({unlockedArtifactsCount})</span>
            </button>
          )}
          {onOpenAbilities && showAbilitiesBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenAbilities(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Képességek ({unlockedAbilitiesCount}/12)</span>
            </button>
          )}
          {onOpenGuardians && showGuardiansBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenGuardians(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>9 Őrző ({completedGuardiansCount}/9)</span>
            </button>
          )}
          {onOpenKodvaros && showKodvarosBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenKodvaros(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Három Kör ({spiralState.worldState.kodvarosRingsCompleted}/3)</span>
            </button>
          )}
          {onOpenRealityEditor && showRealityBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenRealityEditor(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-purple-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Valóság-szerkesztő</span>
            </button>
          )}
          {onOpenMiniGamesHub && showMiniGamesBtn && (
            <button
              type="button"
              onClick={() => { soundEngine.playUiClick(); onOpenMiniGamesHub(); }}
              className="px-3 py-2 min-h-[38px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Próbák ({spiralState.worldState.completedMiniGames.length}/{MINI_GAME_CATALOG.length})</span>
            </button>
          )}
          {(hasHiddenSystems || showAllSystems) && !isNgPlus && activeChapter === 'chapter1_viktor' && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setShowAllSystems((v) => !v);
              }}
              className="px-2.5 py-2 min-h-[38px] rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer whitespace-nowrap"
              title="Fejezetszintű modulok mutatása vagy elrejtése"
            >
              {showAllSystems ? 'Kezdő nézet' : 'Összes modul (+)'}
            </button>
          )}
        </div>
        <div className="px-2.5 py-1 text-amber-300 font-bold tabular-nums">
          Rezonancia: {spiralState.resonancePoints}
        </div>
      </div>

      {/* Living World Reality Warp Indicator (shown only when modified) */}
      {(spiralState.realityWarp.gravityInverted ||
        spiralState.realityWarp.timelineLayer !== '1982' ||
        spiralState.realityWarp.hiddenDoorsBridged) && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs font-mono text-purple-200 flex flex-wrap items-center gap-3">
          <span>Aktív Valóság-állapot:</span>
          <span>Időréteg: {spiralState.realityWarp.timelineLayer}</span>
          {spiralState.realityWarp.gravityInverted && <span>· Gravitáció megfordítva</span>}
          {spiralState.realityWarp.hiddenDoorsBridged && <span>· Rejtett átjárók áthidalva</span>}
        </div>
      )}

      {/* Scene Visual Stage (2D Illustration + Interactive 3D Spatial Hybrid) */}
      {(currentImgSrc || use3DSceneView) && (
        <div className="relative w-full h-60 md:h-80 rounded-2xl overflow-hidden mb-6 border border-cyan-500/30 bg-[#050914]">
          {use3DSceneView ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-xs font-mono text-cyan-300">
                  3D térbeli környezet betöltése...
                </div>
              }
            >
              <SceneSpatialViewport
                sceneId={currentNode.id}
                atmosphere={currentNode.atmosphere}
                reducedMotion={reducedMotion}
                onDeskInteract={(label) => setSpatialDeskToast(label)}
              />
            </Suspense>
          ) : (
            currentImgSrc && (
              <>
                <img
                  src={currentImgSrc}
                  alt={currentNode.speaker}
                  onError={() => {
                    if (!imgLoadError && fallbackIllustrationSrc) setImgLoadError(true);
                  }}
                  className={`w-full h-full object-cover object-center filter brightness-90 contrast-110 transition-transform duration-700 ${
                    spiralState.realityWarp.gravityInverted ? 'rotate-180' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-black/30 pointer-events-none" />
              </>
            )
          )}

          {/* Top-Right 2D / 3D Spatial Switch */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {spatialDeskToast && use3DSceneView && (
              <span className="hidden sm:inline px-2.5 py-1 rounded-md bg-[#060c19]/90 border border-amber-400/40 text-[11px] font-mono text-amber-200">
                {spatialDeskToast}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setSpatialDeskToast(null);
                setUse3DSceneView((v) => !v);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#050914]/90 hover:bg-slate-800 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{use3DSceneView ? '2D Illusztráció' : '3D Térbeli Nézet'}</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-4 md:left-6 pointer-events-none">
            <div className="bg-[#050811]/90 border border-cyan-500/30 px-4 py-2 rounded-xl inline-block">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                {currentNode.speakerRole || 'NARRÁCIÓ'}
              </div>
              <h2 className="text-lg md:text-xl font-cinzel font-bold text-slate-100">
                {currentNode.speaker}
              </h2>
            </div>
          </div>
        </div>
      )}

      <LivingAnomalyWhisper
        sceneId={currentNode.id}
        atmosphere={currentNode.atmosphere}
        spiralState={spiralState}
        reducedMotion={reducedMotion}
      />

      {/* Main Narrative Box */}
      <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm mb-6 shadow-xl">
        {(!currentImgSrc || TTS_ENABLED) && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
            <div>
              {!currentImgSrc && (
                <>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    {currentNode.speakerRole || 'SZEREP'}
                  </span>
                  <h2 className="text-xl font-cinzel font-bold text-slate-100 mt-0.5">{currentNode.speaker}</h2>
                </>
              )}
              {TTS_ENABLED && currentImgSrc && (
                <span className="text-xs font-mono text-slate-400">
                  Hangmód: {resolveSceneVoiceMapping(currentNode.id, currentNode.speaker).persona.toUpperCase()}
                </span>
              )}
            </div>
            {TTS_ENABLED && (
              <button
                type="button"
                onClick={() => {
                  if (voicePlaying || voiceLoading) {
                    stopSceneVoice();
                  } else {
                    triggerSceneVoice(currentNode.id, currentNode.speaker, currentNode.text);
                  }
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  voicePlaying
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 hover:bg-amber-500/30'
                    : 'bg-slate-950 hover:bg-slate-800 border-cyan-500/35 text-cyan-300'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {voiceLoading
                    ? 'AI hang betöltése...'
                    : voicePlaying
                    ? 'Felolvasás leállítása'
                    : 'Jelenet felolvasása (AI Hang)'}
                </span>
              </button>
            )}
          </div>
        )}

        <div className="text-base md:text-lg leading-relaxed text-slate-200 font-sans whitespace-pre-line">
          {currentNode.text}
        </div>

        {/* New Game+ Extra Revelation */}
        {spiralState.loopState > 1 && currentNode.ngPlusText && (
          <div className="mt-5 p-4 rounded-xl bg-amber-950/25 border border-amber-500/40 text-xs md:text-sm font-sans text-amber-200">
            {currentNode.ngPlusText}
          </div>
        )}

        {currentNode.subtext && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-mono text-cyan-300/80 italic">
            {currentNode.subtext}
          </div>
        )}
      </div>

      {/* Dynamic Narrative Variants (reacting to prior decisions & personality) */}
      {activeDynamicVariants.length > 0 && (
        <div className="mb-6 space-y-2.5">
          {activeDynamicVariants.map((variant) => (
            <div
              key={variant.id}
              className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/35 text-xs md:text-sm"
            >
              <div className="font-mono font-bold text-amber-300 uppercase text-[11px] mb-1">
                Következmény & Személyiség-reakció · {variant.title}
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">{variant.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Echo Manifestations in Current Scene */}
      {sceneEchoes.length > 0 && (
        <div className="mb-6 space-y-2">
          {sceneEchoes.slice(0, 2).map((echo) => (
            <div
              key={echo.id}
              className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/35 text-xs"
            >
              <div className="font-mono font-bold text-cyan-300 uppercase">
                Korábbi Döntés Visszhangja · {echo.title}
              </div>
              <p className="text-slate-200 mt-1">{echo.manifestationText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Hotspots Panel */}
      {currentNode.hotspots && currentNode.hotspots.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-300">
            Helyszíni Interakciók & Vizsgálható Részletek
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentNode.hotspots.map((hs) => {
              const Icon = hotspotIcon(hs.kind);
              const inspected = spiralState.worldState.inspectedHotspots.includes(hs.id);
              const reqAbility = hs.requiredAbilityId
                ? abilities.find((a) => a.id === hs.requiredAbilityId)
                : null;
              const lockedByAbility = Boolean(reqAbility && reqAbility.level === 0);
              const lockedByGravity = Boolean(
                hs.requiredRealityGravityInverted && !spiralState.realityWarp.gravityInverted
              );

              return (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => handleHotspotClick(hs)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    inspected
                      ? 'border-emerald-500/40 bg-emerald-950/15 hover:border-emerald-400/70'
                      : lockedByAbility || lockedByGravity
                      ? 'border-slate-800 bg-slate-950/60 hover:border-amber-500/40'
                      : 'border-cyan-500/30 bg-slate-950/80 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{hs.label}</span>
                    </span>
                    {inspected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : lockedByAbility || lockedByGravity ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{hs.description}</p>
                </button>
              );
            })}
          </div>
          {hotspotFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono ${
                hotspotFeedback.ok
                  ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/25 border-amber-500/40 text-amber-200'
              }`}
            >
              {hotspotFeedback.text}
            </div>
          )}
        </div>
      )}

      {/* Scene Interactive Mini-Game Insert */}
      {currentNode.interactiveComponent && (
        <div className="mb-8">
          {currentNode.interactiveComponent === 'georadar' ? (
            <GeoRadarScanner isCompleted={spiralState.worldState.radarAnomalyFound} />
          ) : currentNode.interactiveComponent === 'radio' ? (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 text-center">
              <div className="text-xs font-mono text-slate-400 mb-3">
                A tábori rádió panelje folyamatosan sistereg. Hangold be a 82.0 és 142.8 MHz-es csatornákat!
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  onOpenRadio();
                }}
                className="px-6 py-3 min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase rounded-lg cursor-pointer"
              >
                Rádióhangoló Megnyitása
              </button>
            </div>
          ) : (
            <MiniGameRouter miniGameId={currentNode.interactiveComponent} embedded />
          )}
        </div>
      )}

      {/* Kódváros Főtere QuestBoard */}
      {activeSceneId === 'k1_three_rings' && (
        <QuestBoard onOpenKodvaros={onOpenKodvaros} />
      )}

      {/* A Kilenc Őrző Bejárható Birodalmai & A Kamra */}
      {(activeSceneId === 'g1_guardians_nexus' ||
        activeSceneId.startsWith('g1_realm_') ||
        activeSceneId === 'g1_chamber_beyond_ninth') && (
        <GuardianRealmExplorer />
      )}

      {/* VII. Fejezet: Tanács, Végső Próbák, Meta-ellenőrző & Epilógus Mátrix */}
      {activeSceneId === 'inf_guardian_council' && <FinalGuardianCouncilPanel />}
      {activeSceneId === 'inf_final_trials' && <FinalTrialsPanel />}
      {activeSceneId === 'inf_final_encounter' && <MetaChecklistPanel />}
      {activeSceneId.startsWith('ending_') && <ReactiveEpilogueMatrix />}

      {/* Choice Decision Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
            DÖNTÉSI LEHETŐSÉGEK · A VILÁG EMLÉKSZIK
          </div>
        </div>

        {currentNode.choices.map((choice) => {
          const reqAb = choice.requiresAbilityId
            ? abilities.find((a) => a.id === choice.requiresAbilityId)
            : null;
          const lockedAb = Boolean(reqAb && reqAb.level === 0);
          const lockedNg = Boolean(choice.requiresNgPlus && spiralState.loopState <= 1);
          const lockedChoice = Boolean(
            choice.requiresChoiceIds && !choice.requiresChoiceIds.every((cid) => chosenChoiceSet.has(cid))
          );

          let missingPersonalityText: string | null = null;
          if (choice.requiresMinPersonality) {
            const entries = Object.entries(choice.requiresMinPersonality) as [
              keyof PersonalityProfile,
              number
            ][];
            const missing = entries.find(([k, minVal]) => (spiralState.personality[k] || 0) < (minVal || 0));
            if (missing) {
              missingPersonalityText = `${PERSONALITY_LABELS[missing[0]]} ≥ ${missing[1]} szükséges (${spiralState.personality[missing[0]] || 0})`;
            }
          }

          let lockedFlagText: string | null = null;
          if (choice.requiresWorldFlags) {
            const flagEntries = Object.entries(choice.requiresWorldFlags) as [
              keyof SpiralState['worldState'],
              unknown
            ][];
            const unmet = flagEntries.find(([k, expected]) => spiralState.worldState[k] !== expected);
            if (unmet) {
              lockedFlagText =
                unmet[0] === 'leventeChapterCompleted'
                  ? 'Levente kulcsaktiválása szükséges'
                  : unmet[0] === 'chamberBeyondNinthUnlocked'
                  ? 'Mind a 9 Visszhang-mag szükséges'
                  : unmet[0] === 'chamberBeyondNinthCompleted'
                  ? 'Teljesítsd a Kamra 7 szakaszát'
                  : unmet[0] === 'guardianCouncilVerdictDone'
                  ? 'Rögzítsd A Tanács Ítéletét feljebb'
                  : unmet[0] === 'kodvarosRing1Done' ||
                    unmet[0] === 'kodvarosRing2Done' ||
                    unmet[0] === 'kodvarosRing3Done'
                  ? 'Mindhárom Kör (1–3) teljesítése szükséges'
                  : 'Előzetes feltétel szükséges';
            }
          }

          const lockedMiniGame = Boolean(
            choice.requiresMiniGameId &&
              !spiralState.worldState.completedMiniGames.includes(choice.requiresMiniGameId)
          );
          const miniGameTitle = lockedMiniGame
            ? MINI_GAME_CATALOG.find((m) => m.id === choice.requiresMiniGameId)?.title || 'Minijáték'
            : null;

          const gateLeventeBypass = Boolean(
            choice.nextSceneId === 'k1_three_rings' &&
              !spiralState.worldState.leventeChapterCompleted &&
              !choice.effect?.setWorldFlags?.leventeChapterCompleted
          );

          const lockedFinalTrials =
            choice.id === 'c_inf_trials_to_eye' &&
            spiralState.worldState.finalTrialsSolved.length < 3;

          const lockedMetaEnding =
            choice.id === 'c_end_meta' &&
            !evaluateMetaEndingEligibility(spiralState, evidence, secrets).eligible;

          const disabled =
            lockedAb ||
            lockedNg ||
            lockedChoice ||
            Boolean(missingPersonalityText) ||
            Boolean(lockedFlagText) ||
            lockedMiniGame ||
            gateLeventeBypass ||
            lockedFinalTrials ||
            lockedMetaEnding;

          const ringDoneForEntry =
            (choice.id === 'c_k1_enter_ring1' && spiralState.worldState.kodvarosRing1Done) ||
            (choice.id === 'c_k1_enter_ring2' && spiralState.worldState.kodvarosRing2Done) ||
            (choice.id === 'c_k1_enter_ring3' && spiralState.worldState.kodvarosRing3Done);

          const statusLabel = lockedNg
            ? '2. Időhurok szükséges'
            : lockedAb
            ? `${reqAb?.name} szükséges`
            : lockedMiniGame
            ? `Teljesítsd: ${miniGameTitle}`
            : missingPersonalityText
            ? missingPersonalityText
            : lockedFlagText
            ? lockedFlagText
            : lockedFinalTrials
            ? 'Oldj meg legalább 3/4 Próbát feljebb'
            : lockedMetaEnding
            ? 'Meta-feltételek (4/4) szükségesek'
            : gateLeventeBypass
            ? 'Levente fejezete szükséges'
            : lockedChoice
            ? 'Korábbi döntés szükséges'
            : ringDoneForEntry
            ? '✓ Teljesítve · Újrajátszás →'
            : 'Kiválasztás →';

          return (
            <button
              key={choice.id}
              type="button"
              disabled={disabled}
              onClick={() => makeChoice(choice)}
              className={`w-full text-left p-4 rounded-xl border transition-all group ${
                disabled
                  ? 'bg-slate-950/50 border-slate-800 opacity-55 cursor-not-allowed'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-cyan-400/80 cursor-pointer shadow-md hover:translate-x-1'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm md:text-base font-cinzel font-semibold text-slate-100 group-hover:text-cyan-200">
                  {choice.label}
                </span>
                <span className="text-xs font-mono text-cyan-400 whitespace-nowrap">
                  {statusLabel}
                </span>
              </div>
              {choice.reflection && (
                <p className="text-xs text-slate-400 mt-1 italic font-sans">{choice.reflection}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Dossier Prompt */}
      <div className="mt-10 text-center text-xs font-mono text-slate-500">
        Az eddigi felfedezések az{' '}
        <button
          type="button"
          onClick={onOpenArchive}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
        >
          ARCHÍV-82
        </button>{' '}
        rendszerben és a{' '}
        <button
          type="button"
          onClick={() => handleOpenLog('log')}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
        >
          Történeti Naplóban
        </button>{' '}
        bármikor áttekinthetők.
      </div>

      <StoryLog
        isOpen={isLocalStoryLogOpen}
        onClose={() => setIsLocalStoryLogOpen(false)}
        initialViewMode={initialLogView}
      />
    </div>
  );
};
