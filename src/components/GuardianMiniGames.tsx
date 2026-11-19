import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export interface GuardianMiniGameProps {
  onWin: () => void;
}

// =========================================================================
// #1 KASSARAH · Az Emlékek Óceánja — OceanMemoryDiveGame ('ocean_memory_dive')
// Classify 4 sonar depth layers: Raw Truth vs. Altered Memory Illusion
// =========================================================================
interface DepthLayer {
  id: string;
  depthM: number;
  title: string;
  reading: string;
  thermalC: string;
  isRawTruth: boolean;
  explanation: string;
}

const OCEAN_LAYERS: DepthLayer[] = [
  {
    id: 'layer_1959',
    depthM: -420,
    title: '1959-es Poláris-59 Sátorhang',
    reading: '„A mutató visszafelé lép. Nem hagyunk hátra nevet, csak a kronométert.”',
    thermalC: '+1.2 °C',
    isRawTruth: true,
    explanation: 'Egyezik Dr. Kovács Áron 1959-es valódi sárgaréz kronométerével.',
  },
  {
    id: 'layer_false_peace',
    depthM: -1150,
    title: 'Szépített Búcsú a Rádióban',
    reading: '„Mindenki mosolyogva tért haza 1982 telén, senki nem hallott 82.0 MHz-et.”',
    thermalC: '-39.0 °C (Mesterséges fagy)',
    isRawTruth: false,
    explanation: 'Hamisított enyhítés — az óceán átírta a fájdalmas tényt.',
  },
  {
    id: 'layer_lena_1979',
    depthM: -2400,
    title: 'Projekt Δ–0 Süketszoba-szalag',
    reading: '„1979. november 19. — A hang előbb szólt a nőhöz, minthogy a gép bekapcsolt volna.”',
    thermalC: '+36.6 °C',
    isRawTruth: true,
    explanation: 'Valódi emberi testhő-nyom és az eredeti 1979-es dátum.',
  },
  {
    id: 'layer_fake_silence',
    depthM: -3200,
    title: 'Néma Obeliszk Illúzió',
    reading: '„A fekete kő sosem melegedett át, és Levente nevét senki sem ismerte.”',
    thermalC: '-58.0 °C',
    isRawTruth: false,
    explanation: 'Kassarah védelmi illúziója — el akarja rejteni a hálózat élő szálát.',
  },
];

export const OceanMemoryDiveGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [depthIdx, setDepthIdx] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, 'raw' | 'altered'>>({});
  const [solved, setSolved] = useState(false);

  const current = OCEAN_LAYERS[depthIdx];
  const allCorrect = OCEAN_LAYERS.every((layer) => {
    const pick = decisions[layer.id];
    return layer.isRawTruth ? pick === 'raw' : pick === 'altered';
  });

  const classifyLayer = (kind: 'raw' | 'altered') => {
    if (solved) return;
    const isCorrect = current.isRawTruth ? kind === 'raw' : kind === 'altered';
    if (isCorrect) {
      soundEngine.playCrystalResonance(432 + depthIdx * 55);
    } else {
      soundEngine.playMechanicalTick(-2);
    }
    const next = { ...decisions, [current.id]: kind };
    setDecisions(next);
    const doneNow = OCEAN_LAYERS.every((layer) => {
      const pick = next[layer.id];
      return layer.isRawTruth ? pick === 'raw' : pick === 'altered';
    });
    if (doneNow) {
      setSolved(true);
      soundEngine.playHarmonicChord([216, 432, 648]);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Merülj végig mind a 4 emlékrétegen, és válogasd szét a <span className="text-cyan-300">Nyers Igazságot</span> a <span className="text-amber-300">Hamisított Emléktől</span> a hőmérséklet és dátum alapján!
      </p>

      {/* Depth Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OCEAN_LAYERS.map((layer, idx) => {
          const picked = decisions[layer.id];
          const ok = picked ? (layer.isRawTruth ? picked === 'raw' : picked === 'altered') : false;
          const active = idx === depthIdx;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setDepthIdx(idx);
              }}
              className={`px-3 py-2 min-h-[44px] rounded-xl border text-left text-xs font-mono transition-colors cursor-pointer ${
                active
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-100'
                  : ok
                  ? 'border-emerald-500/45 bg-emerald-950/20 text-emerald-200'
                  : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              <div className="font-bold tabular-nums">{layer.depthM} m</div>
              <div className="text-[11px] truncate">{ok ? '✓ Azonosítva' : picked ? '✗ Téves' : 'Vizsgálandó'}</div>
            </button>
          );
        })}
      </div>

      {/* Active Sonar Card */}
      <div className="rounded-xl border border-cyan-500/35 bg-slate-950/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-cyan-300 font-bold">{current.title}</span>
          <span className="text-amber-300 tabular-nums">Hőnyom: {current.thermalC}</span>
        </div>
        <p className="text-sm text-slate-100 font-sans italic leading-relaxed">{current.reading}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            disabled={solved}
            onClick={() => classifyLayer('raw')}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl border text-xs font-mono font-bold cursor-pointer transition-colors ${
              decisions[current.id] === 'raw'
                ? current.isRawTruth
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                  : 'border-rose-400 bg-rose-950/40 text-rose-200'
                : 'border-cyan-500/40 bg-slate-900 hover:bg-slate-800 text-cyan-200'
            }`}
          >
            Nyers Valódi Emlék
          </button>
          <button
            type="button"
            disabled={solved}
            onClick={() => classifyLayer('altered')}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl border text-xs font-mono font-bold cursor-pointer transition-colors ${
              decisions[current.id] === 'altered'
                ? !current.isRawTruth
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                  : 'border-rose-400 bg-rose-950/40 text-rose-200'
                : 'border-amber-500/40 bg-slate-900 hover:bg-slate-800 text-amber-200'
            }`}
          >
            Szépített / Hamisított Illúzió
          </button>
        </div>

        {decisions[current.id] && (
          <div className="text-xs font-mono text-slate-300 pt-1">
            {(current.isRawTruth ? decisions[current.id] === 'raw' : decisions[current.id] === 'altered')
              ? `✓ Helyes: ${current.explanation}`
              : '✗ Ez a réteg hőnyoma ellentmond a választásodnak — próbáld újra!'}
          </div>
        )}
      </div>

      {allCorrect && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200">
          ✓ Mind a 4 mélységi emlékréteg szétválasztva! Kassarah óceánja megtisztult.
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #2 IR-HAYA · A Felejtés Sivataga — DesertTraceReconstructionGame
// Reconstruct fading sand-trace glyph sequence before dunes wipe them
// =========================================================================
interface TraceStep {
  code: string;
  label: string;
  meaning: string;
}

const TRACE_POOL: TraceStep[] = [
  { code: 'Ω–1', label: 'Hamukapu', meaning: 'A kitörölt külső fal' },
  { code: 'Ω–2', label: 'Ezüst Szél', meaning: 'A felejtés szívverése' },
  { code: 'Ω–3', label: 'Üres Tér', meaning: 'A megmaradt csend' },
  { code: 'Ω–4', label: 'Parázs-út', meaning: 'A homok alatti szikra' },
  { code: 'Ω–5', label: 'Tiszta Mag', meaning: 'Az emlékezet alapja' },
];
const DESERT_TARGET_ORDER = ['Ω–1', 'Ω–3', 'Ω–2', 'Ω–4', 'Ω–5'];

export const DesertTraceReconstructionGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [entered, setEntered] = useState<string[]>([]);
  const [fadeMask, setFadeMask] = useState<boolean>(false);
  const [solved, setSolved] = useState(false);

  const triggerPeek = () => {
    soundEngine.playCrystalResonance(285);
    setFadeMask(true);
    window.setTimeout(() => setFadeMask(false), 1800);
  };

  const pickGlyph = (code: string) => {
    if (solved) return;
    const expected = DESERT_TARGET_ORDER[entered.length];
    if (code === expected) {
      soundEngine.playCrystalResonance(300 + entered.length * 45);
      const next = [...entered, code];
      setEntered(next);
      if (next.length === DESERT_TARGET_ORDER.length) {
        setSolved(true);
        soundEngine.playHarmonicChord([142, 285, 427]);
        onWin();
      }
    } else {
      soundEngine.playMechanicalTick(-2);
      setEntered([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-mono text-slate-300">
          Kövesd az elhalványuló sivatagi jeleket a megfelelő sorrendben, mielőtt a hamuvihar betemeti őket!
        </p>
        <button
          type="button"
          onClick={triggerPeek}
          className="px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-900 border border-amber-500/45 text-amber-200 text-xs font-mono cursor-pointer inline-flex items-center gap-1.5 shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Nyomok Megvilágítása</span>
        </button>
      </div>

      {/* Sequence Trail Display */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="text-[11px] font-mono text-slate-400">
          Dűne-ösvény célsorrendje {fadeMask ? '(Fény látható!)' : '(Kódolt hamunyom)'}:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DESERT_TARGET_ORDER.map((code, idx) => {
            const unlocked = idx < entered.length;
            const visible = unlocked || fadeMask || idx === entered.length;
            return (
              <div
                key={`${code}_${idx}`}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold tabular-nums transition-opacity ${
                  unlocked
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                    : idx === entered.length
                    ? 'border-amber-400/70 bg-amber-950/30 text-amber-200'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {idx + 1}. {visible ? code : '???'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clickable Rune Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {TRACE_POOL.map((step) => {
          const already = entered.includes(step.code);
          return (
            <button
              key={step.code}
              type="button"
              disabled={already || solved}
              onClick={() => pickGlyph(step.code)}
              className={`p-3 min-h-[48px] rounded-xl border text-left transition-colors cursor-pointer ${
                already
                  ? 'border-emerald-500/45 bg-emerald-950/25 text-emerald-200'
                  : 'border-slate-700 bg-slate-950 hover:border-amber-400/70 text-slate-100'
              }`}
            >
              <div className="text-xs font-mono font-bold text-amber-300">{step.code}</div>
              <div className="text-xs font-cinzel font-semibold mt-0.5">{step.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{step.meaning}</div>
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200">
          ✓ A kitörölt sivatagi ösvény megőrizve! A homok megnyitotta az utat a Központi Oszlophoz.
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #3 THAL-MUREN · Az Időtörés Királysága — TimeFractureParadoxGame
// Inverted causality switchboard: Future sets rules for 1959 & 1982
// =========================================================================
export const TimeFractureParadoxGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [futureMode, setFutureMode] = useState<'preserve' | 'invert' | 'bridge'>('invert');
  const [hour1959, setHour1959] = useState<number>(3);
  const [hour1982, setHour1982] = useState<number>(9);
  const [solved, setSolved] = useState(false);

  // Inverted causality targets based on future choice:
  // Target: futureMode === 'bridge', hour1959 === 11 (Nov 1959), hour1982 === 8 (82.0 MHz / 8th hour)
  const target1959 = futureMode === 'bridge' ? 11 : futureMode === 'preserve' ? 12 : 6;
  const target1982 = futureMode === 'bridge' ? 8 : futureMode === 'preserve' ? 4 : 2;
  const aligned = futureMode === 'bridge' && hour1959 === 11 && hour1982 === 8;

  const confirmParadox = () => {
    if (!aligned || solved) return;
    setSolved(true);
    soundEngine.playTimelineShift();
    onWin();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Thal-Muren birodalmában a <span className="text-amber-300">Jövő</span> határozza meg a múlt számlapját: válaszd az <span className="text-cyan-300">Áthidaló Jövőt</span>, majd állítsd az 1959-es órát <span className="font-bold">11</span>-re és az 1982-eset <span className="font-bold">8</span>-ra!
      </p>

      {/* Future Cause Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { id: 'invert' as const, label: 'Zárt Hurok', desc: 'A múlt bezárja magát' },
          { id: 'preserve' as const, label: 'Merev Jég', desc: 'Semmi nem változhat' },
          { id: 'bridge' as const, label: 'Áthidaló Jövő', desc: '1959 & 1982 összekötve (11 / 8)' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={solved}
            onClick={() => {
              soundEngine.playTimelineShift();
              setFutureMode(m.id);
            }}
            className={`p-3 min-h-[44px] rounded-xl border text-left text-xs cursor-pointer transition-colors ${
              futureMode === m.id
                ? 'border-cyan-400 bg-cyan-950/45 text-cyan-100'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            <div className="font-mono font-bold">{m.label}</div>
            <div className="text-[11px] text-slate-400">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Past Effect Dials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { era: '1959 · Poláris-59', val: hour1959, target: target1959, setVal: setHour1959 },
          { era: '1982 · ARCHÍV-82', val: hour1982, target: target1982, setVal: setHour1982 },
        ].map((dial) => {
          const ok = dial.val === dial.target;
          return (
            <div key={dial.era} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">{dial.era}</span>
                <span className={`tabular-nums font-bold ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {dial.val}:00 (Cél: {dial.target}:00)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => {
                    soundEngine.playMechanicalTick(-1);
                    dial.setVal((v) => (v <= 1 ? 12 : v - 1));
                  }}
                  className="flex-1 py-2 min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono cursor-pointer"
                >
                  −1 óra
                </button>
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => {
                    soundEngine.playMechanicalTick(1);
                    dial.setVal((v) => (v >= 12 ? 1 : v + 1));
                  }}
                  className="flex-1 py-2 min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono cursor-pointer"
                >
                  +1 óra
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!aligned || solved}
        onClick={confirmParadox}
        className={`w-full py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold uppercase ${
          solved
            ? 'bg-emerald-950/50 border border-emerald-500/45 text-emerald-200'
            : aligned
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {solved ? '✓ Időparadoxon Összehangolva' : 'Fordított Oksági Híd Rögzítése'}
      </button>
    </div>
  );
};

// =========================================================================
// #4 AZ-ZAHIR · A Tükrök Dimenziója — MirrorReflectionLabyrinthGame
// Rotate 4 quartz mirrors (/ or \) on a 4x4 optical bench to bounce beam to Goal
// =========================================================================
type MirrorSlash = '/' | '\\';
type Dir = 'R' | 'D' | 'L' | 'U';

// Grid 4x4: Start enters row 0, col 0 going Right ('R')
// Mirrors placed at (0,2), (2,2), (2,1), (3,1) -> Goal at (3,3)
// Solution:
// (0,2) = '\' (R -> D)
// (2,2) = '/' (D -> L)
// (2,1) = '\' (L -> U? Wait: L hitting '\' goes Up! Let's trace!)
// Wait: let's carefully verify optical reflection math!
// From L (moving left, dx=-1): hitting '/' reflects DOWN ('D'), hitting '\' reflects UP ('U').
// So at (2,1) we want L -> D! Thus (2,1) should be '/'! Then at (3,1), moving Down ('D') hitting '\' reflects RIGHT ('R') -> reaches Goal (3,3)!
// Let's trace step by step:
// Start at (0,0) heading 'R':
// (0,0) -> (0,1) -> (0,2): hits '\' (R -> D)
// -> (1,2) -> (2,2): hits '/' (D -> L)
// -> (2,1): hits '/' (L -> D)
// -> (3,1): hits '\' (D -> R)
// -> (3,2) -> (3,3) GOAL!
// Clean, 100% deterministic, fast to solve!
const MIRROR_COORDS = [
  { r: 0, c: 2, target: '\\' as MirrorSlash, initial: '/' as MirrorSlash },
  { r: 2, c: 2, target: '/' as MirrorSlash, initial: '\\' as MirrorSlash },
  { r: 2, c: 1, target: '/' as MirrorSlash, initial: '\\' as MirrorSlash },
  { r: 3, c: 1, target: '\\' as MirrorSlash, initial: '/' as MirrorSlash },
];

const reflectDir = (dir: Dir, mirror: MirrorSlash): Dir => {
  if (mirror === '/') {
    if (dir === 'R') return 'U';
    if (dir === 'L') return 'D';
    if (dir === 'U') return 'R';
    return 'L';
  }
  // mirror === '\'
  if (dir === 'R') return 'D';
  if (dir === 'L') return 'U';
  if (dir === 'D') return 'R';
  return 'L';
};

export const MirrorReflectionLabyrinthGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [mirrors, setMirrors] = useState<MirrorSlash[]>(MIRROR_COORDS.map((m) => m.initial));
  const [solved, setSolved] = useState(false);

  // Trace beam path on 4x4 grid
  const traceBeam = useCallback((currMirrors: MirrorSlash[]) => {
    const visitedCells: string[] = [];
    let r = 0;
    let c = 0;
    let dir: Dir = 'R';
    let reachedGoal = false;

    for (let step = 0; step < 24; step++) {
      const key = `${r},${c}`;
      visitedCells.push(key);
      if (r === 3 && c === 3) {
        reachedGoal = true;
        break;
      }
      if (r === 1 && c === 1) break; // Illusion pillar blocker

      const mIdx = MIRROR_COORDS.findIndex((m) => m.r === r && m.c === c);
      if (mIdx !== -1) {
        dir = reflectDir(dir, currMirrors[mIdx]);
      }
      if (dir === 'R') c += 1;
      else if (dir === 'L') c -= 1;
      else if (dir === 'D') r += 1;
      else r -= 1;

      if (r < 0 || r > 3 || c < 0 || c > 3) break;
    }
    return { visitedCells, reachedGoal };
  }, []);

  const { visitedCells, reachedGoal } = traceBeam(mirrors);

  const flipMirror = (mIdx: number) => {
    if (solved) return;
    soundEngine.playMechanicalTick(mIdx);
    const next = mirrors.map((m, i) => (i === mIdx ? (m === '/' ? '\\' : '/') : m));
    setMirrors(next);
    const res = traceBeam(next);
    if (res.reachedGoal) {
      setSolved(true);
      soundEngine.playHarmonicChord([277, 417, 625]);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Forgasd el a 4 smaragd kvarctükröt (<span className="text-emerald-300">/</span> vagy <span className="text-emerald-300">\</span>), hogy a fénysugár a <span className="text-cyan-300">Fényforrásból (F)</span> kikerülje a hamis oszlopot és elérje az <span className="text-amber-300">Igazság Magját (M)</span>!
      </p>

      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
        {Array.from({ length: 16 }).map((_, idx) => {
          const r = Math.floor(idx / 4);
          const c = idx % 4;
          const mIdx = MIRROR_COORDS.findIndex((m) => m.r === r && m.c === c);
          const lit = visitedCells.includes(`${r},${c}`);
          const isStart = r === 0 && c === 0;
          const isGoal = r === 3 && c === 3;
          const isBlocker = r === 1 && c === 1;

          if (mIdx !== -1) {
            return (
              <button
                key={`${r}_${c}`}
                type="button"
                onClick={() => flipMirror(mIdx)}
                className={`h-14 rounded-lg border font-mono text-xl font-bold flex items-center justify-center cursor-pointer transition-colors ${
                  lit
                    ? 'border-emerald-400 bg-emerald-950/50 text-emerald-200'
                    : 'border-cyan-500/45 bg-slate-900 hover:border-cyan-300 text-cyan-200'
                }`}
                title="Kattints a tükör elforgatásához"
              >
                {mirrors[mIdx]}
              </button>
            );
          }

          return (
            <div
              key={`${r}_${c}`}
              className={`h-14 rounded-lg border font-mono text-xs font-bold flex items-center justify-center ${
                isStart
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                  : isGoal
                  ? reachedGoal
                    ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100'
                    : 'border-amber-400/60 bg-amber-950/30 text-amber-200'
                  : isBlocker
                  ? 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                  : lit
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600'
              }`}
            >
              {isStart ? 'F →' : isGoal ? (reachedGoal ? '✓ M' : 'MAG') : isBlocker ? 'ILLÚZIÓ' : lit ? '✦' : '·'}
            </div>
          );
        })}
      </div>

      {reachedGoal && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200 text-center">
          ✓ A fénytörés megtisztult — az igazság tükörképe elérte a szentélyt!
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #5 NOK-TURA · A Csend Katedrálisa — CathedralSilenceTuningGame
// Tune 3 organ pipes to 264/432/528 Hz ONLY during open resonance phase (not Silence Gate)
// Fully playable without audio via explicit visual Silence Gate bar!
// =========================================================================
const ORGAN_TARGETS = [264, 432, 528];

export const CathedralSilenceTuningGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [pipes, setPipes] = useState([220, 380, 480]);
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // Rhythmic 6-step cycle: steps 0..3 allow tuning ("NYITOTT REZGÉS"), steps 4..5 are Silence Gate ("CSENDKAPU — NE HANGOLJ")
  useEffect(() => {
    if (solved) return;
    const timer = window.setInterval(() => {
      setTick((t) => (t + 1) % 6);
    }, 900);
    return () => clearInterval(timer);
  }, [solved]);

  const isSilenceGate = tick >= 4;

  const tunePipe = (idx: number, delta: number) => {
    if (solved) return;
    if (isSilenceGate) {
      soundEngine.playMechanicalTick(-3);
      setFeedback('✗ Csendkapu aktív! A katedrális elvárja a 2 ütemes hallgatást — várd meg a Nyitott Rezgést.');
      return;
    }
    const nextVal = Math.max(180, Math.min(600, pipes[idx] + delta));
    soundEngine.playCrystalResonance(nextVal);
    setFeedback(null);
    const next = pipes.map((p, i) => (i === idx ? nextVal : p));
    setPipes(next);
    if (next.every((v, i) => Math.abs(v - ORGAN_TARGETS[i]) <= 12)) {
      setSolved(true);
      soundEngine.playHarmonicChord(ORGAN_TARGETS);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Állítsd be mindhárom jégsíp frekvenciáját (±12 Hz), de <span className="text-amber-300">CSAK akkor nyúlj hozzájuk</span>, amikor a katedrális üteme <span className="text-emerald-300">NYITOTT REZGÉS</span> állapotban van!
      </p>

      {/* Visual + Acoustic Silence Gate Indicator */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition-colors ${
          solved
            ? 'border-emerald-400 bg-emerald-950/35 text-emerald-200'
            : isSilenceGate
            ? 'border-amber-400 bg-amber-950/40 text-amber-200'
            : 'border-cyan-400/60 bg-cyan-950/30 text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-2 font-bold">
          <Volume2 className="w-4 h-4" />
          <span>
            {solved
              ? 'Katedrális Akkord Rögzítve'
              : isSilenceGate
              ? 'CSENDKAPU AKTÍV — Várj!'
              : 'NYITOTT REZGÉS — Hangolhatsz'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`w-3 h-3 rounded-sm ${
                s >= 4
                  ? tick === s
                    ? 'bg-amber-400'
                    : 'bg-amber-900/50'
                  : tick === s
                  ? 'bg-cyan-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pipes.map((val, idx) => {
          const ok = Math.abs(val - ORGAN_TARGETS[idx]) <= 12;
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-center">
              <div className="text-[11px] font-mono text-slate-400">
                {idx + 1}. Síp · Cél: {ORGAN_TARGETS[idx]} Hz
              </div>
              <div className={`text-sm font-mono font-bold tabular-nums ${ok ? 'text-emerald-300' : 'text-cyan-200'}`}>
                {val} Hz {ok ? '✓' : ''}
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => tunePipe(idx, -22)}
                  className="px-3.5 py-2 min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono cursor-pointer"
                >
                  −22
                </button>
                <button
                  type="button"
                  onClick={() => tunePipe(idx, 22)}
                  className="px-3.5 py-2 min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono cursor-pointer"
                >
                  +22
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && <div className="text-xs font-mono text-amber-300">{feedback}</div>}
      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200">
          ✓ A Csend Katedrálisának három orgonasípja egy tiszta akkordban szólalt meg!
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #6 VAR-ELIS · A Lélek Gépezete — SoulMachineCircuitGame
// Balance Budapest 58 BPM <-> Antarctica load across 3 bio-neural bridges
// =========================================================================
export const SoulMachineCircuitGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [valves, setValves] = useState([1, 3, 2]);
  const [carrierPulse, setCarrierPulse] = useState(50);
  const [solved, setSolved] = useState(false);

  // Target: valves = [2, 2, 2] (balanced 58 BPM resonance) and carrierPulse in 56..60
  const budapestBpm = 42 + valves[0] * 4 + valves[1] * 4 + (carrierPulse - 58);
  const antarcticaBpm = 42 + valves[1] * 4 + valves[2] * 4 - (carrierPulse - 58);
  const balanced = Math.abs(budapestBpm - 58) <= 1 && Math.abs(antarcticaBpm - 58) <= 1 && valves.every((v) => v === 2);

  const cycleValve = (idx: number) => {
    if (solved) return;
    soundEngine.playMechanicalTick(idx);
    setValves((prev) => prev.map((v, i) => (i === idx ? (v % 3) + 1 : v)));
  };

  const lockCircuit = () => {
    if (!balanced || solved) return;
    setSolved(true);
    soundEngine.playHarmonicChord([174, 348, 522]);
    onWin();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Állítsd mindhárom biomechanikus csomópontot <span className="text-cyan-300">2-es szintre</span> és a központi hordozót <span className="text-amber-300">58 BPM</span>-re, hogy Budapest és az Antarktisz ne terhelődjön túl!
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/35">
          <div className="text-slate-400">Budapest (Levente)</div>
          <div className={`text-base font-bold tabular-nums ${Math.abs(budapestBpm - 58) <= 1 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {budapestBpm} BPM
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/35">
          <div className="text-slate-400">Antarktisz (Viktor/Lena)</div>
          <div className={`text-base font-bold tabular-nums ${Math.abs(antarcticaBpm - 58) <= 1 ? 'text-emerald-300' : 'text-cyan-300'}`}>
            {antarcticaBpm} BPM
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {['I. Pesti Ideghurok', 'II. Óceáni Szinapszis', 'III. Jégmag Vezeték'].map((name, idx) => (
          <button
            key={name}
            type="button"
            disabled={solved}
            onClick={() => cycleValve(idx)}
            className={`p-3 min-h-[48px] rounded-xl border text-left text-xs font-mono cursor-pointer transition-colors ${
              valves[idx] === 2
                ? 'border-emerald-400 bg-emerald-950/30 text-emerald-100'
                : 'border-slate-700 bg-slate-950 hover:border-cyan-400 text-slate-200'
            }`}
          >
            <div className="font-bold">{name}</div>
            <div className="text-[11px] text-amber-300 mt-1 tabular-nums">Szint: {valves[idx]} / Cél: 2</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1 text-xs font-mono">
        <div className="flex justify-between text-slate-300">
          <span>Központi Hordozófrekvencia</span>
          <span className="text-cyan-300 font-bold tabular-nums">{carrierPulse} BPM</span>
        </div>
        <input
          type="range"
          min={50}
          max={66}
          step={1}
          disabled={solved}
          value={carrierPulse}
          onChange={(e) => setCarrierPulse(Number(e.target.value))}
          className="w-full accent-rose-400 cursor-pointer"
        />
      </label>

      <button
        type="button"
        disabled={!balanced || solved}
        onClick={lockCircuit}
        className={`w-full py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold uppercase ${
          solved
            ? 'bg-emerald-950/50 border border-emerald-500/45 text-emerald-200'
            : balanced
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {solved ? '✓ Életbentartó Hurok Stabilizálva' : '58 BPM Szinkron Rögzítése'}
      </button>
    </div>
  );
};

// =========================================================================
// #7 KOR-VATHA · A Fordított Ég — InvertedSkyNavigationGame
// True 6x6 Gravity-Vector sliding puzzle (Arrow keys + Touch buttons)
// Start (0,0). Goal (4,4) (NOT corner, stops on wall or rock!)
// Verified solvable in 4 flips:
// 1. Flip RIGHT -> (0,0) slides right along row 0 until hitting rock at (0,5) -> stops at (0,4)!
// 2. Flip DOWN -> (0,4) slides down col 4 -> let's put rock at (5,4)? Wait if rock at (5,4), it stops at (4,4) GOAL!
// Too short? Let's make it an authentic 5-step puzzle:
// Rocks (#): (0,4), (3,3), (4,1), (2,5), (5,4)
// Start (0,0), Goal (4,4):
// - Right -> stops at (0,3) because (0,4) is rock
// - Down -> stops at (2,3) because (3,3) is rock
// - Right -> stops at (2,4) because (2,5) is rock
// - Down -> lands on (4,4) GOAL (stopped by (5,4) rock, or stops as soon as passing through Goal? In sliding puzzles landing on goal or stopping at goal: (5,4) rock stops it cleanly ON (4,4)!).
// Wait let's make it require going to left side too so it's 5 flips:
// Rocks (#): (0,3), (4,2), (5,5), (1,4), (2,0)
// Actually let's trace carefully:
// Start (0,0):
// 1. DOWN -> stops at (1,0) [rock at (2,0)]
// 2. RIGHT -> stops at (1,3) [rock at (1,4)]
// 3. DOWN -> stops at (5,3) [bottom edge]
// 4. LEFT -> stops at (5,0) [left edge] -> wait that skips (4,4).
// Let's trace a crisp verified 5-move path to Goal (3,4):
// Grid 6x6 (rows 0..5, cols 0..5). Rocks: (0,4), (2,3), (3,0), (4,4), (1,1).
// Start (0,0):
// 1. RIGHT -> stops at (0,3) [rock at (0,4)]
// 2. DOWN -> stops at (1,3) [rock at (2,3)]
// 3. RIGHT -> stops at (1,5) [edge]
// 4. DOWN -> stops at (5,5) [edge] ... wait let's put a rock at (3,5)? No, if no rock at (3,5), from (1,5) Down goes to (5,5). What if rock at (4,5)? Then Down stops at (3,5), then LEFT from (3,5) -> slides left! If no obstacle between (3,5) and (3,0), it lands at (3,1) [stopped by (3,0)]. Still doesn't stop on (3,4) unless there's a rock at (3,3)!
// Wait if rock at (3,3): from (3,5) LEFT stops at (3,4) GOAL!
// Let's verify EVERY move of that exact board!
// Rocks: (0,4), (2,3), (4,5), (3,3)
// Start: (0,0), Goal: (3,4)
// Path:
// 1. RIGHT from (0,0): checks (0,1),(0,2),(0,3), sees rock at (0,4) -> stops at (0,3)
// 2. DOWN from (0,3): checks (1,3), sees rock at (2,3) -> stops at (1,3)
// 3. RIGHT from (1,3): checks (1,4),(1,5), edge -> stops at (1,5)
// 4. DOWN from (1,5): checks (2,5),(3,5), sees rock at (4,5) -> stops at (3,5)
// 5. LEFT from (3,5): checks (3,4), sees rock at (3,3) -> stops at (3,4) GOAL!
// 100% mathematically verified 5-step sliding solution!
// =========================================================================
const SKY_ROCKS = new Set(['0,4', '2,3', '4,5', '3,3', '4,1']);
const SKY_GOAL = { r: 3, c: 4 };

export const InvertedSkyNavigationGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  const slideGravity = useCallback(
    (dr: number, dc: number) => {
      if (solved) return;
      let { r, c } = pos;
      let moved = false;
      while (true) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr > 5 || nc < 0 || nc > 5) break;
        if (SKY_ROCKS.has(`${nr},${nc}`)) break;
        r = nr;
        c = nc;
        moved = true;
      }
      if (!moved) {
        soundEngine.playMechanicalTick(-2);
        return;
      }
      soundEngine.playMechanicalTick(1);
      setPos({ r, c });
      setMoves((m) => m + 1);
      if (r === SKY_GOAL.r && c === SKY_GOAL.c) {
        setSolved(true);
        soundEngine.playHarmonicChord([370, 555, 741]);
        onWin();
      }
    },
    [pos, solved, onWin]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        slideGravity(-1, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        slideGravity(1, 0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        slideGravity(0, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        slideGravity(0, 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slideGravity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-mono text-slate-300">
          Válts gravitációs irányt (nyílgombokkal vagy érintéssel), hogy a <span className="text-cyan-300">Fénymag (✦)</span> az <span className="text-amber-300">Égkupolába (◎)</span> csússzon!
        </p>
        <button
          type="button"
          onClick={() => {
            setPos({ r: 0, c: 0 });
            setMoves(0);
          }}
          disabled={solved}
          className="px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Újrakezdés ({moves})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <div className="grid grid-cols-6 gap-1.5 bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
          {Array.from({ length: 36 }).map((_, idx) => {
            const r = Math.floor(idx / 6);
            const c = idx % 6;
            const isPlayer = pos.r === r && pos.c === c;
            const isGoal = r === SKY_GOAL.r && c === SKY_GOAL.c;
            const isRock = SKY_ROCKS.has(`${r},${c}`);
            return (
              <div
                key={`${r}_${c}`}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-mono font-bold ${
                  isPlayer
                    ? 'border-cyan-300 bg-cyan-500/30 text-cyan-100'
                    : isGoal
                    ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                    : isRock
                    ? 'border-slate-700 bg-slate-800 text-slate-400'
                    : 'border-slate-800/80 bg-slate-900/40 text-slate-700'
                }`}
              >
                {isPlayer ? '✦' : isGoal ? '◎' : isRock ? '▲' : '·'}
              </div>
            );
          })}
        </div>

        {/* Touch & Click Directional Pad */}
        <div className="grid grid-cols-3 gap-2 w-40">
          <div />
          <button
            type="button"
            onClick={() => slideGravity(-1, 0)}
            className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-200 cursor-pointer"
            title="Gravitáció Fel"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => slideGravity(0, -1)}
            className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-200 cursor-pointer"
            title="Gravitáció Balra"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => slideGravity(1, 0)}
            className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-200 cursor-pointer"
            title="Gravitáció Le"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => slideGravity(0, 1)}
            className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-200 cursor-pointer"
            title="Gravitáció Jobbra"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200 text-center">
          ✓ Fordított ég-pálya teljesítve ({moves} gravitációs váltás)!
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #8 SEN-MARIA · A Néma Kert — SilentGardenSymbiosisGame
// Match 4 warm biological root filaments with their corresponding realms
// =========================================================================
const GARDEN_PAIRS = [
  { root: 'Kék Mélyvízi Gyökér (36.6°C)', target: 'I. Kassarah Óceánja' },
  { root: 'Krono-gyökér (11. hónap)', target: 'III. Thal-Muren Időtörése' },
  { root: 'Szinkron-rost (58 BPM)', target: 'VI. Var-Elis Gépezete' },
  { root: 'Csillag-gyökér (528 Hz)', target: 'VII. Kor-Vatha Égboltja' },
];

export const SilentGardenSymbiosisGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [selectedRootIdx, setSelectedRootIdx] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const shuffledTargets = [2, 0, 3, 1];

  const handleTargetClick = (targetIdx: number) => {
    if (solved || selectedRootIdx === null) return;
    if (selectedRootIdx === targetIdx) {
      soundEngine.playCrystalResonance(432 + matched.length * 60);
      const next = Array.from(new Set([...matched, targetIdx]));
      setMatched(next);
      setSelectedRootIdx(null);
      if (next.length === GARDEN_PAIRS.length) {
        setSolved(true);
        soundEngine.playHarmonicChord([256, 384, 528]);
        onWin();
      }
    } else {
      soundEngine.playMechanicalTick(-2);
      setSelectedRootIdx(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Válassz ki egy élő gyökérágat bal oldalon, majd kösd össze a hozzátartozó távoli birodalommal jobb oldalon!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          {GARDEN_PAIRS.map((p, idx) => {
            const done = matched.includes(idx);
            const active = selectedRootIdx === idx;
            return (
              <button
                key={p.root}
                type="button"
                disabled={done || solved}
                onClick={() => {
                  soundEngine.playUiClick();
                  setSelectedRootIdx(idx);
                }}
                className={`w-full p-3 min-h-[44px] rounded-xl border text-left text-xs font-mono cursor-pointer transition-colors ${
                  done
                    ? 'border-emerald-400 bg-emerald-950/35 text-emerald-200'
                    : active
                    ? 'border-amber-400 bg-amber-950/35 text-amber-100'
                    : 'border-slate-700 bg-slate-950 hover:border-amber-400/60 text-slate-200'
                }`}
              >
                {done ? '✓ ' : ''}{p.root}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffledTargets.map((idx) => {
            const p = GARDEN_PAIRS[idx];
            const done = matched.includes(idx);
            return (
              <button
                key={p.target}
                type="button"
                disabled={done || solved}
                onClick={() => handleTargetClick(idx)}
                className={`w-full p-3 min-h-[44px] rounded-xl border text-left text-xs font-mono cursor-pointer transition-colors ${
                  done
                    ? 'border-emerald-400 bg-emerald-950/35 text-emerald-200'
                    : 'border-slate-700 bg-slate-950 hover:border-cyan-400 text-cyan-200'
                }`}
              >
                {done ? '✓ ' : '→ '}{p.target}
              </button>
            );
          })}
        </div>
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200 text-center">
          ✓ A Néma Kert gyökérhálózata 36,6°C-os közös szívverésre kapcsolt!
        </div>
      )}
    </div>
  );
};

// =========================================================================
// #9 A KILENCEDIK · A Végtelen Küszöbe — InfiniteThresholdRecognitionGame
// Align the 4 core recognitions across all realms into the Ninth Crown
// =========================================================================
interface ThresholdSlot {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
}

const THRESHOLD_SLOTS: ThresholdSlot[] = [
  {
    id: 'slot_ocean',
    question: 'Mit tanultál Kassarah & Ir-Haya kettőséből?',
    options: ['Csak a felejtés ment meg', 'Emlékezni belégzés, elengedni kilégzés'],
    correctIdx: 1,
  },
  {
    id: 'slot_time',
    question: 'Mi a 1959-es és 1982-es expedíció valódi közös száma?',
    options: ['82.0 MHz & Δ–0 szinkron', 'Csak véletlen időjárási hiba'],
    correctIdx: 0,
  },
  {
    id: 'slot_observer',
    question: 'Honnan érkezett a kilenc birodalom apró közös nyoma?',
    options: ['Egy tizedik rejtőző őrzőtől', 'A nyitott ablak túloldalán figyelő tanútól'],
    correctIdx: 1,
  },
  {
    id: 'slot_kai',
    question: 'Mit jelent a Spirál ősi KAI-ELEN szava?',
    options: ['„Aki kérdez, az nyitja meg az ajtót”', '„Zárd be a könyvet kérdés nélkül”'],
    correctIdx: 0,
  },
];

export const InfiniteThresholdRecognitionGame: React.FC<GuardianMiniGameProps> = ({ onWin }) => {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [solved, setSolved] = useState(false);

  const selectOption = (slotId: string, optIdx: number, correctIdx: number) => {
    if (solved) return;
    if (optIdx === correctIdx) {
      soundEngine.playCrystalResonance(528 + Object.keys(picks).length * 55);
    } else {
      soundEngine.playMechanicalTick(-2);
    }
    const next = { ...picks, [slotId]: optIdx };
    setPicks(next);
    const done = THRESHOLD_SLOTS.every((s) => next[s.id] === s.correctIdx);
    if (done) {
      setSolved(true);
      soundEngine.playHarmonicChord([216, 324, 528, 741]);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-300">
        Helyezd a Kilencedik Koronájába a kilenc birodalom 4 legfőbb felismerését!
      </p>

      <div className="space-y-3">
        {THRESHOLD_SLOTS.map((slot) => {
          const picked = picks[slot.id];
          const ok = picked === slot.correctIdx;
          return (
            <div key={slot.id} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-cinzel font-bold text-cyan-200">
                <span>{slot.question}</span>
                {ok && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slot.options.map((opt, oIdx) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={solved}
                    onClick={() => selectOption(slot.id, oIdx, slot.correctIdx)}
                    className={`p-2.5 min-h-[40px] rounded-lg border text-left text-xs font-mono cursor-pointer transition-colors ${
                      picked === oIdx
                        ? oIdx === slot.correctIdx
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                          : 'border-rose-400 bg-rose-950/40 text-rose-200'
                        : 'border-slate-700 bg-slate-900 hover:border-cyan-400 text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/45 text-xs font-mono text-emerald-200 text-center">
          ✓ A Kilencedik Felismerési Mátrixa összeállt — a Küszöb készen áll a végső lépésre!
        </div>
      )}
    </div>
  );
};
