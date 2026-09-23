import React, { useState } from 'react';
import { SpiralPulseCanvas } from '../effects/SpiralPulseCanvas';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';
import { GameChapterId } from '../types/game';

interface MainMenuSceneProps {
  onOpenArchive: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const MainMenuScene: React.FC<MainMenuSceneProps> = ({
  onOpenArchive,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { startNewGame, jumpToChapter, spiralState, memories } = useGame();
  const [isEntering, setIsEntering] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);

  const handleStartGame = () => {
    setIsEntering(true);
    soundEngine.playIceBreath();
    soundEngine.playCrystalResonance(432);

    setTimeout(() => {
      startNewGame();
    }, 1200);
  };

  const chapters: { id: GameChapterId; sceneId: string; title: string; subtitle: string }[] = [
    {
      id: 'chapter1_viktor',
      sceneId: 'v1_intro',
      title: 'I. FEJEZET: VIKTOR',
      subtitle: 'Antarktisz 82° · Georadar · Az Első Spirál',
    },
    {
      id: 'chapter2_lena',
      sceneId: 'l1_intro',
      title: 'II. FEJEZET: LENA',
      subtitle: 'Akusztikai Rezonancia · Időtorzulás',
    },
    {
      id: 'chapter3_mira',
      sceneId: 'm1_intro',
      title: 'III. FEJEZET: MIRA',
      subtitle: 'A Második Kapu · Mit érdemes létrehozni?',
    },
    {
      id: 'chapter4_levente',
      sceneId: 'lev1_intro',
      title: 'IV. FEJEZET: LEVENTE',
      subtitle: 'Álomvilág · A Szinkronlélek',
    },
    {
      id: 'chapter5_kodvaros',
      sceneId: 'k1_three_rings',
      title: 'V. FEJEZET: KÓDVÁROS',
      subtitle: 'A Három Kör · Mozgó Építészet',
    },
    {
      id: 'chapter6_guardians',
      sceneId: 'g1_guardians_confrontation',
      title: 'VI. FEJEZET: AZ ŐRZŐK',
      subtitle: 'Kassarah & Ir-Haya · Emlékezet és Felejtés',
    },
    {
      id: 'chapter_final',
      sceneId: 'inf_final_encounter',
      title: 'VII. FEJEZET: A VÉGTELEN',
      subtitle: 'A Spirál Magja · A Három Választás',
    },
  ];

  return (
    <div
      className={`relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background vignette & subtle radial atmosphere */}
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-[#050811] pointer-events-none" />

      {/* Centerpiece: Interactive Archimedean Spiral */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="mb-4">
          <SpiralPulseCanvas
            awarenessLevel={spiralState.spiralAwareness}
            size={280}
            interactive={true}
            onActivate={handleStartGame}
          />
        </div>

        {/* Title & Canon Subtitle */}
        <div className="space-y-2 mb-8">
          <div className="text-xs font-mono tracking-[0.3em] uppercase text-cyan-400/80">
            Δ–82 // THE INFINITE ARCHIVE
          </div>
          <h1 className="text-3xl md:text-5xl font-cinzel font-black tracking-wider text-slate-100 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            A SPIRÁL LEHELETE
          </h1>
          <p className="text-xs md:text-sm font-sans text-slate-400 max-w-md mx-auto italic">
            Csurik Konrád könyve alapján · Interaktív pszichológiai sci-fi és meta-narratíva
          </p>
        </div>

        {/* Main CTA: "Belépés a Spirálba" */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-20 w-full justify-center">
          <button
            onClick={handleStartGame}
            className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cinzel font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Belépés a Spirálba
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setShowChapterSelect(!showChapterSelect);
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-200 font-mono text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
          >
            {showChapterSelect ? 'Fejezetek Elrejtése' : 'Idővonal Fejezetei'}
          </button>
        </div>

        {/* Chapter Selection Drawer */}
        {showChapterSelect && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-xl animate-in fade-in duration-300">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  soundEngine.startAmbientDrone();
                  soundEngine.startIceBreathing();
                  jumpToChapter(ch.id, ch.sceneId);
                }}
                className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-400/60 rounded-lg cursor-pointer transition-all hover:translate-x-1"
              >
                <div className="text-xs font-mono font-bold text-cyan-300">{ch.title}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ch.subtitle}</div>
              </div>
            ))}
          </div>
        )}

        {/* Secondary Quick Action Bar */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenArchive();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>📁 ARCHÍV-82</span>
            <span className="text-cyan-400">({memories.filter((m) => m.isUnlocked).length})</span>
          </button>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenProfile();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            🌀 SPIRÁLPROFIL
          </button>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            ⚙️ BEÁLLÍTÁSOK
          </button>
        </div>

        {/* Canonical Opening Line Footnote */}
        <div className="mt-10 text-[11px] font-mono text-slate-500 max-w-lg">
          „A jeges szél nem emlékezett a nyarakra. Csak a fehérség volt, a mérhetetlen, mindent elnyelő csend.”
        </div>
      </div>
    </div>
  );
};
