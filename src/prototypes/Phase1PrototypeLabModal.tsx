import React, { useEffect, useRef, useState } from 'react';
import { X, Volume2, VolumeX, RotateCcw, ChevronDown, ChevronUp, Play, Square } from 'lucide-react';
import {
  mountAntarcticOutpostStage,
  AntarcticStageController,
} from './three/AntarcticOutpostStage';
import {
  mountArchive82DeskStage,
  ArchiveDeskItemId,
  ArchiveDeskStageController,
} from './three/Archive82DeskStage';
import {
  mountArtifact3DInspectorStage,
  Artifact3DStageController,
  ArtifactPartInfo,
} from './three/Artifact3DInspectorStage';
import { isWebGLAvailable } from './three/threeUtils';
import { aiVoiceService, SubtitleState } from '../audio/aiVoiceService';
import { spatialSoundscapeEngine } from '../audio/SpatialSoundscapeEngine';
import { TTS_ENABLED } from '../config/featureFlags';

export type PrototypeId =
  | 'proto1_antarctica_3d'
  | 'proto2_archive_room_3d'
  | 'proto3_artifact_3d'
  | 'proto4_ai_narration'
  | 'proto5_lena_radio'
  | 'proto6_infinite_voice'
  | 'proto7_tactile_sfx'
  | 'proto8_spatial_soundscape';

interface PrototypeMeta {
  id: PrototypeId;
  shortLabel: string;
  title: string;
  stageKind: 'antarctic' | 'archive' | 'artifact';
  summary: string;
}

const PROTOTYPES: PrototypeMeta[] = [
  {
    id: 'proto1_antarctica_3d',
    shortLabel: '1. Antarktisz 3D',
    title: '1. Antarktiszi Térbeli Környezet & Δ–T1 Monolit',
    stageKind: 'antarctic',
    summary: 'Hómező horizont-köddel, 4 részes Δ–T1 monolit, meteorológiai árbóc és katabatikus hóvihar.',
  },
  {
    id: 'proto2_archive_room_3d',
    shortLabel: '2. ARCHÍV-82 Szoba',
    title: '2. ARCHÍV-82 Kutatóasztal (1982)',
    stageKind: 'archive',
    summary: 'Kattintható CRT terminál, forgó 1983-as mágnesszalag-felvevő és titkosított aktaköteg.',
  },
  {
    id: 'proto3_artifact_3d',
    shortLabel: '3. 3D Lelet',
    title: '3. Valódi 3D Leletvizsgáló: Fagyott Spirál-lemez',
    stageKind: 'artifact',
    summary: '360°-os forgatás, 6 különálló PBR réteg robbantott nézete és UV-fényes rejtett felirat.',
  },
  {
    id: 'proto4_ai_narration',
    shortLabel: '4. AI Narráció',
    title: '4. Magyar Filmszerű AI Narráció',
    stageKind: 'antarctic',
    summary: 'Gemini 3.8 Flash TTS Voice Design mély magyar narrátorral, időzített felirattal és hang-keveréssel.',
  },
  {
    id: 'proto5_lena_radio',
    shortLabel: '5. Lena Rádió',
    title: '5. Dr. Lena V. 1983-as Rádióadása',
    stageKind: 'archive',
    summary: '1983-as rövidhullámú bandpass szűrőn és finom sztereó zajon átvezetett magyar AI női hang.',
  },
  {
    id: 'proto6_infinite_voice',
    shortLabel: '6. A Végtelen',
    title: '6. A Végtelen Első Hangja',
    stageKind: 'antarctic',
    summary: 'Kétoldali késleltetéses katedrális-rezonancián át szóló hipnotikus magyar entitás-hang.',
  },
  {
    id: 'proto7_tactile_sfx',
    shortLabel: '7. Taktilis SFX',
    title: '7. Procedurális Interakciós Hangeffektek',
    stageKind: 'archive',
    summary: 'Valós idejű Web Audio szintézis külső hangfájlok nélkül: papírzörgés, CRT kapcsoló, jégtörés, kristály.',
  },
  {
    id: 'proto8_spatial_soundscape',
    shortLabel: '8. Térbeli Hangtér',
    title: '8. Sztereó Térbeli Környezeti Hangtér & 4-Csatornás Keverő',
    stageKind: 'antarctic',
    summary: 'Sztereóban vándorló katabatikus szél, távolságfüggő 54 Hz obeliszk-zúgás és jégrepedések.',
  },
];

const AI_SCRIPTS = {
  proto4_ai_narration: {
    lineId: 'proto4_cold_open_hu',
    speakerLabel: 'NARRÁTOR',
    persona: 'narrator' as const,
    channel: 'narration' as const,
    fxMode: 'clean' as const,
    text: '1982 novembere, nyolcvankettedik déli szélesség. <breath> A jeges szél nem emlékezett a nyarakra. A jég alatt azonban valami mégis válaszolt a radar jelére: egy szabályos, logaritmikus csend.',
  },
  proto5_lena_radio: {
    lineId: 'proto5_lena_radio_1983_hu',
    speakerLabel: 'DR. LENA V. (RÁDIÓ · 1983)',
    persona: 'lena' as const,
    channel: 'dialogue' as const,
    fxMode: 'radio1983' as const,
    text: 'Itt Lena az egyes számú hangcsatornáról. <breath> Viktor, ha még hallod a szalagot... a jég nem tárolja az emlékeket. A jég megismétli a döntéseinket, még azelőtt, hogy kimondanánk őket.',
  },
  proto6_infinite_voice: {
    lineId: 'proto6_infinite_first_hu',
    speakerLabel: 'A VÉGTELEN',
    persona: 'infinite' as const,
    channel: 'dialogue' as const,
    fxMode: 'infinite_resonance' as const,
    text: 'Ne félj a hidegtől, megfigyelő. <breath> Nem elvenni jöttem, amit szerettél. Azért tartottam meg a pillanatot, hogy végre meg merd kérdezni: mit érdemes létrehozni?',
  },
};

interface Phase1PrototypeLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
}

export const Phase1PrototypeLabModal: React.FC<Phase1PrototypeLabModalProps> = ({
  isOpen,
  onClose,
  reducedMotion,
}) => {
  const [activeProtoId, setActiveProtoId] = useState<PrototypeId>('proto1_antarctica_3d');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [fpsText, setFpsText] = useState('Inicializálás...');
  const [webglFailed, setWebglFailed] = useState(false);

  // Interactive prototype controls
  const [windIntensity, setWindIntensity] = useState(0.65);
  const [obeliskProximity, setObeliskProximity] = useState(0.45);
  const [stereoPan, setStereoPan] = useState(0);
  const [soundscapeRunning, setSoundscapeRunning] = useState(false);

  const [explodeAmount, setExplodeAmount] = useState(0);
  const [uvActive, setUvActive] = useState(false);
  const [selectedArtifactPart, setSelectedArtifactPart] = useState<ArtifactPartInfo | null>(null);
  const [deskInspectNote, setDeskInspectNote] = useState<string>(
    'Kattints a CRT monitorra, az 1982-es aktára vagy az 1983-as mágnesszalagra.'
  );

  // 4-channel volume state
  const [ambientVol, setAmbientVol] = useState(spatialSoundscapeEngine.ambientVolume);
  const [narrationVol, setNarrationVol] = useState(spatialSoundscapeEngine.narrationVolume);
  const [dialogueVol, setDialogueVol] = useState(spatialSoundscapeEngine.dialogueVolume);
  const [sfxVol, setSfxVol] = useState(spatialSoundscapeEngine.sfxVolume);
  const [isMuted, setIsMuted] = useState(spatialSoundscapeEngine.isMuted);

  // Subtitle & AI voice state
  const [subtitle, setSubtitle] = useState<SubtitleState | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageControllerRef = useRef<
    AntarcticStageController | ArchiveDeskStageController | Artifact3DStageController | null
  >(null);

  const visiblePrototypes = TTS_ENABLED
    ? PROTOTYPES
    : PROTOTYPES.filter(
        (p) =>
          p.id !== 'proto4_ai_narration' &&
          p.id !== 'proto5_lena_radio' &&
          p.id !== 'proto6_infinite_voice'
      );

  const activeMeta = visiblePrototypes.find((p) => p.id === activeProtoId) || visiblePrototypes[0];

  // Mount & switch Three.js stage ONLY when stageKind changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      setFpsText('2D Fallback mód (WebGL nem elérhető)');
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    setWebglFailed(false);
    stageControllerRef.current?.dispose();
    stageControllerRef.current = null;

    if (activeMeta.stageKind === 'antarctic') {
      stageControllerRef.current = mountAntarcticOutpostStage(container, {
        windSpeed: windIntensity,
        reducedMotion,
        onFpsUpdate: (fps, backend) => setFpsText(`${fps} FPS · ${backend}`),
        onContextLost: () => setWebglFailed(true),
      });
    } else if (activeMeta.stageKind === 'archive') {
      stageControllerRef.current = mountArchive82DeskStage(container, {
        reducedMotion,
        onHoverObject: (_id, label) => {
          if (label) setDeskInspectNote(label);
        },
        onSelectObject: (itemId: ArchiveDeskItemId, label: string) => {
          setDeskInspectNote(`Kiválasztva: ${label}`);
          if (itemId === 'crt') spatialSoundscapeEngine.playCrtSwitchClick(-0.2);
          else if (itemId === 'dossier') spatialSoundscapeEngine.playPaperRustle(0.35);
          else spatialSoundscapeEngine.playCrystalChime(432, -0.45);
        },
        onFpsUpdate: (fps, backend) => setFpsText(`${fps} FPS · ${backend}`),
        onContextLost: () => setWebglFailed(true),
      });
    } else {
      stageControllerRef.current = mountArtifact3DInspectorStage(container, {
        explodeAmount,
        uvActive,
        reducedMotion,
        onSelectPart: (info) => {
          setSelectedArtifactPart(info);
          spatialSoundscapeEngine.playCrystalChime(528, 0);
        },
        onFpsUpdate: (fps, backend) => setFpsText(`${fps} FPS · ${backend}`),
        onContextLost: () => setWebglFailed(true),
      });
    }

    return () => {
      stageControllerRef.current?.dispose();
      stageControllerRef.current = null;
    };
  }, [isOpen, activeMeta.stageKind]);

  // Push live slider/toggle options without recreating Three.js canvas
  useEffect(() => {
    const ctrl = stageControllerRef.current;
    if (!ctrl) return;
    if (activeMeta.stageKind === 'antarctic') {
      (ctrl as AntarcticStageController).updateOptions({
        windSpeed: windIntensity,
        reducedMotion,
      });
    } else if (activeMeta.stageKind === 'archive') {
      (ctrl as ArchiveDeskStageController).updateOptions({ reducedMotion });
    } else {
      (ctrl as Artifact3DStageController).updateOptions({
        explodeAmount,
        uvActive,
        reducedMotion,
      });
    }
  }, [windIntensity, explodeAmount, uvActive, reducedMotion, activeMeta.stageKind]);

  // Update spatial soundscape live when sliders move
  useEffect(() => {
    if (soundscapeRunning) {
      spatialSoundscapeEngine.updateSpatialSoundscape({
        windIntensity,
        obeliskProximity,
        stereoPan,
      });
    }
  }, [soundscapeRunning, windIntensity, obeliskProximity, stereoPan]);

  // Clean up audio & subtitles when modal closes
  useEffect(() => {
    if (!isOpen) {
      aiVoiceService.stop();
      spatialSoundscapeEngine.stopSpatialSoundscape();
      setSoundscapeRunning(false);
      setSubtitle(null);
      setVoiceLoading(false);
    }
  }, [isOpen]);

  // Update volume mixer live
  useEffect(() => {
    spatialSoundscapeEngine.setVolumes({
      ambient: ambientVol,
      narration: narrationVol,
      dialogue: dialogueVol,
      sfx: sfxVol,
    });
  }, [ambientVol, narrationVol, dialogueVol, sfxVol]);

  if (!isOpen) return null;

  const handlePlayAiVoice = async (key: keyof typeof AI_SCRIPTS) => {
    if (!TTS_ENABLED) return;
    const script = AI_SCRIPTS[key];
    setVoiceLoading(true);
    await aiVoiceService.playLine({
      ...script,
      onSubtitle: (sub) => {
        setSubtitle(sub);
        setVoiceLoading(false);
      },
      onComplete: () => {
        setVoiceLoading(false);
      },
    });
  };

  const handleToggleSoundscape = () => {
    if (soundscapeRunning) {
      spatialSoundscapeEngine.stopSpatialSoundscape();
      setSoundscapeRunning(false);
    } else {
      spatialSoundscapeEngine.startSpatialSoundscape({
        windIntensity,
        obeliskProximity,
        stereoPan,
      });
      setSoundscapeRunning(true);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    spatialSoundscapeEngine.setMuted(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#040710] text-slate-100 flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={TTS_ENABLED ? 'Phase 1 Térbeli és AI Hang Labor' : 'Phase 1 Térbeli és Hang Labor'}
    >
      {/* Dedicated WebGL Container (Zero backdrop-filter overlays over canvas) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: webglFailed ? 'none' : 'block' }}
        />

        {webglFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060c19] p-6 text-center">
            <div className="max-w-md space-y-2 border border-slate-700/80 bg-[#0b1222] rounded-xl p-6">
              <div className="text-sm font-cinzel font-bold text-cyan-300">
                2D Fallback Nézet Aktív
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {TTS_ENABLED
                  ? 'A böngészőben jelenleg nem érhető el WebGL gyorsítás. Az AI hangrendszer, feliratozás és térbeli audio-szintézis teljes funkcionalitással tesztelhető.'
                  : 'A böngészőben jelenleg nem érhető el WebGL gyorsítás. A térbeli audio-szintézis és procedurális hangeffektek teljes funkcionalitással tesztelhetők.'}
              </p>
            </div>
          </div>
        )}

        {/* Top Bar Overlay (Solid dark slate rgba, zero backdrop-blur) */}
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#050914]/90 border-b border-slate-800/90">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-cinzel font-bold text-sm tracking-wider text-cyan-300 whitespace-nowrap shrink-0">
              Phase 1 Prototípus Labor
            </span>
            <span className="hidden md:inline text-xs font-mono text-slate-400 truncate">
              {activeMeta.title}
            </span>
          </div>

          {/* Prototype Selector Strip */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            {visiblePrototypes.map((p) => {
              const active = p.id === activeProtoId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    spatialSoundscapeEngine.playCrtSwitchClick(0);
                    setActiveProtoId(p.id);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-mono rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {p.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[11px] font-mono text-slate-400 tabular-nums">
              {fpsText}
            </span>
            <button
              type="button"
              onClick={() => stageControllerRef.current?.resetCamera()}
              className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Kamera alaphelyzetbe állítása"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kamera</span>
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
              title={isMuted ? 'Hang visszakapcsolása' : 'Némítás'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={() => {
                aiVoiceService.stop();
                spatialSoundscapeEngine.stopSpatialSoundscape();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bezárás</span>
            </button>
          </div>
        </header>

        {/* Live Hungarian Subtitle Overlay */}
        {TTS_ENABLED && subtitle && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[210px] sm:bottom-[190px] z-20 w-[min(740px,92vw)] text-center"
          >
            <div className="inline-block px-5 py-3 rounded-xl bg-[#040812]/95 border border-cyan-500/35 shadow-xl">
              <div className="text-[11px] font-mono text-cyan-400 mb-1">
                {subtitle.speakerLabel}
                {subtitle.source === 'subtitle-fallback' && ' · Feliratos tartalék mód'}
                {subtitle.cached && ' · Gyorsítótárból'}
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-sans leading-relaxed">
                „{subtitle.currentSegment}”
              </p>
              {subtitle.errorNote && (
                <p className="text-[11px] font-mono text-amber-300/90 mt-1">{subtitle.errorNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Zero Center Viewport Occlusion) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(940px,94vw)] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="px-3.5 py-1 text-[11px] font-mono bg-[#070d1d]/95 border border-b-0 border-slate-700/80 text-slate-300 hover:text-cyan-300 rounded-t-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{dockCollapsed ? 'Vezérlők megjelenítése' : 'Vezérlők elrejtése'}</span>
          </button>

          {!dockCollapsed && (
            <div className="w-full rounded-2xl bg-[#070d1d]/95 border border-slate-700/85 p-4 shadow-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="text-xs font-semibold text-slate-100">{activeMeta.title}</div>
                  <div className="text-[11px] text-slate-400">{activeMeta.summary}</div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSoundscape}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    soundscapeRunning
                      ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {soundscapeRunning ? 'Szél & Obeliszk Hangtér: Aktív' : 'Térbeli Hangtér Indítása'}
                </button>
              </div>

              {/* Context-Specific Controls per Prototype */}
              {activeProtoId === 'proto1_antarctica_3d' && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <label className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-slate-300 whitespace-nowrap">Katabatikus szél:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={windIntensity}
                      onChange={(e) => setWindIntensity(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-cyan-300 tabular-nums w-9 text-right">
                      {Math.round(windIntensity * 100)}%
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Húzd az egeret a 360° forgatáshoz · Görgess a közelítéshez
                  </span>
                </div>
              )}

              {activeProtoId === 'proto2_archive_room_3d' && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-amber-200">{deskInspectNote}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => spatialSoundscapeEngine.playCrtSwitchClick(-0.2)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 cursor-pointer"
                    >
                      CRT Kapcsoló
                    </button>
                    <button
                      type="button"
                      onClick={() => spatialSoundscapeEngine.playPaperRustle(0.3)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 cursor-pointer"
                    >
                      Akta Lapozása
                    </button>
                  </div>
                </div>
              )}

              {activeProtoId === 'proto3_artifact_3d' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <label className="flex items-center gap-2 flex-1 min-w-[210px]">
                      <span className="text-slate-300 whitespace-nowrap">Rétegek szétnyitása:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={explodeAmount}
                        onChange={(e) => setExplodeAmount(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-cyan-300 tabular-nums w-9 text-right">
                        {Math.round(explodeAmount * 100)}%
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        spatialSoundscapeEngine.playCrtSwitchClick(0);
                        setUvActive((v) => !v);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                        uvActive
                          ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {uvActive ? 'UV Fény: Aktív' : 'UV Fény Bekapcsolása'}
                    </button>
                  </div>
                  {selectedArtifactPart && (
                    <div className="text-[11px] bg-slate-900/90 border border-cyan-500/30 rounded-lg px-3 py-2 text-slate-200">
                      <span className="font-semibold text-cyan-300">{selectedArtifactPart.name}: </span>
                      <span>{selectedArtifactPart.note}</span>
                    </div>
                  )}
                </div>
              )}

              {TTS_ENABLED &&
                (activeProtoId === 'proto4_ai_narration' ||
                  activeProtoId === 'proto5_lena_radio' ||
                  activeProtoId === 'proto6_infinite_voice') && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      „{AI_SCRIPTS[activeProtoId].text.replace(/<[^>]+>/g, '')}”
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={voiceLoading}
                        onClick={() => handlePlayAiVoice(activeProtoId)}
                        className="px-4 py-2 text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{voiceLoading ? 'Generálás...' : 'Magyar AI Hang Lejátszása'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          aiVoiceService.stop();
                          setSubtitle(null);
                          setVoiceLoading(false);
                        }}
                        className="px-3 py-2 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3 h-3" />
                        <span>Állj</span>
                      </button>
                    </div>
                  </div>
                )}

              {activeProtoId === 'proto7_tactile_sfx' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => spatialSoundscapeEngine.playPaperRustle(0.35)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  >
                    Papírakta Zörgés
                  </button>
                  <button
                    type="button"
                    onClick={() => spatialSoundscapeEngine.playCrtSwitchClick(-0.25)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  >
                    CRT Relé Kapcsoló
                  </button>
                  <button
                    type="button"
                    onClick={() => spatialSoundscapeEngine.playIceFracture(0)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  >
                    Jégtörés & Moraj
                  </button>
                  <button
                    type="button"
                    onClick={() => spatialSoundscapeEngine.playCrystalChime(528, 0.15)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  >
                    Kristály Rezonancia
                  </button>
                </div>
              )}

              {activeProtoId === 'proto8_spatial_soundscape' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <label className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Szél Intenzitás</span>
                      <span className="text-cyan-300 tabular-nums">{Math.round(windIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={windIntensity}
                      onChange={(e) => setWindIntensity(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Obeliszk Közelség (54 Hz)</span>
                      <span className="text-cyan-300 tabular-nums">{Math.round(obeliskProximity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={obeliskProximity}
                      onChange={(e) => setObeliskProximity(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Sztereó Irány (Bal / Jobb)</span>
                      <span className="text-cyan-300 tabular-nums">{stereoPan.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={stereoPan}
                      onChange={(e) => setStereoPan(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </label>
                </div>
              )}

              {/* Compact Audio Mixer Footer */}
              <div
                className={`grid grid-cols-2 ${
                  TTS_ENABLED ? 'sm:grid-cols-4' : ''
                } gap-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono`}
              >
                <label className="flex items-center gap-2">
                  <span className="text-slate-400 shrink-0">Környezet:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVol}
                    onChange={(e) => setAmbientVol(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </label>
                {TTS_ENABLED && (
                  <>
                    <label className="flex items-center gap-2">
                      <span className="text-slate-400 shrink-0">Narráció:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={narrationVol}
                        onChange={(e) => setNarrationVol(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-slate-400 shrink-0">Dialógus:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={dialogueVol}
                        onChange={(e) => setDialogueVol(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>
                  </>
                )}
                <label className="flex items-center gap-2">
                  <span className="text-slate-400 shrink-0">SFX:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVol}
                    onChange={(e) => setSfxVol(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
