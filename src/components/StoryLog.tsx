import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { StoryLogEntry } from '../types/game';
import { StoryBranchingTree } from './StoryBranchingTree';
import { soundEngine } from '../audio/SoundEngine';

interface StoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  initialViewMode?: 'log' | 'tree';
}

type FilterMode = 'all' | 'choices_only' | 'current_speaker';

export const StoryLog: React.FC<StoryLogProps> = ({ isOpen, onClose, initialViewMode = 'log' }) => {
  const { storyLog, activeSceneId, clearStoryLog } = useGame();

  const [viewMode, setViewMode] = useState<'log' | 'tree'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological, desc = newest first
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialViewMode if provided
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  // Collect unique speakers for filtering
  const uniqueSpeakers = useMemo(() => {
    const set = new Set<string>();
    storyLog.forEach((entry) => {
      if (entry.speaker) set.add(entry.speaker);
    });
    return Array.from(set);
  }, [storyLog]);

  // Filtered and sorted entries
  const displayedEntries = useMemo(() => {
    let result = [...storyLog];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (entry) =>
          entry.speaker.toLowerCase().includes(q) ||
          (entry.speakerRole && entry.speakerRole.toLowerCase().includes(q)) ||
          entry.text.toLowerCase().includes(q) ||
          (entry.location && entry.location.toLowerCase().includes(q)) ||
          (entry.chosenOption &&
            (entry.chosenOption.label.toLowerCase().includes(q) ||
              (entry.chosenOption.reflection &&
                entry.chosenOption.reflection.toLowerCase().includes(q))))
      );
    }

    // Filter mode
    if (filterMode === 'choices_only') {
      result = result.filter((entry) => !!entry.chosenOption);
    } else if (filterMode === 'current_speaker' && selectedSpeaker !== 'all') {
      result = result.filter((entry) => entry.speaker === selectedSpeaker);
    }

    // Sort order
    if (sortOrder === 'desc') {
      result.reverse();
    }

    return result;
  }, [storyLog, searchQuery, filterMode, selectedSpeaker, sortOrder]);

  const choicesCount = useMemo(
    () => storyLog.filter((entry) => !!entry.chosenOption).length,
    [storyLog]
  );

  const scrollToBottom = () => {
    soundEngine.playUiClick();
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyTranscript = () => {
    soundEngine.playDiscovery();
    const formatted = storyLog
      .map((entry, idx) => {
        const time = entry.timestamp ? `[${entry.timestamp}] ` : '';
        const loc = entry.location ? `(${entry.location}) ` : '';
        const role = entry.speakerRole ? ` - ${entry.speakerRole}` : '';
        let str = `--- #${idx + 1} ${time}${loc}\n${entry.speaker}${role}:\n${entry.text}\n`;
        if (entry.chosenOption) {
          str += `➜ VÁLASZTOTT DÖNTÉS: "${entry.chosenOption.label}"\n`;
          if (entry.chosenOption.reflection) {
            str += `  Gondolat: ${entry.chosenOption.reflection}\n`;
          }
        }
        return str;
      })
      .join('\n');

    navigator.clipboard?.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Helper for speaker color tags
  const getSpeakerColorClass = (speaker: string) => {
    const s = speaker.toUpperCase();
    if (s.includes('VIKTOR')) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    if (s.includes('LENA')) return 'text-violet-400 border-violet-500/40 bg-violet-950/40';
    if (s.includes('MIRA')) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    if (s.includes('LEVENTE')) return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (s.includes('VÉGTELEN') || s.includes('INFINITE'))
      return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
    return 'text-slate-300 border-slate-700 bg-slate-900/60';
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="storylog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={containerRef}
        className={`w-full ${
          viewMode === 'tree' ? 'max-w-6xl' : 'max-w-4xl'
        } h-[94vh] max-h-[920px] bg-slate-950/95 border border-cyan-500/40 rounded-2xl flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden transition-all duration-300`}
      >
        {/* TOP TITLE & VIEW SWITCHER HEADER */}
        <div className="p-3.5 sm:p-5 border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📜</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="storylog-title"
                    className="text-base sm:text-xl font-cinzel font-bold text-slate-100 tracking-wider"
                  >
                    TÖRTÉNETI NAPLÓ // CHRONO-LOG
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    PERSISTENT EMLÉKEZET
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                  Rögzített narratív szakaszok, párbeszédek és az elágazási döntési fa
                </p>
              </div>
            </div>

            {/* VIEW MODE SWITCHER TABS */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setViewMode('log');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'log'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>📜</span>
                <span>Időrendi Napló</span>
                <span className="text-[10px] text-cyan-400/80 tabular-nums">({storyLog.length})</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setViewMode('tree');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>🌳</span>
                <span>Elágazási Fa</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  TÉRKÉP
                </span>
              </button>
            </div>

            {/* COPY & CLOSE BUTTONS */}
            <div className="flex items-center gap-2">
              {viewMode === 'log' && (
                <button
                  onClick={handleCopyTranscript}
                  title="Teljes napló másolása szövegként"
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{copied ? '✓ Másolva!' : '📋 Másolás'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-700 hover:border-red-500/50 bg-slate-900/80 hover:bg-red-950/40 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                ✕ Bezárás [ESC]
              </button>
            </div>
          </div>

          {/* METRICS & QUICK SUMMARY (SHOWN IN LOG VIEW) */}
          {viewMode === 'log' && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/60 mt-3">
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">{storyLog.length}</span>
                <span>szakasz rögzítve</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-amber-400 font-bold">{choicesCount}</span>
                <span>kulcsdöntés</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-slate-500">Jelenlegi pont:</span>
                <span className="text-cyan-300">{activeSceneId}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                  className="text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800"
                >
                  <span>{sortOrder === 'asc' ? '⬇️ Időrendi' : '⬆️ Legfrissebb elöl'}</span>
                </button>

                {sortOrder === 'asc' && (
                  <button
                    onClick={scrollToBottom}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
                  >
                    Ugrás a végére ↓
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SEARCH & FILTER CONTROLS (SHOWN IN LOG VIEW) */}
          {viewMode === 'log' && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Keresés szövegben, szereplőben, döntésben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/70 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setFilterMode('all');
                    setSelectedSpeaker('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mind ({storyLog.length})
                </button>

                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setFilterMode('choices_only');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    filterMode === 'choices_only'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡ Csak döntések</span>
                  <span className="text-[10px] opacity-75">({choicesCount})</span>
                </button>

                {uniqueSpeakers.length > 1 && (
                  <select
                    value={filterMode === 'current_speaker' ? selectedSpeaker : 'all'}
                    onChange={(e) => {
                      soundEngine.playUiClick();
                      if (e.target.value === 'all') {
                        setFilterMode('all');
                        setSelectedSpeaker('all');
                      } else {
                        setFilterMode('current_speaker');
                        setSelectedSpeaker(e.target.value);
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="all">Szereplő szűrés...</option>
                    {uniqueSpeakers.map((spk) => (
                      <option key={spk} value={spk}>
                        {spk}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BODY: CONDITIONAL VIEW BETWEEN TREE AND LOG */}
        {viewMode === 'tree' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <StoryBranchingTree onClose={onClose} />
          </div>
        ) : (
          <>
            {/* LOG ENTRIES TIMELINE BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-950">
          {displayedEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono">
              <span className="text-3xl mb-2">📡</span>
              <p className="text-sm text-slate-400">Nincs a szűrésnek megfelelő naplóbejegyzés.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                  setSelectedSpeaker('all');
                }}
                className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Szűrők visszaállítása
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-5 space-y-6 pl-4 sm:pl-6">
              {displayedEntries.map((entry, index) => {
                const isCurrentActive =
                  entry.sceneId === activeSceneId && !entry.chosenOption;
                const entryIndex = sortOrder === 'asc' ? index + 1 : displayedEntries.length - index;

                return (
                  <div
                    key={entry.id || `${entry.sceneId}_${index}`}
                    className={`relative rounded-xl border transition-all ${
                      isCurrentActive
                        ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    } p-4 sm:p-5`}
                  >
                    {/* Node Dot on Timeline Line */}
                    <div
                      className={`absolute -left-[23px] sm:-left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 ${
                        isCurrentActive
                          ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_10px_#22d3ee] animate-pulse'
                          : entry.chosenOption
                          ? 'bg-amber-400 border-amber-200'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    />

                    {/* Metadata Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/70 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400/90">#{String(entryIndex).padStart(2, '0')}</span>
                        {entry.location && (
                          <span className="text-slate-300 flex items-center gap-1">
                            <span>📍</span>
                            <span>{entry.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.timestamp && <span>{entry.timestamp}</span>}
                        {entry.atmosphere && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">
                            {entry.atmosphere}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Speaker Header Card */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getSpeakerColorClass(
                          entry.speaker
                        )}`}
                      >
                        {entry.speaker}
                      </span>
                      {entry.speakerRole && (
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                          // {entry.speakerRole}
                        </span>
                      )}
                    </div>

                    {/* Narrative Dialogue / Text Content */}
                    <div className="text-sm sm:text-base font-sans text-slate-200 leading-relaxed whitespace-pre-line">
                      {entry.text}
                    </div>

                    {/* Technical Subtext note */}
                    {entry.subtext && (
                      <div className="mt-3 pt-2 text-xs font-mono text-cyan-300/80 italic flex items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                        <span>ℹ️</span>
                        <span>{entry.subtext}</span>
                      </div>
                    )}

                    {/* KEY PLAYER CHOICE BOX */}
                    {entry.chosenOption ? (
                      <div className="mt-4 pt-3 border-t border-amber-500/30 bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 sm:p-4">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Meghozott Döntésed</span>
                          </span>
                          <span className="text-[10px] text-amber-400/80 font-normal">
                            Rögzítve
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-cinzel font-semibold text-amber-100 mt-1">
                          « {entry.chosenOption.label} »
                        </div>
                        {entry.chosenOption.reflection && (
                          <p className="text-xs font-sans text-slate-300 italic mt-1.5 pl-2 border-l-2 border-amber-500/40">
                            {entry.chosenOption.reflection}
                          </p>
                        )}
                      </div>
                    ) : isCurrentActive ? (
                      <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-2 text-xs font-mono text-cyan-300">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span>Jelenlegi jelenet: választás folyamatban...</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Tekints vissza a képernyőre!</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Összesen: <strong className="text-slate-200">{storyLog.length}</strong> szakasz,{' '}
              <strong className="text-amber-300">{choicesCount}</strong> döntés
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/50 px-2 py-1 rounded">
                <span className="text-red-300 text-[11px]">Valóban törlöd az előzményeket?</span>
                <button
                  onClick={() => {
                    soundEngine.playDiscovery();
                    clearStoryLog();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Igen
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                >
                  Mégse
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-[11px]"
                title="Napló előzmények visszaállítása az aktuális pontra"
              >
                Napló alaphelyzet
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Vissza a Játékhoz
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
