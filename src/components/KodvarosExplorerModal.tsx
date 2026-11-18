import React, { useState, useEffect } from 'react';
import {
  Compass,
  Lock,
  X,
  ArrowRight,
  Eye,
  BookOpen,
  MapPin,
  Gamepad2,
  History,
  Thermometer,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import {
  KODVAROS_INHABITANTS,
  KODVAROS_QUESTS,
  KODVAROS_RINGS,
  KODVAROS_SIDE_QUESTS,
} from '../data/kodvarosData';
import { CitizenInteraction } from './CitizenInteraction';
import { soundEngine } from '../audio/SoundEngine';

interface KodvarosExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThermalLevelInfo {
  level: 0 | 1 | 2 | 3;
  label: string;
  tempTag: string;
  colorHex: string;
  badgeClass: string;
  isCurrentSceneInRing: boolean;
}

export const KodvarosExplorerModal: React.FC<KodvarosExplorerModalProps> = ({ isOpen, onClose }) => {
  const {
    activeSceneId,
    spiralState,
    secrets,
    jumpToChapter,
    markKodvarosRingExplored,
    exploreKodvarosLandmark,
    setActiveMiniGameId,
  } = useGame();

  const [selectedRingId, setSelectedRingId] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<'map' | 'lore' | 'inhabitants' | 'quests'>('map');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('lm_r1_market');
  const [preferredNpcId, setPreferredNpcId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && spiralState.worldState.leventeChapterCompleted) {
      markKodvarosRingExplored(selectedRingId);
    }
  }, [isOpen, selectedRingId, spiralState.worldState.leventeChapterCompleted]);

  if (!isOpen) return null;

  const isKodvarosUnlocked = spiralState.worldState.leventeChapterCompleted;
  const ring = KODVAROS_RINGS.find((r) => r.ringId === selectedRingId) || KODVAROS_RINGS[0];
  const ringNpcs = KODVAROS_INHABITANTS.filter((n) => n.ringId === selectedRingId);
  const ringQuests = KODVAROS_QUESTS.filter((q) => q.ringId === selectedRingId);
  const ringSideQuest = KODVAROS_SIDE_QUESTS.find((q) => q.ringId === selectedRingId);
  const ringSecret = secrets.find((s) => s.id === ring.secretId);
  const selectedLandmark =
    ring.landmarks.find((l) => l.id === selectedLandmarkId) || ring.landmarks[0];

  const isRingDone = (id: 1 | 2 | 3) => {
    if (id === 1) return spiralState.worldState.kodvarosRing1Done;
    if (id === 2) return spiralState.worldState.kodvarosRing2Done;
    return spiralState.worldState.kodvarosRing3Done;
  };

  const isRingExplored = (id: 1 | 2 | 3) =>
    spiralState.worldState.kodvarosExploredRings.includes(id) || isRingDone(id);

  // State-based cold -> warm visual progression driven by InteractiveStoryScene (activeSceneId) + worldState
  const getRingThermalState = (id: 1 | 2 | 3): ThermalLevelInfo => {
    const done = isRingDone(id);
    const explored = isRingExplored(id);
    const isOuterHere =
      (id === 1 && activeSceneId === 'k1_ring1_ice_market') ||
      (id === 2 && activeSceneId === 'k1_ring2_echo_bazaar') ||
      (id === 3 && activeSceneId === 'k1_ring3_mirror_observatory');
    const isSanctumHere =
      (id === 1 && activeSceneId === 'k1_ring1_sanctum') ||
      (id === 2 && activeSceneId === 'k1_ring2_choir') ||
      (id === 3 && activeSceneId === 'k1_ring3_crown');
    const isCurrentSceneInRing = isOuterHere || isSanctumHere;

    const ringMiniGameDone =
      (id === 1 && spiralState.worldState.completedMiniGames.includes('crystal_resonance')) ||
      (id === 2 && spiralState.worldState.completedMiniGames.includes('echo_viaduct_tuning')) ||
      (id === 3 && spiralState.worldState.completedMiniGames.includes('mirror_city_symmetry'));

    const sideQuestSolved =
      (id === 1 && spiralState.worldState.kodvarosSolvedSideQuests.includes('sq_r1_ice_glyphs')) ||
      (id === 2 && spiralState.worldState.kodvarosSolvedSideQuests.includes('sq_r2_radio_grid')) ||
      (id === 3 && spiralState.worldState.kodvarosSolvedSideQuests.includes('sq_r3_mirror_paradox'));

    if (done) {
      return {
        level: 3,
        label: sideQuestSolved ? 'Forró · Teljesen Harmonizált' : 'Meleg · Kör Teljesítve',
        tempTag: sideQuestSolved ? '37°C ★' : '34°C ✓',
        colorHex: sideQuestSolved ? '#fb7185' : '#f97316',
        badgeClass: 'text-orange-300 border-orange-400/50 bg-orange-950/35',
        isCurrentSceneInRing,
      };
    }
    if (isSanctumHere || ringMiniGameDone || sideQuestSolved) {
      return {
        level: 2,
        label: 'Melegedő · Mag-közel / Próba Kész',
        tempTag: '18°C',
        colorHex: '#f59e0b',
        badgeClass: 'text-amber-300 border-amber-400/50 bg-amber-950/35',
        isCurrentSceneInRing,
      };
    }
    if (isOuterHere || explored) {
      return {
        level: 1,
        label: 'Hűvös · Felfedezve',
        tempTag: '-4°C',
        colorHex: '#06b6d4',
        badgeClass: 'text-cyan-300 border-cyan-400/50 bg-cyan-950/35',
        isCurrentSceneInRing,
      };
    }
    return {
      level: 0,
      label: 'Hideg · Fagyott / Feltáratlan',
      tempTag: '-42°C',
      colorHex: '#64748b',
      badgeClass: 'text-slate-400 border-slate-700 bg-slate-900/70',
      isCurrentSceneInRing,
    };
  };

  const selectedThermal = getRingThermalState(selectedRingId);
  const ringsDoneCount = [1, 2, 3].filter((id) => isRingDone(id as 1 | 2 | 3)).length;
  const ringsExploredCount = [1, 2, 3].filter((id) => isRingExplored(id as 1 | 2 | 3)).length;
  const completedQuestsCount = spiralState.worldState.kodvarosCompletedQuests.length;

  const handleSelectRing = (ringId: 1 | 2 | 3) => {
    soundEngine.playUiClick();
    setSelectedRingId(ringId);
    const nextRing = KODVAROS_RINGS.find((r) => r.ringId === ringId);
    if (nextRing?.landmarks[0]) {
      setSelectedLandmarkId(nextRing.landmarks[0].id);
    }
    setPreferredNpcId(null);
    if (isKodvarosUnlocked) {
      markKodvarosRingExplored(ringId);
    }
  };

  const handleTravelToEvent = (chapterId: Parameters<typeof jumpToChapter>[0], sceneId: string) => {
    const needsLeventeGate = chapterId === 'chapter5_kodvaros' && !isKodvarosUnlocked;
    if (needsLeventeGate) {
      soundEngine.playMechanicalTick(-2);
      return;
    }
    jumpToChapter(chapterId, sceneId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 bg-slate-950/75">
          <div>
            <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
              KÓDVÁROS · A HÁROM KÖR (KÖRZETEK) FELFEDEZŐJE
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
              Felfedezett körök: {ringsExploredCount}/3 · Harmonizálva: {ringsDoneCount}/3 · Küldetések:{' '}
              {completedQuestsCount}/{KODVAROS_QUESTS.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 min-h-[40px] text-xs font-mono text-slate-300 hover:text-white border border-slate-700 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Bezárás</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Ring Selector & Thermal State-Coded Concentric Atlas */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-4 space-y-4">
            {/* Global Three-Ring SVG Diagram with Cold -> Warm Thermal States */}
            <div className="bg-slate-950/85 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="inline-flex items-center gap-1 text-cyan-300">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>ÁLLAPOT-HŐTÉRKÉP</span>
                </span>
                <span className="truncate max-w-[130px]">Jelenet: {activeSceneId}</span>
              </div>

              <svg viewBox="0 0 220 220" className="w-44 h-44">
                <defs>
                  <radialGradient id="thermalGlow" cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor={ringsDoneCount === 3 ? '#f97316' : ringsExploredCount > 0 ? '#06b6d4' : '#334155'}
                      stopOpacity="0.35"
                    />
                    <stop offset="100%" stopColor="#050811" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="110" r="96" fill="url(#thermalGlow)" />

                {KODVAROS_RINGS.map((rItem) => {
                  const radius = rItem.ringId === 1 ? 88 : rItem.ringId === 2 ? 62 : 36;
                  const active = selectedRingId === rItem.ringId;
                  const thermal = getRingThermalState(rItem.ringId);
                  return (
                    <g key={rItem.ringId}>
                      <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        fill={active ? thermal.colorHex : 'transparent'}
                        fillOpacity={active ? 0.16 : 0}
                        stroke={thermal.colorHex}
                        strokeWidth={active ? 4 : thermal.level >= 2 ? 2.8 : 1.75}
                        strokeDasharray={thermal.level >= 2 ? 'none' : thermal.level === 1 ? '10 4' : '4 6'}
                        className="cursor-pointer transition-all"
                        onClick={() => handleSelectRing(rItem.ringId)}
                      />
                      {thermal.isCurrentSceneInRing && (
                        <circle
                          cx={110 + radius}
                          cy="110"
                          r="5"
                          fill="#f8fafc"
                          stroke={thermal.colorHex}
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}
                <circle
                  cx="110"
                  cy="110"
                  r="10"
                  fill={ringsDoneCount === 3 ? '#f97316' : activeSceneId === 'k1_three_rings' ? '#22d3ee' : '#64748b'}
                />
              </svg>

              {/* Cold -> Warm Thermal Legend */}
              <div className="w-full grid grid-cols-2 gap-1.5 text-[10px] font-mono mt-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                  <span>Hideg: Zárt/Fagyott</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  <span>Hűvös: Felfedezve</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Meleg: Mag/Próba</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>Forró: Harmonizált</span>
                </div>
              </div>
            </div>

            {/* 3 Distinct District Cards with Live Thermal Level */}
            <div className="space-y-2">
              {KODVAROS_RINGS.map((rItem) => {
                const thermal = getRingThermalState(rItem.ringId);
                const selected = selectedRingId === rItem.ringId;
                return (
                  <button
                    key={rItem.ringId}
                    type="button"
                    onClick={() => handleSelectRing(rItem.ringId)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      selected
                        ? 'border-cyan-400 bg-cyan-950/35'
                        : 'border-slate-800 bg-slate-950/70 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span style={{ color: thermal.colorHex }} className="font-bold">
                        {rItem.code}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] ${thermal.badgeClass}`}>
                        {thermal.tempTag}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-sm font-cinzel font-bold text-slate-100">
                        {rItem.name}
                      </div>
                      {thermal.isCurrentSceneInRing && (
                        <span className="text-[10px] font-mono text-amber-300 animate-pulse">
                          ● Aktív helyszín
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{thermal.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right District Workspace */}
          <div className="lg:col-span-8 overflow-y-auto p-5 bg-slate-950/40 space-y-5">
            {!isKodvarosUnlocked && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Kódváros fizikai kapuja Levente IV. fejezetének teljesítése után nyílik meg. Alább elérheted Levente fejezetét!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTravelToEvent('chapter4_levente', 'lev1_intro')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Ugrás Levente Fejezetébe →
                </button>
              </div>
            )}

            {/* Selected District Banner */}
            <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                  <span style={{ color: selectedThermal.colorHex }} className="font-bold">
                    {ring.code} · {selectedThermal.tempTag}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${selectedThermal.badgeClass}`}>
                    {selectedThermal.label}
                  </span>
                </div>
                <h3 className="text-xl font-cinzel font-bold text-slate-100 mt-0.5">{ring.name}</h3>
              </div>

              <button
                type="button"
                disabled={!isKodvarosUnlocked}
                onClick={() => handleTravelToEvent('chapter5_kodvaros', ring.entrySceneId)}
                className={`px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-mono font-bold inline-flex items-center gap-2 transition-colors ${
                  isKodvarosUnlocked
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isKodvarosUnlocked ? <Compass className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Belépés a {ring.ringId}. Körbe</span>
              </button>
            </div>

            {/* District Workspace Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('map');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Körzeti Térkép</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('lore');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                  activeTab === 'lore'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lore & Történeti Események</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('inhabitants');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  activeTab === 'inhabitants'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lakók & Párbeszédek ({ringNpcs.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('quests');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  activeTab === 'quests'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Küldetések & Titok
              </button>
            </div>

            {/* Tab 1: District-Specific Interactive Map */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div
                  className="rounded-xl border bg-slate-950/90 p-4 transition-colors"
                  style={{ borderColor: `${selectedThermal.colorHex}55` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3">
                    <span style={{ color: selectedThermal.colorHex }} className="uppercase tracking-wider font-bold">
                      {ring.ringId}. Kör Interaktív Körzettérképe · {selectedThermal.label}
                    </span>
                    <span className="text-slate-400">
                      Kattints egy jelölőre a részletekhez
                    </span>
                  </div>

                  {/* Unique District Blueprint SVG per Ring using Thermal Color Coding */}
                  <div className="relative rounded-xl border border-slate-800/90 bg-[#050811] overflow-hidden">
                    <svg viewBox="0 0 320 190" className="w-full h-52 md:h-60">
                      {ring.ringId === 1 && (
                        <g stroke={selectedThermal.colorHex} strokeOpacity="0.32" fill="none">
                          <polygon points="160,18 280,58 280,140 160,175 40,140 40,58" strokeWidth="1.4" />
                          <polygon points="160,44 235,72 235,128 160,152 85,128 85,72" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="70" y1="62" x2="242" y2="56" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1="70" y1="62" x2="160" y2="136" strokeWidth="1.5" />
                          <line x1="242" y1="56" x2="160" y2="136" strokeWidth="1.5" />
                        </g>
                      )}
                      {ring.ringId === 2 && (
                        <g stroke={selectedThermal.colorHex} strokeOpacity="0.35" fill="none">
                          <path d="M 35 140 Q 160 20 285 140" strokeWidth="2.2" />
                          <path d="M 55 150 Q 160 45 265 150" strokeWidth="1.2" strokeDasharray="5 4" />
                          <line x1="68" y1="122" x2="162" y2="52" strokeWidth="1.5" />
                          <line x1="162" y1="52" x2="252" y2="124" strokeWidth="1.5" />
                          <line x1="68" y1="122" x2="252" y2="124" strokeWidth="1.2" strokeDasharray="4 4" />
                        </g>
                      )}
                      {ring.ringId === 3 && (
                        <g stroke={selectedThermal.colorHex} strokeOpacity="0.35" fill="none">
                          <circle cx="160" cy="95" r="78" strokeWidth="1.4" strokeDasharray="6 4" />
                          <circle cx="160" cy="95" r="46" strokeWidth="1.1" />
                          <polygon points="160,24 272,150 48,150" strokeWidth="1.2" strokeDasharray="3 3" />
                          <line x1="78" y1="78" x2="244" y2="52" strokeWidth="1.5" />
                          <line x1="78" y1="78" x2="162" y2="138" strokeWidth="1.5" />
                          <line x1="244" y1="52" x2="162" y2="138" strokeWidth="1.5" />
                        </g>
                      )}

                      {ring.landmarks.map((lm) => {
                        const active = selectedLandmark?.id === lm.id;
                        const visited = spiralState.worldState.kodvarosExploredLandmarks.includes(lm.id);
                        const isStoryHere = activeSceneId === lm.sceneId;
                        const strokeCol = isStoryHere ? '#f8fafc' : selectedThermal.colorHex;
                        return (
                          <g
                            key={lm.id}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedLandmarkId(lm.id);
                              exploreKodvarosLandmark(lm.id);
                            }}
                          >
                            <circle
                              cx={lm.x}
                              cy={lm.y}
                              r={active ? 18 : 13}
                              fill={selectedThermal.colorHex}
                              fillOpacity={active ? 0.28 : 0.12}
                              stroke={strokeCol}
                              strokeWidth={active || isStoryHere ? 2.5 : 1.5}
                            />
                            <circle
                              cx={lm.x}
                              cy={lm.y}
                              r={5}
                              fill={isStoryHere ? '#fbbf24' : active ? '#f8fafc' : visited ? '#34d399' : selectedThermal.colorHex}
                            />
                            <text
                              x={lm.x}
                              y={lm.y + 26}
                              textAnchor="middle"
                              fill={active || isStoryHere ? '#f8fafc' : '#94a3b8'}
                              fontSize="9"
                              fontFamily="monospace"
                            >
                              {lm.tag}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Selected Landmark Details */}
                  {selectedLandmark && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-mono text-cyan-400">
                            {selectedLandmark.tag}
                            {activeSceneId === selectedLandmark.sceneId && ' · ● Jelenlegi történeti pozíciód'}
                          </div>
                          <h4 className="text-base font-cinzel font-bold text-slate-100">
                            {selectedLandmark.label}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLandmark.npcId && (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playUiClick();
                                setPreferredNpcId(selectedLandmark.npcId || null);
                                setActiveTab('inhabitants');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/35 text-xs font-mono text-cyan-200 cursor-pointer"
                            >
                              Beszélj a lakóval
                            </button>
                          )}
                          {selectedLandmark.miniGameId && (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playUiClick();
                                setActiveMiniGameId(selectedLandmark.miniGameId!);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-amber-500/35 text-xs font-mono text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Gamepad2 className="w-3.5 h-3.5" />
                              <span>Próba Indítása</span>
                            </button>
                          )}
                          {isKodvarosUnlocked && (
                            <button
                              type="button"
                              onClick={() =>
                                handleTravelToEvent('chapter5_kodvaros', selectedLandmark.sceneId)
                              }
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Utazás ide</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        {selectedLandmark.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                    Körzeti Építészeti Törvény
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {ring.architecturalLaw}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Unique Lore Entries & Linked Story Events (including Levente) */}
            {activeTab === 'lore' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
                    A {ring.ringId}. Kör Egyedi Lore-bejegyzései
                  </div>
                  {ring.loreEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-slate-900/75 border border-slate-800 space-y-1.5"
                    >
                      <div className="text-[11px] font-mono text-cyan-400">{entry.tag}</div>
                      <h4 className="text-sm font-cinzel font-bold text-slate-100">{entry.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{entry.body}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider">
                    <History className="w-4 h-4" />
                    <span>Kapcsolódó Történeti Események & Fejezetek</span>
                  </div>
                  <div className="space-y-2.5">
                    {ring.linkedStoryEvents.map((ev) => {
                      const blocked = ev.chapterId === 'chapter5_kodvaros' && !isKodvarosUnlocked;
                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-[11px] font-mono text-amber-300 font-bold">
                              {ev.characterTag}
                            </div>
                            <div className="text-sm font-cinzel font-bold text-slate-100">
                              {ev.label}
                            </div>
                            <p className="text-xs text-slate-400">{ev.summary}</p>
                          </div>
                          <button
                            type="button"
                            disabled={blocked}
                            onClick={() => handleTravelToEvent(ev.chapterId, ev.sceneId)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 ${
                              blocked
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 cursor-pointer'
                            }`}
                          >
                            {blocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Levente szükséges</span>
                              </>
                            ) : (
                              <>
                                <span>Esemény Elérése</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: CitizenInteraction passing live spiralState.personality */}
            {activeTab === 'inhabitants' && (
              <CitizenInteraction
                ringId={selectedRingId}
                isKodvarosUnlocked={isKodvarosUnlocked}
                preferredNpcId={preferredNpcId}
                personality={spiralState.personality}
              />
            )}

            {/* Tab 4: Ring Quests, Side Quest Status & Ring Secret */}
            {activeTab === 'quests' && (
              <div className="space-y-4">
                {ringSideQuest && (
                  <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-300 font-bold">{ringSideQuest.code}</span>
                      <span
                        className={
                          spiralState.worldState.kodvarosSolvedSideQuests.includes(ringSideQuest.id)
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                        }
                      >
                        {spiralState.worldState.kodvarosSolvedSideQuests.includes(ringSideQuest.id)
                          ? '✓ Főtér Küldetéstáblán Lezárva'
                          : ringSideQuest.rewardDescription}
                      </span>
                    </div>
                    <div className="text-sm font-cinzel font-bold text-slate-100">
                      {ringSideQuest.title}
                    </div>
                    <p className="text-xs text-slate-300">{ringSideQuest.summary}</p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                    A {ring.ringId}. Kör Küldetései
                  </div>
                  {ringQuests.map((q) => {
                    const done = spiralState.worldState.kodvarosCompletedQuests.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border ${
                          done ? 'border-emerald-500/40 bg-emerald-950/15' : 'border-slate-800 bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-cinzel font-bold text-slate-100">{q.title}</div>
                          <span className={`text-[11px] font-mono ${done ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {done ? '✓ Teljesítve' : q.rewardText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{q.description}</p>
                      </div>
                    );
                  })}
                </div>

                {ringSecret && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/35 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300 inline-flex items-center gap-1.5 font-bold">
                        <Eye className="w-4 h-4" />
                        <span>A KÖR REJTETT TITKA · {ringSecret.spiralWord || 'KÓDVÁROS'}</span>
                      </span>
                      <span className={ringSecret.isUnlocked ? 'text-emerald-400' : 'text-slate-400'}>
                        {ringSecret.isUnlocked ? '✓ Feltárva' : '🔒 Zárva'}
                      </span>
                    </div>
                    <div className="text-sm font-cinzel font-bold text-slate-100">{ringSecret.title}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ringSecret.isUnlocked ? ringSecret.loreText : `Nyom: ${ringSecret.hint}`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
