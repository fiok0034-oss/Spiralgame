import React, { useMemo, useState } from 'react';
import { Wind } from 'lucide-react';
import { SpiralState } from '../types/game';
import { spatialSoundscapeEngine } from '../audio/SpatialSoundscapeEngine';
import { soundEngine } from '../audio/SoundEngine';

interface LivingAnomalyWhisperProps {
  sceneId: string;
  atmosphere?: string;
  spiralState: SpiralState;
  reducedMotion: boolean;
}

interface SensoryWhisper {
  label: string;
  text: string;
  sfx: 'wind' | 'ice' | 'chime' | 'paper';
}

export const LivingAnomalyWhisper: React.FC<LivingAnomalyWhisperProps> = ({
  sceneId,
  atmosphere,
  spiralState,
  reducedMotion,
}) => {
  const [acknowledgedScene, setAcknowledgedScene] = useState<string | null>(null);

  const whisper: SensoryWhisper | null = useMemo(() => {
    if (sceneId === 'v1_intro') {
      if (spiralState.loopState > 1) {
        return {
          label: 'Jég alatti deja vu',
          text: 'A sátor ponyváján ugyanazon a helyen fagyott meg a dér, ahol az előző körben a kezedet nyugtattad.',
          sfx: 'ice',
        };
      }
      return {
        label: 'Sarki Légkör · -58 °C',
        text: 'A sátor szélén a kávéspohár felszíne mozdulatlan, mégis két másodpercenként egy apró gyűrű fut végig rajta.',
        sfx: 'wind',
      };
    }

    if (atmosphere === 'silence' || sceneId === 'g1_chamber_beyond_ninth') {
      return {
        label: 'Rezdületlen Csend',
        text: 'Még a saját lélegzeted párája sem száll fel: mintha a helyiség visszatartaná a szavakat, mielőtt kimondod őket.',
        sfx: 'chime',
      };
    }

    if (atmosphere === 'fracture' || spiralState.realityWarp.gravityInverted) {
      return {
        label: 'Téridő Elmozdulás',
        text: 'A jégpor lassabban hullik lefelé, mint kellene — mintha a padló és a plafon megcserélte volna az emlékeit.',
        sfx: 'ice',
      };
    }

    if (sceneId.startsWith('l1_')) {
      return {
        label: '1983 · Akusztikus Szalag',
        text: 'A magnetofon szalagja leállítás után is megfeszül fél centiméterrel, mintha valaki a szoba túlfelén még beszélne bele.',
        sfx: 'paper',
      };
    }

    if (sceneId.startsWith('m1_') || sceneId.startsWith('k1_')) {
      return {
        label: 'Kódvárosi Visszhang',
        text: 'A falak mögött két lépéssel előtted jár a saját árnyékod; amikor megállsz, egy szívdobbanással később ér utol.',
        sfx: 'chime',
      };
    }

    if (sceneId.startsWith('lev1_')) {
      return {
        label: 'Budapest · 58 BPM',
        text: 'A pesti ablak üvegén hideg pára csapódik le belülről — mintha mínusz ötvennyolc fokos lehelet érte volna.',
        sfx: 'wind',
      };
    }

    if (sceneId.startsWith('g1_') || sceneId.startsWith('inf_')) {
      return {
        label: 'Az Őrzők Figyelme',
        text:
          spiralState.personality.preserver > spiralState.personality.releaser
            ? 'Kassarah kék deresedése apró, sértetlen emlékpelyhekként lebeg a karod mellett.'
            : 'Ir-Haya fekete hava nesztelenül elnyeli a fölösleges szavakat a levegőből.',
        sfx: 'chime',
      };
    }

    if (spiralState.spiralAwareness >= 40) {
      return {
        label: 'Érzékelhető Jelenlét',
        text: 'A hátad mögött a hőmérő hirtelen 36,6 fokot mutat egyetlen pillanatra, majd visszazuhan a fagyba.',
        sfx: 'ice',
      };
    }

    return null;
  }, [
    sceneId,
    atmosphere,
    spiralState.loopState,
    spiralState.realityWarp.gravityInverted,
    spiralState.personality.preserver,
    spiralState.personality.releaser,
    spiralState.spiralAwareness,
  ]);

  if (!whisper) return null;

  const isTouched = acknowledgedScene === sceneId;

  const handleNotice = () => {
    setAcknowledgedScene(sceneId);
    if (whisper.sfx === 'wind') {
      soundEngine.playIceBreath();
    } else if (whisper.sfx === 'ice') {
      spatialSoundscapeEngine.playIceFracture(-0.1);
    } else if (whisper.sfx === 'paper') {
      spatialSoundscapeEngine.playPaperRustle(0.1);
    } else {
      spatialSoundscapeEngine.playCrystalChime(528, 0.15);
    }
  };

  return (
    <button
      type="button"
      onClick={handleNotice}
      className={`w-full text-left mb-5 px-4 py-2.5 rounded-xl border text-xs transition-colors cursor-pointer flex items-center justify-between gap-3 ${
        isTouched
          ? 'bg-cyan-950/25 border-cyan-500/40 text-cyan-100'
          : 'bg-slate-950/65 border-slate-800/90 hover:border-cyan-500/35 text-slate-300'
      } ${reducedMotion ? '' : 'transition-colors duration-300'}`}
    >
      <div className="flex items-start gap-2.5">
        <Wind className="w-3.5 h-3.5 text-cyan-400/80 shrink-0 mt-0.5" />
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300/85 mr-2">
            {whisper.label}:
          </span>
          <span className="font-sans italic text-slate-300">{whisper.text}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:inline">
        {isTouched ? 'Észlelve' : 'Megfigyelés'}
      </span>
    </button>
  );
};
