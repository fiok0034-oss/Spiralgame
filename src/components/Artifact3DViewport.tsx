import React, { useEffect, useRef, useState } from 'react';
import {
  Artifact3DStageController,
  ArtifactPartInfo,
  mountArtifact3DInspectorStage,
} from '../prototypes/three/Artifact3DInspectorStage';
import { isWebGLAvailable } from '../prototypes/three/threeUtils';
import { spatialSoundscapeEngine } from '../audio/SpatialSoundscapeEngine';

interface Artifact3DViewportProps {
  artifactName: string;
  symbol: string;
  spiralGlyph: string;
  isDisassembled: boolean;
  isUvScanned: boolean;
  uvHiddenText: string;
  reducedMotion: boolean;
  onPartClicked?: (info: ArtifactPartInfo) => void;
}

export const Artifact3DViewport: React.FC<Artifact3DViewportProps> = ({
  artifactName,
  symbol,
  spiralGlyph,
  isDisassembled,
  isUvScanned,
  uvHiddenText,
  reducedMotion,
  onPartClicked,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<Artifact3DStageController | null>(null);
  const [explodeSlider, setExplodeSlider] = useState(isDisassembled ? 1 : 0);
  const [selectedPart, setSelectedPart] = useState<ArtifactPartInfo | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Sync slider when disassembly toggle button in header changes
  useEffect(() => {
    setExplodeSlider(isDisassembled ? 1 : 0);
  }, [isDisassembled]);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const ctrl = mountArtifact3DInspectorStage(container, {
      explodeAmount: explodeSlider,
      uvActive: isUvScanned,
      reducedMotion,
      onSelectPart: (info) => {
        setSelectedPart(info);
        spatialSoundscapeEngine.playCrystalChime(528, 0);
        onPartClicked?.(info);
      },
      onContextLost: () => setWebglFailed(true),
    });

    controllerRef.current = ctrl;
    return () => {
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.updateOptions({
      explodeAmount: explodeSlider,
      uvActive: isUvScanned,
      reducedMotion,
    });
  }, [explodeSlider, isUvScanned, reducedMotion]);

  if (webglFailed) {
    return (
      <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 text-center space-y-2">
        <div className="text-3xl">{symbol}</div>
        <div className="text-xs font-mono text-cyan-300">{spiralGlyph} · {artifactName}</div>
        {isUvScanned && (
          <div className="text-xs font-mono text-purple-200 bg-purple-950/70 border border-purple-400/40 rounded-lg px-3 py-2">
            {uvHiddenText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl overflow-hidden">
      <div className="relative h-64 sm:h-72 w-full">
        <div ref={containerRef} className="w-full h-full" />

        {isUvScanned && (
          <div className="pointer-events-none absolute bottom-3 inset-x-4 bg-[#1a0b2e]/95 border border-purple-400/50 rounded-lg px-3 py-2 text-xs font-mono text-purple-200 text-center">
            {uvHiddenText}
          </div>
        )}

        {selectedPart && !isUvScanned && (
          <div className="pointer-events-none absolute top-3 left-3 max-w-sm bg-[#060c19]/95 border border-cyan-500/40 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-200">
            <span className="text-cyan-300 font-semibold">{selectedPart.name}: </span>
            <span>{selectedPart.note}</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono bg-[#070b16]">
        <label className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <span className="text-slate-300 whitespace-nowrap">3D Rétegek szétnyitása:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explodeSlider}
            onChange={(e) => setExplodeSlider(Number(e.target.value))}
            className="flex-1 accent-cyan-400 cursor-pointer"
          />
          <span className="text-cyan-300 tabular-nums w-9 text-right">
            {Math.round(explodeSlider * 100)}%
          </span>
        </label>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Forgatás: húzd · Zoom: görgetés · Kattints egy rétegre</span>
          <button
            type="button"
            onClick={() => controllerRef.current?.resetCamera()}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            Alapállapot
          </button>
        </div>
      </div>
    </div>
  );
};
