import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GameProvider, useGame } from './game/GameContext';
import { CanvasAtmosphere } from './effects/CanvasAtmosphere';
import { RealityFractureOverlay } from './effects/RealityFractureOverlay';
import { TopBarNav } from './components/TopBarNav';
import { MainMenuScene } from './scenes/MainMenuScene';
import { InteractiveStoryScene } from './scenes/InteractiveStoryScene';
import { Archive82Modal } from './components/Archive82Modal';
import { RadioScannerModal } from './components/RadioScannerModal';
import { SpiralProfileModal } from './components/SpiralProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { StoryLog } from './components/StoryLog';
import { ArtifactInspectorModal } from './components/ArtifactInspectorModal';
import { AbilityMatrixModal } from './components/AbilityMatrixModal';
import { GuardiansHubModal } from './components/GuardiansHubModal';
import { RealityEditorModal } from './components/RealityEditorModal';
import { KodvarosExplorerModal } from './components/KodvarosExplorerModal';
import { CinematicEventOverlay } from './components/CinematicEventOverlay';
import { MINI_GAME_CATALOG, MiniGameRouter } from './components/MiniGameSuite';
import { GUARDIANS_LIST } from './data/storyData';
import { MiniGameId } from './types/game';
import { CheckCircle2, X } from 'lucide-react';
import { soundEngine } from './audio/SoundEngine';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import { aiVoiceService, SubtitleState } from './audio/aiVoiceService';
import { getAudioPreferences } from './audio/audioPreferences';

const Phase1PrototypeLabModal = lazy(() =>
  import('./prototypes/Phase1PrototypeLabModal').then((m) => ({
    default: m.Phase1PrototypeLabModal,
  }))
);

const GameContainer: React.FC = () => {
  const {
    activeChapter,
    memories,
    relics,
    achievements,
    radioChannels,
    spiralState,
    storyLog,
    isFractured,
    reducedMotion,
    activeMiniGameId,
    activeArtifactId,
    setActiveMiniGameId,
    setActiveArtifactId,
    setReducedMotion,
    discoverRadioChannel,
    resetAllProgress,
  } = useGame();

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStoryLogOpen, setIsStoryLogOpen] = useState(false);
  const [storyLogMode, setStoryLogMode] = useState<'log' | 'tree'>('log');
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);
  const [isGuardiansOpen, setIsGuardiansOpen] = useState(false);
  const [isRealityEditorOpen, setIsRealityEditorOpen] = useState(false);
  const [isKodvarosOpen, setIsKodvarosOpen] = useState(false);
  const [isMiniGamesHubOpen, setIsMiniGamesHubOpen] = useState(false);
  const [hubSelectedMiniGame, setHubSelectedMiniGame] = useState<MiniGameId>('georadar');
  const [isPrototypeLabOpen, setIsPrototypeLabOpen] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleState | null>(null);

  useEffect(() => {
    return aiVoiceService.subscribe((sub) => {
      setActiveSubtitle(sub);
    });
  }, []);

  // Auto-open Artifact Inspector when inspecting an artifact hotspot in a scene
  useEffect(() => {
    if (activeArtifactId) {
      setIsArtifactsOpen(true);
    }
  }, [activeArtifactId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsArchiveOpen(false);
        setIsRadioOpen(false);
        setIsProfileOpen(false);
        setIsSettingsOpen(false);
        setIsStoryLogOpen(false);
        setIsArtifactsOpen(false);
        setIsAbilitiesOpen(false);
        setIsGuardiansOpen(false);
        setIsRealityEditorOpen(false);
        setIsKodvarosOpen(false);
        setIsMiniGamesHubOpen(false);
        setIsPrototypeLabOpen(false);
        setActiveMiniGameId(null);
      } else if (
        (e.key === 'l' || e.key === 'L') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setIsStoryLogOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveMiniGameId]);

  const unlockedMemories = memories.filter((m) => m.isUnlocked).length;
  const isNgPlus = spiralState.loopState > 1;
  const showRadioNav =
    isNgPlus ||
    activeChapter !== 'chapter1_viktor' ||
    spiralState.worldState.radioFrequencyUnlocked ||
    radioChannels.some((c) => c.frequency === 82.0 && c.discovered);
  const showProfileNav =
    isNgPlus ||
    activeChapter !== 'chapter1_viktor' ||
    unlockedMemories >= 2 ||
    spiralState.spiralAwareness >= 25;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <CanvasAtmosphere
        intensity={activeChapter === 'menu' ? 'calm' : activeChapter.includes('kodvaros') ? 'cosmic' : 'storm'}
        reducedMotion={reducedMotion}
      />

      <RealityFractureOverlay isTriggered={isFractured} reducedMotion={reducedMotion} />

      <TopBarNav
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenRadio={() => setIsRadioOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStoryLog={() => {
          setStoryLogMode('log');
          setIsStoryLogOpen(true);
        }}
        unlockedMemoriesCount={unlockedMemories}
        totalMemoriesCount={memories.length}
        storyLogCount={storyLog.length}
        showRadioNav={showRadioNav}
        showProfileNav={showProfileNav}
      />

      <main className="flex-1 relative z-10">
        {activeChapter === 'menu' ? (
          <MainMenuScene
            onOpenArchive={() => setIsArchiveOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPrototypeLab={() => setIsPrototypeLabOpen(true)}
          />
        ) : (
          <InteractiveStoryScene
            onOpenRadio={() => setIsRadioOpen(true)}
            onOpenArchive={() => setIsArchiveOpen(true)}
            onOpenStoryLog={(mode = 'log') => {
              setStoryLogMode(mode);
              setIsStoryLogOpen(true);
            }}
            onOpenArtifacts={() => setIsArtifactsOpen(true)}
            onOpenAbilities={() => setIsAbilitiesOpen(true)}
            onOpenGuardians={() => setIsGuardiansOpen(true)}
            onOpenRealityEditor={() => setIsRealityEditorOpen(true)}
            onOpenKodvaros={() => setIsKodvarosOpen(true)}
            onOpenMiniGamesHub={() => setIsMiniGamesHubOpen(true)}
            onSubtitleChange={setActiveSubtitle}
          />
        )}
      </main>

      {!isPrototypeLabOpen && (
        <SubtitleOverlay
          subtitle={activeSubtitle}
          enabled={getAudioPreferences().subtitlesEnabled}
          onStop={() => {
            aiVoiceService.stop();
            setActiveSubtitle(null);
          }}
        />
      )}

      {/* Modals & Overlays */}
      <CinematicEventOverlay />

      <StoryLog
        isOpen={isStoryLogOpen}
        onClose={() => setIsStoryLogOpen(false)}
        initialViewMode={storyLogMode}
      />

      <Archive82Modal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        memories={memories}
      />

      <RadioScannerModal
        isOpen={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
        channels={radioChannels}
        onChannelDiscovered={(freq) => discoverRadioChannel(freq)}
      />

      <SpiralProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        spiralState={spiralState}
        relics={relics}
        achievements={achievements}
        guardians={GUARDIANS_LIST}
      />

      <ArtifactInspectorModal
        isOpen={isArtifactsOpen}
        onClose={() => {
          setIsArtifactsOpen(false);
          setActiveArtifactId(null);
        }}
      />

      <AbilityMatrixModal
        isOpen={isAbilitiesOpen}
        onClose={() => setIsAbilitiesOpen(false)}
      />

      <GuardiansHubModal
        isOpen={isGuardiansOpen}
        onClose={() => setIsGuardiansOpen(false)}
      />

      <RealityEditorModal
        isOpen={isRealityEditorOpen}
        onClose={() => setIsRealityEditorOpen(false)}
      />

      <KodvarosExplorerModal
        isOpen={isKodvarosOpen}
        onClose={() => setIsKodvarosOpen(false)}
      />

      {/* Hotspot-Launched Standalone Mini-Game Modal */}
      {activeMiniGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <MiniGameRouter
              miniGameId={activeMiniGameId}
              onClose={() => setActiveMiniGameId(null)}
            />
          </div>
        </div>
      )}

      {/* Playable MiniGames Hub Modal */}
      {isMiniGamesHubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-5">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 bg-slate-950/70">
              <div>
                <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
                  INTERAKTÍV PRÓBÁK & MINIJÁTÉKOK ({MINI_GAME_CATALOG.length} MODUL)
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Teljesítve: {spiralState.worldState.completedMiniGames.length}/{MINI_GAME_CATALOG.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMiniGamesHubOpen(false)}
                className="px-3 py-2 min-h-[40px] text-xs font-mono text-slate-300 hover:text-white border border-slate-700 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Bezárás</span>
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-3.5 space-y-2">
                {MINI_GAME_CATALOG.map((mg) => {
                  const done = spiralState.worldState.completedMiniGames.includes(mg.id);
                  const active = hubSelectedMiniGame === mg.id;
                  return (
                    <button
                      key={mg.id}
                      type="button"
                      onClick={() => {
                        setHubSelectedMiniGame(mg.id);
                        soundEngine.playUiClick();
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'border-cyan-400 bg-cyan-950/35'
                          : 'border-slate-800 bg-slate-950/70 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-400">{mg.chapterTag}</span>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-xs font-semibold text-slate-100 mt-0.5">{mg.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{mg.subtitle}</div>
                    </button>
                  );
                })}
              </div>
              <div className="lg:col-span-8 overflow-y-auto p-4 md:p-5 bg-slate-950/40">
                <MiniGameRouter miniGameId={hubSelectedMiniGame} />
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={setReducedMotion}
        onResetGame={resetAllProgress}
        onOpenPrototypeLab={() => {
          setIsSettingsOpen(false);
          setIsPrototypeLabOpen(true);
        }}
      />

      {isPrototypeLabOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040710] text-xs font-mono text-cyan-300">
              3D és AI Hang Labor betöltése...
            </div>
          }
        >
          <Phase1PrototypeLabModal
            isOpen={isPrototypeLabOpen}
            onClose={() => setIsPrototypeLabOpen(false)}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
