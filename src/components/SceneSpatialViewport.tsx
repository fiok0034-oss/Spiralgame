import React, { useEffect, useRef, useState } from 'react';
import {
  AntarcticStageController,
  mountAntarcticOutpostStage,
} from '../prototypes/three/AntarcticOutpostStage';
import {
  ArchiveDeskItemId,
  ArchiveDeskStageController,
  mountArchive82DeskStage,
} from '../prototypes/three/Archive82DeskStage';
import { isWebGLAvailable } from '../prototypes/three/threeUtils';
import { spatialSoundscapeEngine } from '../audio/SpatialSoundscapeEngine';

interface SceneSpatialViewportProps {
  sceneId: string;
  atmosphere?: string;
  reducedMotion: boolean;
  onDeskInteract?: (message: string) => void;
}

export const SceneSpatialViewport: React.FC<SceneSpatialViewportProps> = ({
  sceneId,
  atmosphere,
  reducedMotion,
  onDeskInteract,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AntarcticStageController | ArchiveDeskStageController | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const isArchiveRoom =
    sceneId.startsWith('l1_') ||
    sceneId.includes('archive') ||
    sceneId.includes('radio') ||
    sceneId.includes('lab');

  const stageType = isArchiveRoom ? 'archive' : 'antarctic';
  const windSpeed =
    atmosphere === 'storm' ? 0.95 : atmosphere === 'silence' ? 0.15 : atmosphere === 'calm' ? 0.35 : 0.6;

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    setWebglFailed(false);
    controllerRef.current?.dispose();

    if (stageType === 'archive') {
      controllerRef.current = mountArchive82DeskStage(container, {
        reducedMotion,
        onSelectObject: (itemId: ArchiveDeskItemId, label: string) => {
          if (itemId === 'crt') spatialSoundscapeEngine.playCrtSwitchClick(-0.2);
          else if (itemId === 'dossier') spatialSoundscapeEngine.playPaperRustle(0.3);
          else spatialSoundscapeEngine.playCrystalChime(432, -0.4);
          onDeskInteract?.(label);
        },
        onContextLost: () => setWebglFailed(true),
      });
    } else {
      controllerRef.current = mountAntarcticOutpostStage(container, {
        windSpeed,
        reducedMotion,
        onContextLost: () => setWebglFailed(true),
      });
    }

    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [stageType]);

  useEffect(() => {
    if (!controllerRef.current) return;
    if (stageType === 'antarctic') {
      (controllerRef.current as AntarcticStageController).updateOptions({
        windSpeed,
        reducedMotion,
      });
    } else {
      (controllerRef.current as ArchiveDeskStageController).updateOptions({
        reducedMotion,
      });
    }
  }, [windSpeed, reducedMotion, stageType]);

  if (webglFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#060c19] text-xs font-mono text-slate-400 p-4 text-center">
        WebGL térbeli nézet nem érhető el ezen az eszközön — válts vissza az illusztrált nézetre.
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
};
