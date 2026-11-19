import React, { useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Layers, Sun, Combine, CheckCircle2, X, Volume2 } from 'lucide-react';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';
import { ECHO_CORE_SECRETS } from '../data/finalRevelationData';

interface ArtifactInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArtifactInspectorModal: React.FC<ArtifactInspectorModalProps> = ({ isOpen, onClose }) => {
  const {
    artifacts,
    activeArtifactId,
    setActiveArtifactId,
    inspectArtifactPart,
    disassembleArtifact,
    uvScanArtifact,
    combineArtifacts,
    abilities,
    spiralState,
    markEchoAudioListened,
  } = useGame();

  const [rotationDeg, setRotationDeg] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [combineFeedback, setCombineFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const selected =
    artifacts.find((a) => a.id === activeArtifactId && a.isUnlocked) ||
    artifacts.find((a) => a.isUnlocked) ||
    artifacts[0];

  const spiralDecodeLevel = abilities.find((a) => a.id === 'ab_spiral_decode')?.level || 0;

  const handleCombine = () => {
    if (!slotA || !slotB || slotA === slotB) {
      setCombineFeedback('Válassz két különböző megszerzett tárgyat az összeillesztéshez!');
      return;
    }
    const res = combineArtifacts(slotA, slotB);
    setCombineFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 bg-slate-950/70">
          <div>
            <h2 className="text-base font-cinzel font-bold tracking-wider text-cyan-300 uppercase">
              TÁRGYVIZSGÁLÓ & MŰHELY · 3D FORGATÁS & SZÉTSZERELÉS
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Megszerzett tárgyak: {artifacts.filter((a) => a.isUnlocked).length}/{artifacts.length}
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
          {/* Left Artifact List + Combine Bench */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              {artifacts.map((art) => {
                const isActive = selected.id === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    disabled={!art.isUnlocked}
                    onClick={() => {
                      setActiveArtifactId(art.id);
                      setRotationDeg(0);
                      setZoom(1);
                      soundEngine.playUiClick();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      !art.isUnlocked
                        ? 'border-slate-800/60 bg-slate-950/30 opacity-45 cursor-not-allowed'
                        : isActive
                        ? 'border-cyan-400 bg-cyan-950/35 cursor-pointer'
                        : 'border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400">{art.isUnlocked ? art.spiralGlyph : 'ZÁROLT'}</span>
                      <span>{art.symbol}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100 mt-0.5">
                      {art.isUnlocked ? art.name : 'Ismeretlen expedíciós tárgy'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {art.isUnlocked ? art.origin : 'Keresd a georadarral vagy jelenetekben'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2-Slot Artifact Combination Bench */}
            <div className="bg-slate-950/80 border border-cyan-500/25 rounded-xl p-3 space-y-3">
              <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Combine className="w-3.5 h-3.5" />
                <span>Objektum-kombináló Pad</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={slotA || ''}
                  onChange={(e) => setSlotA(e.target.value || null)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-mono text-slate-200"
                >
                  <option value="">1. Tárgy...</option>
                  {artifacts.filter((a) => a.isUnlocked).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select
                  value={slotB || ''}
                  onChange={(e) => setSlotB(e.target.value || null)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-mono text-slate-200"
                >
                  <option value="">2. Tárgy...</option>
                  {artifacts.filter((a) => a.isUnlocked).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleCombine}
                className="w-full py-2 min-h-[40px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-xs font-mono font-bold text-amber-200 cursor-pointer"
              >
                Tárgyak Összeillesztése
              </button>
              {combineFeedback && (
                <p className="text-[11px] font-mono text-cyan-200 leading-relaxed">{combineFeedback}</p>
              )}
            </div>
          </div>

          {/* Right Inspection Stage */}
          <div className="lg:col-span-8 overflow-y-auto p-5 bg-slate-950/40 space-y-5">
            {selected.isUnlocked ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono text-cyan-400">{selected.origin}</div>
                    <h3 className="text-xl font-cinzel font-bold text-slate-100">{selected.name}</h3>
                    <p className="text-xs text-slate-400">{selected.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => disassembleArtifact(selected.id)}
                      className={`px-3 py-2 min-h-[40px] rounded-lg border text-xs font-mono cursor-pointer inline-flex items-center gap-1.5 ${
                        selected.isDisassembled
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-400/50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{selected.isDisassembled ? 'Összeszerelés' : 'Rétegek Szétszedése'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => uvScanArtifact(selected.id)}
                      className={`px-3 py-2 min-h-[40px] rounded-lg border text-xs font-mono cursor-pointer inline-flex items-center gap-1.5 ${
                        selected.isUvScanned
                          ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-purple-400/50'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>UV Spektrálfény</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Rotatable & Zoomable Visualizer */}
                <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4">
                  <div className="h-56 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="transition-transform duration-200 flex items-center justify-center"
                      style={{
                        transform: `rotate(${rotationDeg}deg) scale(${zoom})`,
                      }}
                    >
                      <svg viewBox="0 0 220 220" className="w-44 h-44">
                        <circle
                          cx="110"
                          cy="110"
                          r={selected.isDisassembled ? 92 : 76}
                          fill="none"
                          stroke={selected.isUvScanned ? '#c084fc' : '#22d3ee'}
                          strokeWidth="1.5"
                          strokeDasharray="8 4"
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="110,25 182,70 182,150 110,195 38,150 38,70"
                          fill="rgba(6, 182, 212, 0.08)"
                          stroke={selected.isUvScanned ? '#e879f9' : '#38bdf8'}
                          strokeWidth="2"
                        />
                        <circle
                          cx="110"
                          cy="110"
                          r={selected.isDisassembled ? 48 : 34}
                          fill="rgba(15, 23, 42, 0.9)"
                          stroke="#34d399"
                          strokeWidth="1.5"
                        />
                        <text x="110" y="106" textAnchor="middle" fill="#e2e8f0" fontSize="28">
                          {selected.symbol}
                        </text>
                        <text x="110" y="128" textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="monospace">
                          {selected.spiralGlyph}
                        </text>
                      </svg>
                    </div>

                    {selected.isUvScanned && (
                      <div className="absolute bottom-2 inset-x-3 bg-purple-950/90 border border-purple-400/50 rounded-lg px-3 py-2 text-xs font-mono text-purple-200 text-center">
                        {selected.uvHiddenText}
                      </div>
                    )}
                  </div>

                  {/* Rotation & Zoom Controls */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    <label className="flex items-center gap-2 flex-1 min-w-[180px]">
                      <RotateCw className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-400">Forgatás:</span>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotationDeg}
                        onChange={(e) => setRotationDeg(Number(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-cyan-300 tabular-nums w-10">{rotationDeg}°</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.2).toFixed(1))))}
                        className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-cyan-400 cursor-pointer"
                        title="Kicsinyítés"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="tabular-nums text-cyan-300 w-10 text-center">{zoom}x</span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(1))))}
                        className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-cyan-400 cursor-pointer"
                        title="Nagyítás"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  {selected.description}
                </p>

                {spiralDecodeLevel > 0 && (
                  <div className="text-xs font-mono text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3">
                    Spirál-dekódolás ({spiralDecodeLevel}. szint): A véset ({selected.spiralGlyph}) koordináta-megerősítést hordoz a mélykamra felé.
                  </div>
                )}

                {/* Echo Core World Mutations on this Artifact */}
                {(() => {
                  const awakenedCores = ECHO_CORE_SECRETS.filter(
                    (s) =>
                      s.worldMutation.artifactId === selected.id &&
                      spiralState.worldState.collectedNineEchoIds.includes(s.echoCoreId)
                  );
                  if (awakenedCores.length === 0) return null;
                  return (
                    <div className="space-y-2.5">
                      {awakenedCores.map((s) => (
                        <div
                          key={s.echoCoreId}
                          className="rounded-xl border border-amber-500/45 bg-amber-950/20 p-3.5 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-amber-300 font-bold uppercase">
                              [Visszhang-mag Rezonancia] · {s.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => markEchoAudioListened(s.echoCoreId, s.audioFreqHz)}
                              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{s.audioMessageTitle}</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-100 leading-relaxed">
                            {s.worldMutation.artifactAwakenedNote}
                          </p>
                          <p className="text-[11px] font-mono text-amber-200/85 italic">
                            „{s.audioMessageText}”
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Layered Disassembly Parts */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                    Belső Rétegek & Komponensek ({selected.parts.filter((p) => p.isInspected).length}/{selected.parts.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selected.parts.map((part) => (
                      <div
                        key={part.id}
                        className={`p-3 rounded-xl border transition-colors ${
                          part.isInspected
                            ? 'border-emerald-500/40 bg-emerald-950/20'
                            : 'border-slate-800 bg-slate-950/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                          <span>{part.layer}. Réteg</span>
                          {part.isInspected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-xs font-semibold text-slate-100">{part.name}</div>
                        <p className="text-[11px] text-slate-400 mt-1">{part.description}</p>
                        {part.isInspected ? (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-300">
                            Nyom: {part.clueText}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => inspectArtifactPart(selected.id, part.id)}
                            className="mt-2.5 w-full py-1.5 min-h-[36px] rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-[11px] font-mono text-cyan-200 cursor-pointer"
                          >
                            Réteg Vizsgálata
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                Ez a tárgy még nincs megszerezve ebben az időhurokban.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
