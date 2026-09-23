import React, { useState, useEffect } from 'react';
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
import { GUARDIANS_LIST } from './data/storyData';

const GameContainer: React.FC = () => {
  const {
    activeChapter,
    memories,
    relics,
    achievements,
    radioChannels,
    spiralState,
    isFractured,
    reducedMotion,
    setReducedMotion,
    discoverRadioChannel,
    startNewGame,
  } = useGame();

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsArchiveOpen(false);
        setIsRadioOpen(false);
        setIsProfileOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unlockedMemories = memories.filter((m) => m.isUnlocked).length;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Interactive Particle Atmosphere */}
      <CanvasAtmosphere
        intensity={activeChapter === 'menu' ? 'calm' : activeChapter.includes('kodvaros') ? 'cosmic' : 'storm'}
        reducedMotion={reducedMotion}
      />

      {/* Reality Fracture Distortion Effect */}
      <RealityFractureOverlay isTriggered={isFractured} reducedMotion={reducedMotion} />

      {/* Top Bar Navigation (Clean 3-zone contract) */}
      <TopBarNav
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenRadio={() => setIsRadioOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unlockedMemoriesCount={unlockedMemories}
        totalMemoriesCount={memories.length}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeChapter === 'menu' ? (
          <MainMenuScene
            onOpenArchive={() => setIsArchiveOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <InteractiveStoryScene
            onOpenRadio={() => setIsRadioOpen(true)}
            onOpenArchive={() => setIsArchiveOpen(true)}
          />
        )}
      </main>

      {/* Interactive Modals */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={setReducedMotion}
        onResetGame={startNewGame}
      />
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
