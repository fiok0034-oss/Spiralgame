import React, { useState } from 'react';
import { SpiralPulseCanvas } from '../effects/SpiralPulseCanvas';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';
import { GameChapterId } from '../types/game';
import { TTS_ENABLED } from '../config/featureFlags';

interface MainMenuSceneProps {
  onOpenArchive: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenPrototypeLab?: () => void;
}

export const MainMenuScene: React.FC<MainMenuSceneProps> = ({
  onOpenArchive,
  onOpenProfile,
  onOpenSettings,
  onOpenPrototypeLab,
}) => {
  const { startNewGame, continueGame, jumpToChapter, spiralState, memories, storyLog } = useGame();
  const [isEntering, setIsEntering] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);

  const hasSavedProgress = storyLog.length > 1 || spiralState.echoCount > 0;

  const handleStartGame = () => {
    setIsEntering(true);
    soundEngine.playIceBreath();
    soundEngine.playCrystalResonance(432);

    setTimeout(() => {
      startNewGame();
    }, 1000);
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
      subtitle: 'A Spirál Magja · A Négy Út & a Titkos Szoba',
    },
  ];

  return (
    <div
      className={`relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-[#050811] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="mb-4">
          <SpiralPulseCanvas
            awarenessLevel={spiralState.spiralAwareness}
            size={260}
            interactive={true}
            onActivate={handleStartGame}
          />
        </div>

        <div className="space-y-2 mb-8">
          <div className="text-xs font-mono tracking-[0.28em] uppercase text-cyan-400/80">
            Δ–82 · INTERAKTÍV ARCHÍVUM
            {spiralState.loopState > 1 && ` · ${spiralState.loopState}. IDŐHUROK`}
          </div>
          <h1 className="text-3xl md:text-5xl font-cinzel font-black tracking-wider text-slate-100 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            A SPIRÁL LEHELETE
          </h1>
          <p className="text-xs md:text-sm font-sans text-slate-400 max-w-md mx-auto italic">
            Csurik Konrád könyve alapján · Interaktív pszichológiai sci-fi és meta-narratíva
          </p>
        </div>

        {/* Main CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 z-20 w-full justify-center flex-wrap">
          {hasSavedProgress && (
            <button
              type="button"
              onClick={continueGame}
              className="w-full sm:w-auto px-7 py-3.5 min-h-[46px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cinzel font-bold text-sm tracking-widest uppercase rounded-lg transition-all cursor-pointer"
            >
              Folytatás
            </button>
          )}

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full sm:w-auto px-8 py-3.5 min-h-[46px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cinzel font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            {spiralState.loopState > 1 ? 'Második Lélegzet (Új Hurok)' : 'Belépés a Spirálba'}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              setShowChapterSelect(!showChapterSelect);
            }}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[46px] bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-200 font-mono text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
          >
            {showChapterSelect ? 'Fejezetek Elrejtése' : 'Idővonal Fejezetei'}
          </button>
        </div>

        {spiralState.completedEndings.length > 0 && (
          <div className="mt-4 text-xs font-mono text-amber-300/90">
            Feloldott befejezések: {spiralState.completedEndings.length}/5 · Minden újrajátszás mélyebb rétegeket nyit meg.
          </div>
        )}

        {/* Chapter Selection Drawer */}
        {showChapterSelect && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-xl">
            {chapters.map((ch) => {
              const lockedByLevente =
                (ch.id === 'chapter5_kodvaros' ||
                  ch.id === 'chapter6_guardians' ||
                  ch.id === 'chapter_final') &&
                !spiralState.worldState.leventeChapterCompleted;

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (lockedByLevente) {
                      soundEngine.playMechanicalTick(-2);
                      return;
                    }
                    soundEngine.startAmbientDrone();
                    soundEngine.startIceBreathing();
                    jumpToChapter(ch.id, ch.sceneId);
                  }}
                  className={`p-3 rounded-lg border transition-all ${
                    lockedByLevente
                      ? 'bg-slate-950/50 border-slate-800/80 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950/80 border-slate-800 hover:border-cyan-400/60 cursor-pointer hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-mono font-bold text-cyan-300">{ch.title}</div>
                    {lockedByLevente && (
                      <span className="text-[10px] font-mono text-amber-400">🔒 Levente szükséges</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ch.subtitle}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secondary Quick Action Bar */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onOpenArchive();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>ARCHÍV-82</span>
            <span className="text-cyan-400 tabular-nums">({memories.filter((m) => m.isUnlocked).length})</span>
          </button>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onOpenProfile();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            SPIRÁLPROFIL
          </button>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            BEÁLLÍTÁSOK
          </button>

          {onOpenPrototypeLab && (
            <>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  onOpenPrototypeLab();
                }}
                className="hover:text-cyan-300 text-cyan-400/90 transition-colors cursor-pointer"
              >
                {TTS_ENABLED ? '3D & AI HANG LABOR' : '3D & HANG LABOR'}
              </button>
            </>
          )}
        </div>

        <div className="mt-10 text-[11px] font-mono text-slate-500 max-w-lg">
          „A jeges szél nem emlékezett a nyarakra. Csak a fehérség volt, a mérhetetlen, mindent elnyelő csend.”
        </div>
      </div>
    </div>
  );
};
