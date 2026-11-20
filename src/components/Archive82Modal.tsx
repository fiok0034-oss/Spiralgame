import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Volume2,
  MapPin,
  Users,
  KeyRound,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Link2,
  Newspaper,
  X,
  Award,
  Lightbulb,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { MemoryFragment, PlayerTheory } from '../types/game';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';
import { aiVoiceService, SubtitleState } from '../audio/aiVoiceService';
import { DailyArchiveNewsTab } from './DailyArchiveNewsTab';
import { ArchiveNewsTicker } from './ArchiveNewsTicker';

interface Archive82ModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories?: MemoryFragment[];
  onSubtitleChange?: (sub: SubtitleState | null) => void;
}

type ArchiveTab = 'dossiers' | 'evidence' | 'audio' | 'coords' | 'database' | 'secrets' | 'news';

const CONFIDENCE_META: Record<PlayerTheory['confidence'], { label: string; style: string }> = {
  fact: { label: 'Tényként kezelt', style: 'border-emerald-500/45 bg-emerald-950/25 text-emerald-300' },
  theory: { label: 'Aktív hipotézis', style: 'border-cyan-500/45 bg-cyan-950/25 text-cyan-200' },
  false: { label: 'Elvetett nyom', style: 'border-rose-500/40 bg-rose-950/20 text-rose-300' },
  unsolved: { label: 'Nyitott kérdés', style: 'border-amber-500/40 bg-amber-950/20 text-amber-200' },
};

export const Archive82Modal: React.FC<Archive82ModalProps> = ({
  isOpen,
  onClose,
  memories: propMemories,
  onSubtitleChange,
}) => {
  const {
    memories: ctxMemories,
    evidence,
    deductions,
    personnel,
    expeditions,
    secrets,
    radioChannels,
    spiralState,
    analyzeEvidence,
    solveDeduction,
    createPlayerTheory,
    updatePlayerTheoryConfidence,
    deletePlayerTheory,
    investigatorRank,
    nextInvestigatorRank,
    investigatorScore,
    unlockedSecretArchiveEvents,
  } = useGame();

  const memories = propMemories || ctxMemories;
  const [activeTab, setActiveTab] = useState<ArchiveTab>('dossiers');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(
    memories.find((m) => m.isUnlocked)?.id || null
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    evidence.find((e) => e.isUnlocked)?.id || null
  );
  const [evidenceZoom, setEvidenceZoom] = useState<number>(1);
  const [linkA, setLinkA] = useState<string | null>(null);
  const [linkB, setLinkB] = useState<string | null>(null);
  const [deductionMsg, setDeductionMsg] = useState<string | null>(null);

  // PlayerTheory builder state
  const [theoryTitle, setTheoryTitle] = useState('');
  const [theoryEvidenceIds, setTheoryEvidenceIds] = useState<string[]>([]);
  const [theorySupporting, setTheorySupporting] = useState('');
  const [theoryContradicting, setTheoryContradicting] = useState('');
  const [theoryConfidence, setTheoryConfidence] = useState<PlayerTheory['confidence']>('theory');
  const [playingAudioFreq, setPlayingAudioFreq] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPlayingAudioFreq(null);
      return;
    }
    if (!selectedMemoryId || !memories.some((m) => m.id === selectedMemoryId && m.isUnlocked)) {
      setSelectedMemoryId(memories.find((m) => m.isUnlocked)?.id || null);
    }
    if (!selectedEvidenceId || !evidence.some((e) => e.id === selectedEvidenceId && e.isUnlocked)) {
      setSelectedEvidenceId(evidence.find((e) => e.isUnlocked)?.id || null);
    }
  }, [isOpen, memories, evidence, selectedMemoryId, selectedEvidenceId]);

  if (!isOpen) return null;

  const selectedMemory =
    memories.find((m) => m.id === selectedMemoryId && m.isUnlocked) ||
    memories.find((m) => m.isUnlocked) ||
    null;

  const categories = [
    { id: 'all', label: 'Összes Dosszié' },
    { id: 'antarktisz', label: 'Antarktisz 82°' },
    { id: 'tudat', label: 'Tudati Rétegek' },
    { id: 'idotorzulas', label: 'Időanomáliák' },
    { id: 'orzo', label: 'Őrzők Krónikája' },
    { id: 'vegtelen', label: 'A Végtelen' },
  ];

  const filteredMemories = memories.filter((m) =>
    selectedCategory === 'all' ? true : m.category === selectedCategory
  );

  const unlockedCount = memories.filter((m) => m.isUnlocked).length;
  const selectedEv = evidence.find((e) => e.id === selectedEvidenceId) || evidence[0];
  const unlockedEvList = evidence.filter((e) => e.isUnlocked);
  const playerTheories = spiralState.worldState.playerTheories || [];
  const triggeredEventsCount = unlockedSecretArchiveEvents.filter((e) => e.isUnlocked).length;

  const handleSolveLink = () => {
    if (!linkA || !linkB || linkA === linkB) {
      setDeductionMsg('Válassz két különböző feloldott bizonyítékot az összefüggés kereséséhez!');
      return;
    }
    const res = solveDeduction(linkA, linkB);
    setDeductionMsg(res.message);
  };

  const toggleTheoryEvidence = (id: string) => {
    setTheoryEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(0, 5)
    );
  };

  const handleSaveTheory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoryTitle.trim()) return;
    createPlayerTheory({
      title: theoryTitle,
      connectedEvidenceIds: theoryEvidenceIds,
      supportingNotes: theorySupporting,
      contradictingNotes: theoryContradicting,
      confidence: theoryConfidence,
    });
    setTheoryTitle('');
    setTheoryEvidenceIds([]);
    setTheorySupporting('');
    setTheoryContradicting('');
    setTheoryConfidence('theory');
  };

  const handlePlayChannelAudio = (freq: number, type: string, label: string, content: string) => {
    if (type === 'morse') {
      soundEngine.playMorseBeep(true);
    } else {
      soundEngine.playCrystalResonance(freq > 200 ? 432 : 528);
    }

    if (playingAudioFreq === freq) {
      aiVoiceService.stop();
      setPlayingAudioFreq(null);
      onSubtitleChange?.(null);
      return;
    }

    setPlayingAudioFreq(freq);
    void aiVoiceService.playLine({
      lineId: `archive_radio_${freq}`,
      speakerLabel: `${freq.toFixed(1)} MHz · ${label}`,
      persona: freq === 142.8 ? 'lena' : freq >= 432 ? 'infinite' : 'narrator',
      channel: 'dialogue',
      fxMode: freq >= 432 ? 'infinite_resonance' : 'radio1983',
      text: content,
      onSubtitle: (sub) => {
        onSubtitleChange?.(sub);
        if (!sub.isActive) setPlayingAudioFreq(null);
      },
      onComplete: () => setPlayingAudioFreq(null),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-5">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header with Investigator Rank */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 px-5 py-3.5 bg-slate-950/75">
          <div className="space-y-1">
            <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
              ARCHÍV-82 · NYOMOZÓI ÉS EMLÉKEZETI KÖZPONT
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Dossziék: {unlockedCount}/{memories.length}</span>
              <span aria-hidden="true">·</span>
              <span>Bizonyítékok: {unlockedEvList.length}/{evidence.length}</span>
              <span aria-hidden="true">·</span>
              <span>Következtetések: {deductions.filter((d) => d.isSolved).length}/{deductions.length}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {investigatorRank.level}. Szint: {investigatorRank.title}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nextInvestigatorRank && (
              <div className="hidden lg:block text-right text-[11px] font-mono text-slate-400 pr-2 border-r border-slate-800">
                <div className="text-cyan-300">
                  Következő rang: {nextInvestigatorRank.title} ({investigatorScore}/{nextInvestigatorRank.minSolved})
                </div>
                <div className="truncate max-w-xs">{investigatorRank.perk}</div>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white px-3 py-2 min-h-[40px] text-xs font-mono border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Bezárás</span>
            </button>
          </div>
        </div>

        {/* Top Module Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/50 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          {[
            { id: 'dossiers', label: 'Dossziék', icon: FileText },
            { id: 'evidence', label: `Bizonyítéktábla (${playerTheories.length})`, icon: Search },
            { id: 'audio', label: 'Hangarchívum', icon: Volume2 },
            { id: 'coords', label: 'Koordináták', icon: MapPin },
            { id: 'database', label: 'Személy- & Expedíciós DB', icon: Users },
            { id: 'secrets', label: `Titkok & Események (${triggeredEventsCount}/9)`, icon: KeyRound },
            { id: 'news', label: 'Napi Archív Hírek', icon: Newspaper },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as ArchiveTab);
                  soundEngine.playUiClick();
                }}
                className={`px-3 py-2 min-h-[38px] rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Periodic Arctic Exploration & Science News Ticker */}
        <ArchiveNewsTicker onOpenNewsTab={() => setActiveTab('news')} />

        {/* TAB 1: DOSSIERS */}
        {activeTab === 'dossiers' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-950/30 border-b border-slate-800 overflow-x-auto text-xs font-mono">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    soundEngine.playUiClick();
                  }}
                  className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-4 space-y-2">
                {filteredMemories.map((mem) => {
                  const isSelected = selectedMemory?.id === mem.id;
                  return (
                    <div
                      key={mem.id}
                      onClick={() => {
                        if (mem.isUnlocked) {
                          setSelectedMemoryId(mem.id);
                          soundEngine.playUiClick();
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all ${
                        !mem.isUnlocked
                          ? 'border-slate-800/60 bg-slate-950/30 opacity-45 cursor-not-allowed'
                          : isSelected
                          ? 'border-cyan-400 bg-cyan-950/35 cursor-pointer'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-400">{mem.isUnlocked ? mem.date : 'TITKOSÍTOTT'}</span>
                        <span className="text-cyan-400/80">{mem.isUnlocked ? `REZ: ${mem.resonanceLevel}` : 'ZÁROLT'}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {mem.isUnlocked ? mem.title : 'Zárolt emlékfragmentum'}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {mem.isUnlocked ? mem.preview : 'Fedezd fel a választásaid és minijátékok során.'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="md:col-span-7 overflow-y-auto p-6 bg-slate-950/30 space-y-4">
                {selectedMemory && selectedMemory.isUnlocked ? (
                  <>
                    <div className="border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
                        <span>ARCHÍV-82 DOKUMENTUM</span>
                        {selectedMemory.coordinates && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-300">{selectedMemory.coordinates}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-xl font-cinzel font-bold text-slate-100 mt-1">{selectedMemory.title}</h3>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{selectedMemory.date}</div>
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      {selectedMemory.fullText}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                    Válassz egy feloldott dossziét a listából.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE BOARD, DEDUCTIONS & CUSTOM THEORIES */}
        {activeTab === 'evidence' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={!ev.isUnlocked}
                    onClick={() => {
                      setSelectedEvidenceId(ev.id);
                      setEvidenceZoom(1);
                      soundEngine.playUiClick();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      !ev.isUnlocked
                        ? 'border-slate-800/50 bg-slate-950/20 opacity-45 cursor-not-allowed'
                        : selectedEv.id === ev.id
                        ? 'border-cyan-400 bg-cyan-950/35 cursor-pointer'
                        : 'border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 uppercase">{ev.type} · {ev.date}</span>
                      {ev.isAnalyzed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-xs font-semibold text-slate-100 mt-0.5">
                      {ev.isUnlocked ? ev.title : 'Zárolt bizonyíték'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Manual Deduction Linker */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Összefüggés-kereső & Következtetés</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={linkA || ''}
                    onChange={(e) => setLinkA(e.target.value || null)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-mono text-slate-200"
                  >
                    <option value="">1. Bizonyíték...</option>
                    {unlockedEvList.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  <select
                    value={linkB || ''}
                    onChange={(e) => setLinkB(e.target.value || null)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-mono text-slate-200"
                  >
                    <option value="">2. Bizonyíték...</option>
                    {unlockedEvList.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSolveLink}
                  className="w-full py-2 min-h-[40px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-xs font-mono font-bold text-amber-200 cursor-pointer"
                >
                  Következtetés Ellenőrzése
                </button>
                {deductionMsg && <p className="text-xs font-mono text-cyan-200 leading-relaxed">{deductionMsg}</p>}
              </div>
            </div>

            <div className="lg:col-span-7 overflow-y-auto p-5 bg-slate-950/30 space-y-5">
              {selectedEv && selectedEv.isUnlocked ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs font-mono text-cyan-400 uppercase">{selectedEv.source} · {selectedEv.date}</div>
                      <h3 className="text-lg font-cinzel font-bold text-slate-100 mt-0.5">{selectedEv.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEvidenceZoom((z) => (z === 1 ? 1.2 : 1))}
                        className="px-2.5 py-1.5 min-h-[36px] rounded border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer inline-flex items-center gap-1"
                      >
                        {evidenceZoom > 1 ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                        <span>{evidenceZoom > 1 ? '1x' : 'Nagyítás'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => analyzeEvidence(selectedEv.id)}
                        className="px-3 py-1.5 min-h-[36px] rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono text-cyan-200 cursor-pointer"
                      >
                        {selectedEv.isAnalyzed
                          ? '✓ Elemezve'
                          : investigatorRank.level >= 3
                          ? 'Részletes Elemzés (+25 Rez.)'
                          : 'Részletes Elemzés'}
                      </button>
                    </div>
                  </div>
                  <div
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-transform origin-top-left"
                    style={{ transform: `scale(${evidenceZoom})` }}
                  >
                    <p className="text-xs font-mono text-slate-400 mb-2">{selectedEv.summary}</p>
                    <p className="text-sm text-slate-100 leading-relaxed">{selectedEv.fullContent}</p>
                    {selectedEv.isAnalyzed && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-amber-300">
                        {selectedEv.hiddenAnnotation}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs font-mono text-slate-500">Válassz egy feloldott bizonyítékot.</div>
              )}

              {/* Solved Deductions List */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-mono uppercase text-emerald-300">
                  Igazolt Következtetések ({deductions.filter((d) => d.isSolved).length}/{deductions.length})
                </h4>
                {deductions.filter((d) => d.isSolved).map((d) => (
                  <div key={d.id} className="p-3 rounded-xl border border-emerald-500/35 bg-emerald-950/20 text-xs">
                    <div className="font-mono font-bold text-emerald-300">{d.title}</div>
                    <p className="text-slate-200 mt-1 leading-relaxed">{d.conclusion}</p>
                  </div>
                ))}
              </div>

              {/* Player Custom Hypothesis Workbench */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-cyan-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Saját Elmélet Műhely ({playerTheories.length})</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Rang pontszám: {investigatorScore}
                  </span>
                </div>

                <form onSubmit={handleSaveTheory} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <input
                    type="text"
                    value={theoryTitle}
                    onChange={(e) => setTheoryTitle(e.target.value)}
                    placeholder="Elmélet címe (pl. Miért egyezik Levente EEG-je a 82.0 MHz-cel?)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500"
                  />
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-400">
                      Kapcsolódó bizonyítékok megjelölése (max. 5):
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {unlockedEvList.map((ev) => {
                        const checked = theoryEvidenceIds.includes(ev.id);
                        return (
                          <button
                            key={`th_ev_${ev.id}`}
                            type="button"
                            onClick={() => toggleTheoryEvidence(ev.id)}
                            className={`px-2 py-1 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                              checked
                                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {ev.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      value={theorySupporting}
                      onChange={(e) => setTheorySupporting(e.target.value)}
                      placeholder="Megerősítő nyomok..."
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
                    />
                    <textarea
                      rows={2}
                      value={theoryContradicting}
                      onChange={(e) => setTheoryContradicting(e.target.value)}
                      placeholder="Ellentmondások / nyitott kérdések..."
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={theoryConfidence}
                      onChange={(e) => setTheoryConfidence(e.target.value as PlayerTheory['confidence'])}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200"
                    >
                      <option value="theory">Aktív hipotézis</option>
                      <option value="fact">Tényként kezelt</option>
                      <option value="unsolved">Nyitott kérdés</option>
                      <option value="false">Elvetett nyom</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!theoryTitle.trim()}
                      className="px-4 py-2 min-h-[36px] rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-mono font-bold cursor-pointer"
                    >
                      Elmélet Rögzítése
                    </button>
                  </div>
                </form>

                {playerTheories.length > 0 && (
                  <div className="space-y-2">
                    {playerTheories.map((t) => {
                      const meta = CONFIDENCE_META[t.confidence];
                      return (
                        <div key={t.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/75 space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-cinzel font-bold text-slate-100">{t.title}</div>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={t.confidence}
                                onChange={(e) =>
                                  updatePlayerTheoryConfidence(t.id, e.target.value as PlayerTheory['confidence'])
                                }
                                className={`px-2 py-1 rounded border text-[11px] font-mono ${meta.style}`}
                              >
                                <option value="theory">Aktív hipotézis</option>
                                <option value="fact">Tényként kezelt</option>
                                <option value="unsolved">Nyitott kérdés</option>
                                <option value="false">Elvetett nyom</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => deletePlayerTheory(t.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 cursor-pointer"
                                title="Elmélet törlése"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {t.connectedEvidenceIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {t.connectedEvidenceIds.map((evId) => {
                                const evObj = evidence.find((e) => e.id === evId);
                                return (
                                  <span key={evId} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                                    {evObj?.title || evId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {(t.supportingNotes || t.contradictingNotes) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                              {t.supportingNotes && (
                                <div>
                                  <span className="font-mono text-emerald-400">Mellette:</span> {t.supportingNotes}
                                </div>
                              )}
                              {t.contradictingNotes && (
                                <div>
                                  <span className="font-mono text-amber-300">Kérdéses:</span> {t.contradictingNotes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO ARCHIVE */}
        {activeTab === 'audio' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-xs font-mono text-slate-400">
              A jégből, a rádióegységről és Dr. Lena laborjából rögzített hullámformák:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {radioChannels.map((ch) => (
                <div
                  key={ch.frequency}
                  className={`p-4 rounded-xl border ${
                    ch.discovered
                      ? 'border-cyan-500/35 bg-slate-950/80'
                      : 'border-slate-800 bg-slate-950/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono gap-2">
                    <span className="text-cyan-300 font-bold">{ch.frequency.toFixed(1)} MHz · {ch.label}</span>
                    <button
                      type="button"
                      disabled={!ch.discovered}
                      onClick={() => handlePlayChannelAudio(ch.frequency, ch.type, ch.label, ch.content)}
                      className={`px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer inline-flex items-center gap-1 ${
                        playingAudioFreq === ch.frequency
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-cyan-200'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{playingAudioFreq === ch.frequency ? 'Leállítás' : 'Lejátszás (AI Hang)'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {ch.discovered ? ch.content : 'Frekvencia még nem lett bemérve a Rádióegységgel.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COORDINATE SYSTEM */}
        {activeTab === 'coords' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-xs font-mono text-slate-400">
              Antarktiszi Szektor 82°S · Aktív anomália-háromszögelési pontok:
            </p>
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4 flex flex-col md:flex-row gap-5 items-center">
              <svg viewBox="0 0 320 200" className="w-full max-w-sm bg-[#040914] rounded-xl border border-slate-800">
                <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(56,189,248,0.15)" />
                <line x1="160" y1="0" x2="160" y2="200" stroke="rgba(56,189,248,0.15)" />
                <circle cx="160" cy="100" r="65" fill="none" stroke="rgba(34,211,238,0.2)" strokeDasharray="4 4" />
                <circle cx="160" cy="100" r="5" fill="#22d3ee" />
                <text x="168" y="96" fill="#22d3ee" fontSize="9" fontFamily="monospace">Δ–T1 (82°16’S)</text>
                <circle cx="220" cy="135" r="4" fill="#fbbf24" />
                <text x="195" y="152" fill="#fbbf24" fontSize="9" fontFamily="monospace">82°18’S Láda</text>
                <circle cx="95" cy="70" r="4" fill="#34d399" />
                <text x="65" y="60" fill="#34d399" fontSize="9" fontFamily="monospace">Bázisállomás</text>
              </svg>
              <div className="space-y-2 flex-1 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-cyan-300 font-bold">82°16’S, 36°01’E (-3200m)</div>
                  <div className="text-slate-400 mt-0.5">Fő subglaciális spirálkamra és Δ–T1 obeliszk</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-amber-300 font-bold">82°18’S, 36°09’E (-1850m)</div>
                  <div className="text-slate-400 mt-0.5">1959-es Előőrs sárgaréz kronométer-szektora</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERSONNEL & EXPEDITIONS DB */}
        {activeTab === 'database' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300">Személyi Akták</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personnel.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border ${
                      p.isUnlocked ? 'border-slate-800 bg-slate-950/80' : 'border-slate-800/50 bg-slate-950/30 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] font-mono text-cyan-400">
                      <span>{p.clearance}</span>
                      <span>{p.expedition}</span>
                    </div>
                    <div className="text-sm font-cinzel font-bold text-slate-100 mt-1">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.role} · {p.status}</div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {p.isUnlocked ? p.bio : 'Titkosított akta — vizsgáld meg az 1959-es nyomokat az Archívumban.'}
                    </p>
                    {p.isUnlocked && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-amber-300">
                        Megjegyzés: {p.secretNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300">Expedíciós Krónika</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {expeditions.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1.5">
                    <div className="text-xs font-mono text-cyan-400 font-bold">{exp.code} ({exp.year})</div>
                    <div className="text-xs text-slate-400">Vezető: {exp.leader}</div>
                    <p className="text-xs text-slate-200">{exp.outcome}</p>
                    <div className="text-[11px] font-mono text-amber-300 pt-1">{exp.anomalyReading}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECRETS, ARCHIVE EVENTS & SPIRAL LANGUAGE */}
        {activeTab === 'secrets' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Secret Archive Events */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ARCHÍV-82 Rendszeranomáliák & Titkos Események ({triggeredEventsCount}/{unlockedSecretArchiveEvents.length})</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Következtetések megoldásával aktiválódnak
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {unlockedSecretArchiveEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      evt.isUnlocked
                        ? 'border-amber-400/50 bg-amber-950/20'
                        : 'border-slate-800 bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="font-mono font-bold text-[11px] text-amber-300 flex items-center justify-between gap-2">
                      <span>{evt.title}</span>
                      <span>{evt.isUnlocked ? '✓ Észlelve' : 'Zárolt'}</span>
                    </div>
                    {evt.isUnlocked ? (
                      <>
                        <p className="text-slate-200 leading-relaxed">{evt.message}</p>
                        <div className="text-[11px] font-mono text-cyan-300 pt-1 border-t border-amber-500/20 italic">
                          {evt.loreRevelation}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] font-mono text-slate-500">
                        Kapcsold össze a megfelelő bizonyítékokat a Bizonyítéktáblán.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Layered Secrets */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <p className="text-xs font-mono text-slate-400">
                Felfedezett többrétegű titkok és a Spirál ősi szókincse ({secrets.filter((s) => s.isUnlocked).length}/{secrets.length}):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {secrets.map((sec) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-xl border ${
                      sec.isUnlocked
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400">{sec.layer}. Réteg Titka</span>
                      <span className={sec.isUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                        {sec.isUnlocked ? '✓ Feltárva' : 'Rejtett'}
                      </span>
                    </div>
                    <h4 className="text-sm font-cinzel font-bold text-slate-100 mt-1">{sec.title}</h4>
                    {sec.isUnlocked ? (
                      <>
                        <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">{sec.loreText}</p>
                        {sec.spiralWord && (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-xs font-mono text-amber-300">
                            Spirál szó: <span className="font-bold">{sec.spiralWord}</span> — „{sec.spiralMeaning}”
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 mt-1.5">Nyom: {sec.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DAILY ARCHIVE NEWS (SEARCH GROUNDING) */}
        {activeTab === 'news' && <DailyArchiveNewsTab />}
      </div>
    </div>
  );
};
