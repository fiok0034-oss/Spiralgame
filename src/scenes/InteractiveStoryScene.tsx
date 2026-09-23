import React, { useState } from 'react';
import { useGame } from '../game/GameContext';
import { STORY_NODES } from '../data/storyData';
import { GAME_IMAGES } from '../assets/images';
import { GeoradarMiniGame } from '../components/GeoradarMiniGame';
import { soundEngine } from '../audio/SoundEngine';

interface InteractiveStorySceneProps {
  onOpenRadio: () => void;
  onOpenArchive: () => void;
}

export const InteractiveStoryScene: React.FC<InteractiveStorySceneProps> = ({
  onOpenRadio,
  onOpenArchive,
}) => {
  const { activeSceneId, makeChoice, jumpToChapter, spiralState, triggerRealityFracture } = useGame();
  const [obeliskTouched, setObeliskTouched] = useState(false);

  const currentNode = STORY_NODES[activeSceneId] || STORY_NODES['v1_intro'];
  const illustrationSrc = currentNode.illustrationKey ? GAME_IMAGES[currentNode.illustrationKey] : null;

  const handleTouchObelisk = () => {
    setObeliskTouched(true);
    soundEngine.playCrystalResonance(528);
    triggerRealityFracture();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 text-slate-100 animate-in fade-in duration-300">
      {/* Location & Time Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/20 pb-3 mb-6 text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">📍</span>
          <span className="text-slate-200">{currentNode.location || 'Antarktisz, 82°16’S'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{currentNode.timestamp || 'Δ–82 IDŐVONAL'}</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            onClick={() => jumpToChapter('menu')}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Főmenü
          </button>
        </div>
      </div>

      {/* Cinematic Scene Artwork / Fallback Header */}
      {illustrationSrc && (
        <div className="relative w-full h-56 md:h-80 rounded-2xl overflow-hidden mb-8 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] bg-slate-950">
          <img
            src={illustrationSrc}
            alt={currentNode.speaker}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          />
          {/* Gradients to merge seamlessly into content */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-black/30 pointer-events-none" />

          {/* Speaker Card Floating on Image */}
          <div className="absolute bottom-4 left-4 md:left-6">
            <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 px-4 py-2 rounded-xl inline-block">
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

      {/* Main Narrative Content Box */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm mb-8 shadow-xl">
        {!illustrationSrc && (
          <div className="mb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              {currentNode.speakerRole || 'SZEREP'}
            </span>
            <h2 className="text-xl font-cinzel font-bold text-slate-100 mt-0.5">
              {currentNode.speaker}
            </h2>
          </div>
        )}

        <div className="text-base md:text-lg leading-relaxed text-slate-200 font-sans whitespace-pre-line space-y-4">
          {currentNode.text}
        </div>

        {currentNode.subtext && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-mono text-cyan-300/80 italic flex items-center gap-2">
            <span>ℹ️</span>
            <span>{currentNode.subtext}</span>
          </div>
        )}
      </div>

      {/* INTERACTIVE COMPONENT INSERTS */}
      {/* 1. Georadar Minigame */}
      {currentNode.interactiveComponent === 'georadar' && (
        <div className="mb-8">
          <GeoradarMiniGame
            isCompleted={spiralState.worldState.radarAnomalyFound}
            onAnomalyLocked={() => {
              // Lock in event handled in choices
            }}
          />
        </div>
      )}

      {/* 2. Radio Scanner Button */}
      {currentNode.interactiveComponent === 'radio' && (
        <div className="mb-8 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 text-center">
          <div className="text-xs font-mono text-slate-400 mb-3">
            A tábori rádió panelje folyamatosan sistereg. Hangold be a frekvenciákat!
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenRadio();
            }}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            📻 Rádióhangoló Megnyitása (82.0 MHz keresése)
          </button>
        </div>
      )}

      {/* 3. Symbol Puzzle on Obelisk */}
      {currentNode.interactiveComponent === 'symbol_puzzle' && (
        <div className="mb-8 bg-slate-950 border border-cyan-500/40 rounded-xl p-6 text-center">
          <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            AZ OBELISZK HOMOLÓG SPIRÁLJA // Δ–T1
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            A fekete kő sima, de a vésett spirális barázdák melegek. Érintsd meg a szimbólumot a tudati szinkronizációhoz.
          </p>
          <button
            onClick={handleTouchObelisk}
            className={`px-8 py-4 rounded-xl border font-cinzel text-sm tracking-widest transition-all cursor-pointer ${
              obeliskTouched
                ? 'bg-cyan-950/80 border-cyan-300 text-cyan-200 shadow-[0_0_25px_#22d3ee]'
                : 'bg-slate-900 hover:bg-slate-800 border-cyan-500/50 text-slate-200'
            }`}
          >
            {obeliskTouched ? '🌀 A JÉGLÉGZÉS FELGYORSULT' : '🖐️ A SPIRÁL MEGEÉRINTÉSE'}
          </button>
        </div>
      )}

      {/* 4. Three Rings in Kódváros */}
      {currentNode.interactiveComponent === 'rings_puzzle' && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center">
            <div className="text-xl mb-1">🧊</div>
            <div className="text-xs font-mono font-bold text-cyan-300">1. KÖR: A JÉG EMLÉKE</div>
            <p className="text-[11px] text-slate-400 mt-1">Kilenc fagyott gömb, a múlt rögzített pillanatai.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center">
            <div className="text-xl mb-1">🔊</div>
            <div className="text-xs font-mono font-bold text-indigo-300">2. KÖR: A HANGOK ALAGÚTJA</div>
            <p className="text-[11px] text-slate-400 mt-1">Visszhangok és szavak szétválasztása a csendtől.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center">
            <div className="text-xl mb-1">👁️</div>
            <div className="text-xs font-mono font-bold text-purple-300">3. KÖR: A VÉGTELEN SZEME</div>
            <p className="text-[11px] text-slate-400 mt-1">Önmagad tükre az idő és tudat peremén.</p>
          </div>
        </div>
      )}

      {/* Choice Decision Panel */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
          DÖNTÉSI LEHETŐSÉGEK // A VILÁG EMLÉKSZIK:
        </div>

        {currentNode.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => makeChoice(choice)}
            className="w-full text-left p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400/80 rounded-xl transition-all group cursor-pointer shadow-md hover:shadow-cyan-950/40 hover:translate-x-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-base font-cinzel font-semibold text-slate-100 group-hover:text-cyan-200">
                {choice.label}
              </span>
              <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Kiválasztás →
              </span>
            </div>
            {choice.reflection && (
              <p className="text-xs text-slate-400 mt-1 italic font-sans">
                {choice.reflection}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Dossier Prompt */}
      <div className="mt-12 text-center text-xs font-mono text-slate-500">
        Új információkért keresd fel az{' '}
        <button
          onClick={onOpenArchive}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
        >
          ARCHÍV-82
        </button>{' '}
        dossziéit.
      </div>
    </div>
  );
};
