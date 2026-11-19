import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { MiniGameId } from '../types/game';
import { useGame } from '../game/GameContext';
import { soundEngine } from '../audio/SoundEngine';
import { GeoRadarScanner } from './GeoRadarScanner';
import { GUARDIANS_LIST } from '../data/storyData';
import {
  OceanMemoryDiveGame,
  DesertTraceReconstructionGame,
  TimeFractureParadoxGame,
  MirrorReflectionLabyrinthGame,
  CathedralSilenceTuningGame,
  SoulMachineCircuitGame,
  InvertedSkyNavigationGame,
  SilentGardenSymbiosisGame,
  InfiniteThresholdRecognitionGame,
} from './GuardianMiniGames';

export interface MiniGameMeta {
  id: MiniGameId;
  title: string;
  subtitle: string;
  chapterTag: string;
  reward: number;
}

export const MINI_GAME_CATALOG: MiniGameMeta[] = [
  { id: 'georadar', title: 'Georadar Szkenner Δ–82', subtitle: 'Kurzoros felszín alatti anomália-keresés', chapterTag: 'I. Antarktisz', reward: 30 },
  { id: 'sound_resonance', title: 'Hangrezonancia Hangolás', subtitle: 'Frekvencia és fázis szinkronizálása', chapterTag: 'II. Lena', reward: 25 },
  { id: 'spiral_mechanism', title: 'Négygyűrűs Spirál-zár', subtitle: 'Koncentrikus kőgyűrűk 0°-os igazítása', chapterTag: 'I. Mélykamra', reward: 25 },
  { id: 'timeline_reconstruction', title: 'Idővonal-rekonstrukció', subtitle: 'Széthullott korszakok helyreállítása', chapterTag: 'III. Thal-Muren', reward: 25 },
  { id: 'memory_reconstruction', title: 'Emlékrekonstrukció', subtitle: 'Hiányzó jegyzőkönyv-töredékek pótlása', chapterTag: 'I. Kassarah', reward: 25 },
  { id: 'gravity_puzzle', title: 'Gravitációs Pályamodul', subtitle: 'Csúszó fénymag vezetése Kódvárosban', chapterTag: 'VII. Kor-Vatha', reward: 30 },
  { id: 'spatial_maze', title: 'Álomtér Labirintus', subtitle: 'Navigáció a ködbe burkolt folyosókon', chapterTag: 'IV. Levente', reward: 25 },
  { id: 'symbol_translation', title: 'Spiráli Szimbólumfordítás', subtitle: 'Ősi fogalmak párosítása jelekkel', chapterTag: 'IV. Az-Zahir', reward: 25 },
  { id: 'light_shadow', title: 'Fény-Árnyék Tükörmátrix', subtitle: 'Prizmák forgatása a szentély magjáig', chapterTag: 'VIII. Sen-Maria', reward: 30 },
  { id: 'consciousness_trial', title: 'Tudati Légzéspróba', subtitle: 'Ritmus megtartása a zaj közepette', chapterTag: 'II. Ir-Haya', reward: 25 },
  { id: 'coordinate_triangulation', title: 'Sarki Háromszögelés', subtitle: 'Három rádiótorony metszéspontja', chapterTag: 'I. Bázis', reward: 25 },
  { id: 'crystal_resonance', title: 'Kristály-spektrum Hangolás', subtitle: '432–741 Hz jégkristály harmónia', chapterTag: 'I. Kristályér', reward: 25 },
  { id: 'reality_splice', title: 'Valóság-összeillesztés', subtitle: 'Párhuzamos terek törésvonalának zárása', chapterTag: 'V. Kódváros', reward: 30 },
  { id: 'nine_layer_final', title: 'A Kilenc Őrző Sorrendje', subtitle: 'Mind a 9 rúnaszimbólum harmonizálása', chapterTag: 'VI–IX. Végső', reward: 40 },
  { id: 'symbol_puzzle', title: 'Δ–T1 Obeliszk Spirál', subtitle: 'Az obeliszk öt belső pontjának aktiválása', chapterTag: 'I. Mélykamra', reward: 20 },
  { id: 'rings_puzzle', title: 'A Három Kör Összekapcsolása', subtitle: 'Jég, Hang és Végtelen gyűrűi', chapterTag: 'V. Kódváros', reward: 30 },
  { id: 'infinite_mirror', title: 'A Végtelen Tükrei', subtitle: 'Három belső szándék kiegyenlítése', chapterTag: 'VII. Mag', reward: 35 },
  { id: 'acoustic_phase_lock', title: 'Akusztikus Fázis-szétválasztó', subtitle: 'Hamis katonai zaj kiszűrése és 3 idősáv összehangolása', chapterTag: 'II. Lena', reward: 30 },
  { id: 'mirror_paradox', title: 'Tükörparadoxon: Valóság vs. Illúzió', subtitle: 'A Végtelen szimulált tükörképeinek felismerése', chapterTag: 'III. Mira', reward: 30 },
  { id: 'neural_key_sync', title: 'Szinkronkulcs Áramkör', subtitle: 'Viktor, Lena, Mira és Levente tudati pólusainak kötése', chapterTag: 'IV. Levente', reward: 35 },
  { id: 'echo_viaduct_tuning', title: 'Visszhang-híd Hangolása', subtitle: 'Három rézhúr-szakasz összekapcsolása Tamás és Veszta szavai között', chapterTag: 'V. Kódváros · 2. Kör', reward: 30 },
  { id: 'mirror_city_symmetry', title: 'Tükörváros Szimmetria-zár', subtitle: 'A Három Kör és a Korona tengelyeinek összehangolása', chapterTag: 'V. Kódváros · 3. Kör', reward: 35 },
  { id: 'ocean_memory_dive', title: 'Mélyvízi Emlékszonár', subtitle: 'Valódi és hamisított emlékrétegek szétválasztása', chapterTag: 'VI. Őrző #1 · Kassarah', reward: 35 },
  { id: 'desert_trace_reconstruction', title: 'Eltűnő Hamulabirintus', subtitle: 'A Felejtés Sivatagának halványuló jeleinek követése', chapterTag: 'VI. Őrző #2 · Ir-Haya', reward: 35 },
  { id: 'time_fracture_paradox', title: 'Oksági Időparadoxon', subtitle: 'A Jövő határozza meg 1959 és 1982 számlapjait', chapterTag: 'VI. Őrző #3 · Thal-Muren', reward: 35 },
  { id: 'mirror_reflection_labyrinth', title: 'Prizma-fénytörés Labirintus', subtitle: 'Smaragd kvarctükrök beállítása a hamis oszlopok között', chapterTag: 'VI. Őrző #4 · Az-Zahir', reward: 35 },
  { id: 'cathedral_silence_tuning', title: 'Néma Harang Hangolás', subtitle: 'Jégsípok hangolása a Csendkapu ritmusa mellett', chapterTag: 'VI. Őrző #5 · Nok-Tura', reward: 40 },
  { id: 'soul_machine_circuit', title: 'Biomechanikus Szinapszis', subtitle: 'Budapest és Antarktisz 58 BPM-es egyensúlyozása', chapterTag: 'VI. Őrző #6 · Var-Elis', reward: 40 },
  { id: 'inverted_sky_navigation', title: '4-Irányú Égpálya', subtitle: 'Fénymag vezetése gravitációváltással a fordított égen', chapterTag: 'VI. Őrző #7 · Kor-Vatha', reward: 40 },
  { id: 'silent_garden_symbiosis', title: 'Biolumineszcens Gyökérszimbiózis', subtitle: 'A Kilenc Birodalmat tápláló gyökerek összekötése', chapterTag: 'VI. Őrző #8 · Sen-Maria', reward: 40 },
  { id: 'infinite_threshold_recognition', title: 'A Kilencedik Felismerési Mátrix', subtitle: 'Mind a kilenc birodalom legfőbb igazságának összeillesztése', chapterTag: 'VI. Őrző #9 · A Kilencedik', reward: 45 },
];

interface GameProps {
  onWin: () => void;
}

// 1. Sound Resonance Game
const SoundResonanceGame: React.FC<GameProps> = ({ onWin }) => {
  const [freq, setFreq] = useState(2.2);
  const [amp, setAmp] = useState(0.5);
  const [phase, setPhase] = useState(0.6);
  const [solved, setSolved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetFreq = 3.4;
  const targetAmp = 0.78;
  const targetPhase = 1.9;

  const matchPct = Math.max(
    0,
    Math.round(
      100 -
        (Math.abs(freq - targetFreq) * 18 +
          Math.abs(amp - targetAmp) * 45 +
          Math.abs(phase - targetPhase) * 16)
    )
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.04;
      const w = (canvas.width = 520);
      const h = (canvas.height = 170);
      ctx.fillStyle = '#050b16';
      ctx.fillRect(0, 0, w, h);

      // Target dashed wave
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * targetFreq + targetPhase + t) * (targetAmp * 58);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Player wave
      ctx.setLineDash([]);
      ctx.strokeStyle = matchPct >= 90 ? '#34d399' : '#22d3ee';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * freq + phase + t) * (amp * 58);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [freq, amp, phase, matchPct]);

  const handleConfirm = () => {
    if (matchPct >= 90 && !solved) {
      setSolved(true);
      soundEngine.playHarmonicChord([432, 528, 639]);
      onWin();
    } else {
      soundEngine.playScannerPulse(matchPct / 100, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Igazítsd a cián hullámot a borostyán referencia-görbéhez!</span>
        <span className={`font-bold tabular-nums ${matchPct >= 90 ? 'text-emerald-400' : 'text-cyan-300'}`}>
          EGYEZÉS: {matchPct}%
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-40 rounded-xl border border-cyan-500/30" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <label className="block space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>FREKVENCIA</span>
            <span className="text-cyan-300 tabular-nums">{freq.toFixed(1)}</span>
          </div>
          <input type="range" min="1.2" max="5.0" step="0.1" value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="block space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>AMPLITÚDÓ</span>
            <span className="text-cyan-300 tabular-nums">{amp.toFixed(2)}</span>
          </div>
          <input type="range" min="0.2" max="1.0" step="0.02" value={amp} onChange={(e) => setAmp(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="block space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>FÁZIS</span>
            <span className="text-cyan-300 tabular-nums">{phase.toFixed(1)}</span>
          </div>
          <input type="range" min="0" max="3.1" step="0.1" value={phase} onChange={(e) => setPhase(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
      </div>
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => soundEngine.playCrystalResonance(220 + freq * 70)}
          className="px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 hover:text-cyan-200 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5" /> Hangteszt
        </button>
        <button
          type="button"
          disabled={matchPct < 90 || solved}
          onClick={handleConfirm}
          className={`px-5 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold uppercase ${
            solved
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
              : matchPct >= 90
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {solved ? '✓ Rezonancia Rögzítve' : 'Hullám Szinkronizálása'}
        </button>
      </div>
    </div>
  );
};

// 2. Spiral Mechanism (4 concentric rings)
const SpiralMechanismGame: React.FC<GameProps> = ({ onWin }) => {
  const [angles, setAngles] = useState([90, 210, 150, 300]);
  const [solved, setSolved] = useState(false);

  const rotateRing = (idx: number, delta: number) => {
    if (solved) return;
    soundEngine.playMechanicalTick(idx);
    setAngles((prev) => {
      const next = prev.map((a, i) => (i === idx ? (a + delta + 360) % 360 : a));
      if (next.every((a) => a === 0)) {
        setSolved(true);
        soundEngine.playHarmonicChord([432, 528, 639]);
        onWin();
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Forgasd a négy kőgyűrűt úgy, hogy mindegyik jelölés pontosan felfelé (0°) mutasson!
      </p>
      <div className="flex justify-center py-3">
        <svg viewBox="0 0 240 240" className="w-56 h-56">
          <line x1="120" y1="6" x2="120" y2="20" stroke="#34d399" strokeWidth="3" />
          {angles.map((angle, idx) => {
            const r = 95 - idx * 20;
            const aligned = angle === 0;
            return (
              <g key={idx} transform={`rotate(${angle} 120 120)`}>
                <circle
                  cx="120"
                  cy="120"
                  r={r}
                  fill="none"
                  stroke={aligned ? '#34d399' : '#22d3ee'}
                  strokeOpacity={aligned ? 0.95 : 0.45}
                  strokeWidth="6"
                  strokeDasharray="18 6"
                />
                <circle cx="120" cy={120 - r} r="5" fill={aligned ? '#34d399' : '#f59e0b'} />
              </g>
            );
          })}
          <circle cx="120" cy="120" r="10" fill={solved ? '#34d399' : '#0ea5e9'} />
        </svg>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {angles.map((angle, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-center space-y-2">
            <div className="text-[11px] font-mono text-slate-400">
              {idx + 1}. Gyűrű · <span className={angle === 0 ? 'text-emerald-400 font-bold' : 'text-cyan-300'}>{angle}°</span>
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => rotateRing(idx, -30)}
                className="p-2 min-h-[40px] min-w-[40px] bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded cursor-pointer flex items-center justify-center"
                title="Balra 30°"
              >
                <RotateCcw className="w-4 h-4 text-cyan-300" />
              </button>
              <button
                type="button"
                onClick={() => rotateRing(idx, 30)}
                className="p-2 min-h-[40px] min-w-[40px] bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded cursor-pointer flex items-center justify-center"
                title="Jobbra 30°"
              >
                <RotateCw className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {solved && (
        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3 text-center">
          ✓ Mind a négy gyűrű 0°-ra állt — a subglaciális zárszerkezet kinyílt!
        </div>
      )}
    </div>
  );
};

// 3. Timeline Reconstruction
const TIMELINE_CORRECT = [
  { id: 't1', year: '1959. Nov. 04.', text: 'Dr. Kovács Áron mérései: az első visszafelé járó kronométer a jég alatt.' },
  { id: 't2', year: '1982. Okt. 14.', text: 'Viktor georadarja rögzíti a 3200 méteres spirális kamrát (82°16’S).' },
  { id: 't3', year: '1982. Okt. 19.', text: 'A Δ–T1 fekete obeliszk érintése áttöri a korszakok falát.' },
  { id: 't4', year: '1983. Jan. 12.', text: 'Dr. Lena V. laborjában felveszi a 142.8 MHz-es üzenetet Viktor számára.' },
];

const TimelineReconstructionGame: React.FC<GameProps> = ({ onWin }) => {
  const [items, setItems] = useState([
    TIMELINE_CORRECT[2],
    TIMELINE_CORRECT[0],
    TIMELINE_CORRECT[3],
    TIMELINE_CORRECT[1],
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleCardClick = (idx: number) => {
    if (solved) return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      soundEngine.playUiClick();
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }
    const next = [...items];
    const tmp = next[selectedIdx];
    next[selectedIdx] = next[idx];
    next[idx] = tmp;
    setItems(next);
    setSelectedIdx(null);
    soundEngine.playMechanicalTick(1);

    if (next.every((it, i) => it.id === TIMELINE_CORRECT[i].id)) {
      setSolved(true);
      soundEngine.playHarmonicChord([432, 528]);
      onWin();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-400">
        Kattints két eseményre a cseréhez, amíg helyes időrendbe (1959 → 1983) nem kerülnek!
      </p>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isCorrectPos = item.id === TIMELINE_CORRECT[idx].id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardClick(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                selectedIdx === idx
                  ? 'border-amber-400 bg-amber-950/30'
                  : solved || isCorrectPos
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-700 bg-slate-950/70 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">{idx + 1}. {item.year}</span>
                {isCorrectPos && <span className="text-emerald-400 text-[11px]">✓ Helyén</span>}
              </div>
              <p className="text-xs text-slate-300 mt-1">{item.text}</p>
            </button>
          );
        })}
      </div>
      {solved && (
        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3 text-center">
          ✓ Oksági idővonal helyreállítva!
        </div>
      )}
    </div>
  );
};

// 4. Memory Reconstruction (Fill blanks)
const MEMORY_WORDS = ['rezonátor', '82.', 'döntéseinek', 'holnap'];
const MEMORY_BANK = ['holnap', 'jéghegy', 'rezonátor', 'döntéseinek', '82.', 'csend'];

const MemoryReconstructionGame: React.FC<GameProps> = ({ onWin }) => {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [solved, setSolved] = useState(false);

  const assignWord = (word: string) => {
    if (solved) return;
    soundEngine.playUiClick();
    const next = [...slots];
    next[activeSlot] = word;
    setSlots(next);
    const nextEmpty = next.findIndex((s) => s === null);
    if (nextEmpty !== -1) setActiveSlot(nextEmpty);

    if (next.every((w, i) => w === MEMORY_WORDS[i])) {
      setSolved(true);
      soundEngine.playHarmonicChord([432, 528]);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Válassz egy üres helyet a szövegben, majd kattints a megfelelő hiányzó szóra!
      </p>
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm leading-loose text-slate-200">
        „A jég nem fagyott víz. A jég csak egy{' '}
        {[0, 1, 2, 3].map((idx) => (
          <React.Fragment key={idx}>
            {idx === 0 && (
              <button
                type="button"
                onClick={() => setActiveSlot(0)}
                className={`px-2 py-0.5 mx-1 rounded border font-mono text-xs cursor-pointer ${
                  activeSlot === 0 ? 'border-amber-400 bg-amber-950/40 text-amber-200' : 'border-cyan-500/40 bg-slate-900 text-cyan-300'
                }`}
              >
                {slots[0] || '[ 1. szó ]'}
              </button>
            )}
            {idx === 0 && '. Minden ember, aki a '}
            {idx === 1 && (
              <button
                type="button"
                onClick={() => setActiveSlot(1)}
                className={`px-2 py-0.5 mx-1 rounded border font-mono text-xs cursor-pointer ${
                  activeSlot === 1 ? 'border-amber-400 bg-amber-950/40 text-amber-200' : 'border-cyan-500/40 bg-slate-900 text-cyan-300'
                }`}
              >
                {slots[1] || '[ 2. szó ]'}
              </button>
            )}
            {idx === 1 && ' szélességi kör közelébe jött, itt hagyta a '}
            {idx === 2 && (
              <button
                type="button"
                onClick={() => setActiveSlot(2)}
                className={`px-2 py-0.5 mx-1 rounded border font-mono text-xs cursor-pointer ${
                  activeSlot === 2 ? 'border-amber-400 bg-amber-950/40 text-amber-200' : 'border-cyan-500/40 bg-slate-900 text-cyan-300'
                }`}
              >
                {slots[2] || '[ 3. szó ]'}
              </button>
            )}
            {idx === 2 && ' lenyomatát. Ha lehunyom a szemem, látom azt, amit '}
            {idx === 3 && (
              <button
                type="button"
                onClick={() => setActiveSlot(3)}
                className={`px-2 py-0.5 mx-1 rounded border font-mono text-xs cursor-pointer ${
                  activeSlot === 3 ? 'border-amber-400 bg-amber-950/40 text-amber-200' : 'border-cyan-500/40 bg-slate-900 text-cyan-300'
                }`}
              >
                {slots[3] || '[ 4. szó ]'}
              </button>
            )}
          </React.Fragment>
        ))}{' '}
        fog elhatározni.”
      </div>
      <div className="flex flex-wrap gap-2">
        {MEMORY_BANK.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => assignWord(word)}
            className="px-3 py-2 min-h-[40px] rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-xs font-mono text-cyan-200 cursor-pointer"
          >
            {word}
          </button>
        ))}
      </div>
      {solved && (
        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3">
          ✓ Dr. Lena eredeti akusztikai jegyzőkönyve helyreállítva!
        </div>
      )}
    </div>
  );
};

// 5. Gravity Puzzle (Sliding light orb in 5x5 Kódváros grid)
const GRAV_WALLS = new Set(['0,3', '1,1', '2,4', '3,0', '3,2']);
const GRAV_GOAL = { x: 4, y: 1 };

const GravityPuzzleGame: React.FC<GameProps> = ({ onWin }) => {
  const [orb, setOrb] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  const slide = (dx: number, dy: number) => {
    if (solved) return;
    let cx = orb.x;
    let cy = orb.y;
    while (true) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx > 4 || ny < 0 || ny > 4 || GRAV_WALLS.has(`${nx},${ny}`)) break;
      cx = nx;
      cy = ny;
      if (cx === GRAV_GOAL.x && cy === GRAV_GOAL.y) break;
    }
    if (cx !== orb.x || cy !== orb.y) {
      setOrb({ x: cx, y: cy });
      setMoves((m) => m + 1);
      soundEngine.playMechanicalTick(1);
      if (cx === GRAV_GOAL.x && cy === GRAV_GOAL.y) {
        setSolved(true);
        soundEngine.playHarmonicChord([432, 528, 639]);
        onWin();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Válts gravitációs irányt: a fénymag az első falig csúszik!</span>
        <span className="text-cyan-300 tabular-nums">Lépések: {moves}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
          {Array.from({ length: 25 }).map((_, i) => {
            const x = i % 5;
            const y = Math.floor(i / 5);
            const isWall = GRAV_WALLS.has(`${x},${y}`);
            const isOrb = orb.x === x && orb.y === y;
            const isGoal = GRAV_GOAL.x === x && GRAV_GOAL.y === y;
            return (
              <div
                key={i}
                className={`w-10 h-10 rounded flex items-center justify-center border text-sm ${
                  isWall
                    ? 'bg-slate-800 border-slate-700'
                    : isOrb
                    ? 'bg-cyan-500/30 border-cyan-300 text-cyan-200'
                    : isGoal
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900/70 border-slate-800/70'
                }`}
              >
                {isOrb ? '●' : isGoal ? '◎' : isWall ? '■' : ''}
              </div>
            );
          })}
        </div>
        <div className="space-y-2 text-center">
          <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto">
            <div />
            <button type="button" onClick={() => slide(0, -1)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowUp className="w-4 h-4 text-cyan-300" /></button>
            <div />
            <button type="button" onClick={() => slide(-1, 0)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowLeft className="w-4 h-4 text-cyan-300" /></button>
            <button type="button" onClick={() => { setOrb({ x: 0, y: 0 }); setMoves(0); setSolved(false); }} className="p-2.5 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 rounded-lg cursor-pointer">Újra</button>
            <button type="button" onClick={() => slide(1, 0)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowRight className="w-4 h-4 text-cyan-300" /></button>
            <div />
            <button type="button" onClick={() => slide(0, 1)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowDown className="w-4 h-4 text-cyan-300" /></button>
            <div />
          </div>
          {solved && <div className="text-xs font-mono text-emerald-300">✓ Kapu elérve!</div>}
        </div>
      </div>
    </div>
  );
};

// 6. Spatial Maze (6x6 Fog-of-war dream maze)
const MAZE_WALLS = new Set(['1,0', '1,1', '3,1', '3,2', '3,3', '1,3', '1,4', '4,4', '2,5']);
const MAZE_GOAL = { x: 5, y: 5 };

const SpatialMazeGame: React.FC<GameProps> = ({ onWin }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visited, setVisited] = useState<Set<string>>(() => new Set(['0,0']));
  const [solved, setSolved] = useState(false);

  const step = (dx: number, dy: number) => {
    if (solved) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || nx > 5 || ny < 0 || ny > 5 || MAZE_WALLS.has(`${nx},${ny}`)) {
      soundEngine.playMechanicalTick(-2);
      return;
    }
    setPos({ x: nx, y: ny });
    setVisited((prev) => new Set(prev).add(`${nx},${ny}`));
    const dist = Math.abs(MAZE_GOAL.x - nx) + Math.abs(MAZE_GOAL.y - ny);
    soundEngine.playScannerPulse(Math.max(0.15, 1 - dist / 10), (nx / 5) * 2 - 1);
    if (nx === MAZE_GOAL.x && ny === MAZE_GOAL.y) {
      setSolved(true);
      soundEngine.playHarmonicChord([432, 528]);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Keresd meg Levente álomlabirintusának kijáratát (5,5)!</span>
        <span className="text-cyan-300 tabular-nums">
          Távolság a jeladótól: {Math.abs(MAZE_GOAL.x - pos.x) + Math.abs(MAZE_GOAL.y - pos.y)}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="grid grid-cols-6 gap-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
          {Array.from({ length: 36 }).map((_, i) => {
            const x = i % 6;
            const y = Math.floor(i / 6);
            const near = Math.abs(x - pos.x) + Math.abs(y - pos.y) <= 1;
            const seen = visited.has(`${x},${y}`) || near || solved;
            const isWall = MAZE_WALLS.has(`${x},${y}`);
            const isHere = pos.x === x && pos.y === y;
            const isGoal = MAZE_GOAL.x === x && MAZE_GOAL.y === y;
            return (
              <div
                key={i}
                className={`w-9 h-9 rounded flex items-center justify-center border text-xs ${
                  !seen
                    ? 'bg-slate-950 border-slate-900 text-slate-800'
                    : isWall
                    ? 'bg-slate-800 border-slate-700'
                    : isHere
                    ? 'bg-cyan-500/30 border-cyan-300 text-cyan-200'
                    : isGoal
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {isHere ? '◈' : isGoal && seen ? '★' : ''}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button type="button" onClick={() => step(0, -1)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowUp className="w-4 h-4 text-cyan-300" /></button>
          <div />
          <button type="button" onClick={() => step(-1, 0)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowLeft className="w-4 h-4 text-cyan-300" /></button>
          <button type="button" onClick={() => { setPos({ x: 0, y: 0 }); setSolved(false); }} className="p-2.5 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 rounded-lg cursor-pointer">Újra</button>
          <button type="button" onClick={() => step(1, 0)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowRight className="w-4 h-4 text-cyan-300" /></button>
          <div />
          <button type="button" onClick={() => step(0, 1)} className="p-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-lg cursor-pointer flex justify-center"><ArrowDown className="w-4 h-4 text-cyan-300" /></button>
          <div />
        </div>
      </div>
      {solved && <div className="text-xs font-mono text-emerald-300 text-center">✓ Álomtér átjáró megtalálva!</div>}
    </div>
  );
};

// 7. Symbol Translation
const GLYPH_PAIRS = [
  { glyph: 'KAI-ELEN', meaning: 'Aki kérdez, az nyitja az ajtót', clue: 'Mira Második Kapujának kulcsszava' },
  { glyph: 'VIK-TARA', meaning: 'Az első lépés a fagy alá', clue: 'Az 1959-es expedíció jele' },
  { glyph: 'KRIS-ALEN', meaning: 'Emlékező kristályszövet', clue: '432 Hz-es jégréteg neve' },
  { glyph: 'KASS-HAYA', meaning: 'Az egyensúly két üteme', clue: 'Kassarah és Ir-Haya kettőse' },
];

const SymbolTranslationGame: React.FC<GameProps> = ({ onWin }) => {
  const [selectedGlyph, setSelectedGlyph] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shuffledMeanings = [
    GLYPH_PAIRS[2].meaning,
    GLYPH_PAIRS[0].meaning,
    GLYPH_PAIRS[3].meaning,
    GLYPH_PAIRS[1].meaning,
  ];

  const handleSelectMeaning = (meaning: string) => {
    if (!selectedGlyph) return;
    const pair = GLYPH_PAIRS.find((p) => p.glyph === selectedGlyph);
    if (pair && pair.meaning === meaning) {
      soundEngine.playDiscovery();
      const next = [...matched, pair.glyph];
      setMatched(next);
      setSelectedGlyph(null);
      setErrorMsg(null);
      if (next.length === GLYPH_PAIRS.length) onWin();
    } else {
      soundEngine.playMechanicalTick(-2);
      setErrorMsg('Ez a jelentés egy másik Spirál-gyökből származik.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Válassz balról egy ősi Spirál-szót, majd párosítsd a jobb oldali fordításával!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          {GLYPH_PAIRS.map((p) => {
            const done = matched.includes(p.glyph);
            return (
              <button
                key={p.glyph}
                type="button"
                disabled={done}
                onClick={() => { setSelectedGlyph(p.glyph); setErrorMsg(null); soundEngine.playUiClick(); }}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : selectedGlyph === p.glyph
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-500/40'
                }`}
              >
                <div className="text-sm font-cinzel font-bold">{p.glyph}</div>
                <div className="text-[11px] font-mono text-slate-400">{p.clue}</div>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffledMeanings.map((meaning) => {
            const pair = GLYPH_PAIRS.find((p) => p.meaning === meaning);
            const done = pair ? matched.includes(pair.glyph) : false;
            return (
              <button
                key={meaning}
                type="button"
                disabled={done}
                onClick={() => handleSelectMeaning(meaning)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-colors cursor-pointer ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-amber-400/50'
                }`}
              >
                {done ? `✓ ${meaning}` : meaning}
              </button>
            );
          })}
        </div>
      </div>
      {errorMsg && <div className="text-xs font-mono text-amber-300">{errorMsg}</div>}
      {matched.length === GLYPH_PAIRS.length && (
        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3">
          ✓ Spirálnyelv alapfok dekódolva!
        </div>
      )}
    </div>
  );
};

// 8. Light & Shadow Mirror Matrix (4x4)
const LightShadowGame: React.FC<GameProps> = ({ onWin }) => {
  // Types: '.' empty, '/' mirror, '\' mirror
  const [grid, setGrid] = useState<string[][]>([
    ['.', '/', '.', '\\'],
    ['.', '.', '\\', '.'],
    ['.', '\\', '.', '/'],
    ['.', '.', '.', '.'],
  ]);
  const [solved, setSolved] = useState(false);

  // Trace beam starting at row 1, col 0 moving Right (dx=1, dy=0) -> target is bottom-right (col 3, row 2) or col 3, row 3
  const computePath = (g: string[][]) => {
    const path: { r: number; c: number }[] = [];
    let r = 1;
    let c = 0;
    let dr = 0;
    let dc = 1;
    let reached = false;
    for (let step = 0; step < 24; step++) {
      if (r < 0 || r > 3 || c < 0 || c > 3) break;
      path.push({ r, c });
      if (r === 2 && c === 3) {
        reached = true;
        break;
      }
      const cell = g[r][c];
      if (cell === '/') {
        const ndr = -dc;
        const ndc = -dr;
        dr = ndr;
        dc = ndc;
      } else if (cell === '\\') {
        const ndr = dc;
        const ndc = dr;
        dr = ndr;
        dc = ndc;
      }
      r += dr;
      c += dc;
    }
    return { path, reached };
  };

  const { path, reached } = computePath(grid);

  const toggleCell = (r: number, c: number) => {
    if (solved || (r === 1 && c === 0) || (r === 2 && c === 3)) return;
    soundEngine.playMechanicalTick(1);
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const curr = next[r][c];
      next[r][c] = curr === '.' ? '/' : curr === '/' ? '\\' : '.';
      const check = computePath(next);
      if (check.reached) {
        setSolved(true);
        soundEngine.playHarmonicChord([528, 639]);
        onWin();
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Kattints a mezőkre prizma elhelyezéséhez vagy forgatásához (/ ↔ \). Vezesd a fénysugarat a jobb szélső kristályig!
      </p>
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const lit = path.some((p) => p.r === r && p.c === c);
              const isEmitter = r === 1 && c === 0;
              const isReceptor = r === 2 && c === 3;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => toggleCell(r, c)}
                  className={`w-14 h-14 rounded-lg border font-mono text-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isReceptor
                      ? reached
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-500/60 text-amber-300'
                      : isEmitter
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                      : lit
                      ? 'bg-cyan-950/60 border-cyan-400/70 text-cyan-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500/40'
                  }`}
                >
                  {isEmitter ? '→☀' : isReceptor ? '◈' : cell === '.' ? '' : cell}
                </button>
              );
            })
          )}
        </div>
      </div>
      {solved && <div className="text-xs font-mono text-emerald-300 text-center">✓ A fénysugár elérte Sen-Maria szívkristályát!</div>}
    </div>
  );
};

// 9. Consciousness Trial (Breath sync hold & shadow clear)
const ConsciousnessTrialGame: React.FC<GameProps> = ({ onWin }) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!holding || solved) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4);
        if (next >= 100) {
          setSolved(true);
          setHolding(false);
          soundEngine.playHarmonicChord([432, 528]);
          onWin();
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [holding, solved, onWin]);

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs font-mono text-slate-400">
        Tartsd lenyomva a gombot, hogy lecsendesítsd a fekete hó zaját és szinkronizáld a Jéglégzést!
      </p>
      <div className="max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="text-2xl font-cinzel font-bold text-cyan-300 tabular-nums">{progress}%</div>
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-cyan-400 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          onPointerDown={() => { if (!solved) { setHolding(true); soundEngine.playCrystalResonance(432); } }}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          className={`w-full py-3 min-h-[44px] rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer ${
            solved
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
              : holding
              ? 'bg-cyan-400 text-slate-950'
              : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200'
          }`}
        >
          {solved ? '✓ Csend Megteremtve' : holding ? 'Légzés Szinkronizálása...' : 'Tartsd Lenyomva a Belégzéshez'}
        </button>
      </div>
    </div>
  );
};

// 10. Coordinate Triangulation (3 radar tower angles)
const CoordinateTriangulationGame: React.FC<GameProps> = ({ onWin }) => {
  const [b1, setB1] = useState(25);
  const [b2, setB2] = useState(110);
  const [b3, setB3] = useState(290);
  const [solved, setSolved] = useState(false);

  // Target center is (160, 100); Towers at T1(40,170), T2(280,170), T3(160,20)
  // Ideal bearings in screen coords (deg clockwise from East): T1->-30deg, T2->-150deg, T3->90deg
  const t1 = { x: 50, y: 165, targetDeg: -28 };
  const t2 = { x: 270, y: 165, targetDeg: -152 };
  const t3 = { x: 160, y: 20, targetDeg: 90 };

  const err =
    Math.abs(b1 - t1.targetDeg) + Math.abs(b2 - t2.targetDeg) + Math.abs(b3 - t3.targetDeg);
  const aligned = err <= 14;

  const confirmTriangulation = () => {
    if (aligned && !solved) {
      setSolved(true);
      soundEngine.playHarmonicChord([432, 528]);
      onWin();
    } else {
      soundEngine.playMechanicalTick(-1);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Forgasd a 3 sarki mérőtorony sugarát, hogy mindhárom metssze a középső Δ–82 célpontot!
      </p>
      <div className="flex justify-center">
        <svg viewBox="0 0 320 190" className="w-full max-w-md bg-slate-950 rounded-xl border border-slate-800">
          <circle cx="160" cy="100" r="14" fill="none" stroke={aligned ? '#34d399' : '#f59e0b'} strokeDasharray="3 3" strokeWidth="1.5" />
          <circle cx="160" cy="100" r="3" fill={aligned ? '#34d399' : '#f59e0b'} />
          {[
            { ...t1, deg: b1, label: 'A' },
            { ...t2, deg: b2, label: 'B' },
            { ...t3, deg: b3, label: 'C' },
          ].map((tw) => {
            const rad = (tw.deg * Math.PI) / 180;
            const ex = tw.x + Math.cos(rad) * 260;
            const ey = tw.y + Math.sin(rad) * 260;
            return (
              <g key={tw.label}>
                <line x1={tw.x} y1={tw.y} x2={ex} y2={ey} stroke={aligned ? '#34d399' : '#22d3ee'} strokeOpacity="0.7" strokeWidth="1.6" />
                <circle cx={tw.x} cy={tw.y} r="6" fill="#0ea5e9" />
                <text x={tw.x + 8} y={tw.y + 4} fill="#cbd5e1" fontSize="10" fontFamily="monospace">{tw.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>A Torony</span><span className="text-cyan-300 tabular-nums">{b1}°</span></div>
          <input type="range" min="-70" max="20" value={b1} onChange={(e) => setB1(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>B Torony</span><span className="text-cyan-300 tabular-nums">{b2}°</span></div>
          <input type="range" min="-190" max="-100" value={b2} onChange={(e) => setB2(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>C Torony</span><span className="text-cyan-300 tabular-nums">{b3}°</span></div>
          <input type="range" min="45" max="135" value={b3} onChange={(e) => setB3(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
      </div>
      <button
        type="button"
        disabled={!aligned || solved}
        onClick={confirmTriangulation}
        className={`w-full py-2.5 min-h-[40px] rounded-lg text-xs font-mono font-bold uppercase ${
          solved
            ? 'bg-emerald-900/50 text-emerald-300'
            : aligned
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {solved ? '✓ Háromszögelés Kész (82°16’S)' : 'Metszéspont Rögzítése'}
      </button>
    </div>
  );
};

// 11. Crystal Resonance (4 crystal bars matching target frequencies)
const CRYSTAL_TARGETS = [432, 528, 639, 741];
const CrystalResonanceGame: React.FC<GameProps> = ({ onWin }) => {
  const [vals, setVals] = useState([396, 480, 600, 690]);
  const [solved, setSolved] = useState(false);

  const adjust = (idx: number, delta: number) => {
    if (solved) return;
    setVals((prev) => {
      const next = prev.map((v, i) => (i === idx ? Math.max(300, Math.min(850, v + delta)) : v));
      soundEngine.playCrystalResonance(next[idx]);
      if (next.every((v, i) => Math.abs(v - CRYSTAL_TARGETS[i]) <= 12)) {
        setSolved(true);
        soundEngine.playHarmonicChord(CRYSTAL_TARGETS);
        onWin();
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Hangold a négy jégkristályt a szaggatott célsávokra (432, 528, 639, 741 Hz)!
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {vals.map((val, idx) => {
          const target = CRYSTAL_TARGETS[idx];
          const ok = Math.abs(val - target) <= 12;
          return (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <div className="text-[11px] font-mono text-slate-400">Cél: {target} Hz</div>
              <div className={`text-sm font-mono font-bold tabular-nums ${ok ? 'text-emerald-400' : 'text-cyan-300'}`}>
                {val} Hz
              </div>
              <div className="h-24 bg-slate-900 rounded relative overflow-hidden flex items-end justify-center">
                <div
                  className="absolute inset-x-0 border-t-2 border-dashed border-amber-400/70"
                  style={{ bottom: `${((target - 300) / 550) * 100}%` }}
                />
                <div
                  className={`w-8 rounded-t transition-all ${ok ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                  style={{ height: `${((val - 300) / 550) * 100}%` }}
                />
              </div>
              <div className="flex justify-center gap-2">
                <button type="button" onClick={() => adjust(idx, -18)} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono cursor-pointer">-</button>
                <button type="button" onClick={() => adjust(idx, 18)} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono cursor-pointer">+</button>
              </div>
            </div>
          );
        })}
      </div>
      {solved && <div className="text-xs font-mono text-emerald-300 text-center">✓ Kristály-harmónia aktív!</div>}
    </div>
  );
};

// 12. Reality Splice (Align fractured layer)
const RealitySpliceGame: React.FC<GameProps> = ({ onWin }) => {
  const [dx, setDx] = useState(28);
  const [dy, setDy] = useState(-18);
  const [rot, setRot] = useState(18);
  const [solved, setSolved] = useState(false);

  const aligned = Math.abs(dx) <= 4 && Math.abs(dy) <= 4 && Math.abs(rot) <= 3;

  const lockSeam = () => {
    if (aligned && !solved) {
      setSolved(true);
      soundEngine.playTimelineShift();
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Igazítsd egymásra a két szétcsúszott Kódváros-réteget a nullpontra!
      </p>
      <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
        <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-400/70 flex items-center justify-center font-cinzel text-amber-300">
          Δ–9
        </div>
        <div
          className={`w-28 h-28 rounded-full border-2 absolute flex items-center justify-center font-cinzel transition-colors ${
            aligned ? 'border-emerald-400 text-emerald-300' : 'border-cyan-400 text-cyan-300'
          }`}
          style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}
        >
          Δ–9
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>X eltolás</span><span className="tabular-nums">{dx}px</span></div>
          <input type="range" min="-45" max="45" value={dx} onChange={(e) => setDx(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>Y eltolás</span><span className="tabular-nums">{dy}px</span></div>
          <input type="range" min="-35" max="35" value={dy} onChange={(e) => setDy(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
        <label className="space-y-1">
          <div className="flex justify-between text-slate-400"><span>Szög</span><span className="tabular-nums">{rot}°</span></div>
          <input type="range" min="-30" max="30" value={rot} onChange={(e) => setRot(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
        </label>
      </div>
      <button
        type="button"
        disabled={!aligned || solved}
        onClick={lockSeam}
        className={`w-full py-2.5 min-h-[40px] rounded-lg text-xs font-mono font-bold uppercase ${
          solved
            ? 'bg-emerald-900/50 text-emerald-300'
            : aligned
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {solved ? '✓ Valóság-törés Lezárva' : 'Törésvonal Összeillesztése'}
      </button>
    </div>
  );
};

// 13. Nine Layer Final Puzzle (Sequence all 9 Guardian runes Ψ–1 .. Δ–9)
const NineLayerFinalGame: React.FC<GameProps> = ({ onWin }) => {
  const [activatedIds, setActivatedIds] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const shuffled = [3, 7, 1, 9, 4, 2, 8, 5, 6].map((id) => GUARDIANS_LIST.find((g) => g.id === id)!);

  const tapGuardian = (id: number) => {
    if (solved) return;
    const expected = activatedIds.length + 1;
    if (id === expected) {
      soundEngine.playCrystalResonance(380 + id * 45);
      const next = [...activatedIds, id];
      setActivatedIds(next);
      if (next.length === 9) {
        setSolved(true);
        soundEngine.playHarmonicChord([432, 528, 639, 741]);
        onWin();
      }
    } else {
      soundEngine.playMechanicalTick(-2);
      setActivatedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Aktiváld mind a Kilenc Őrző szimbólumát növekvő sorrendben (#1 Kassarah → #9 A Kilencedik)!
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {shuffled.map((g) => {
          const active = activatedIds.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => tapGuardian(g.id)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                active
                  ? 'border-emerald-400 bg-emerald-950/30 text-emerald-200'
                  : 'border-slate-700 bg-slate-950 hover:border-cyan-400/60 text-slate-200'
              }`}
            >
              <div className="text-base font-mono font-bold text-cyan-300">{g.symbol}</div>
              <div className="text-xs font-cinzel font-semibold mt-0.5">{g.name}</div>
            </button>
          );
        })}
      </div>
      <div className="text-xs font-mono text-slate-400 text-center tabular-nums">
        Aktivált rúnák: {activatedIds.length} / 9
      </div>
    </div>
  );
};

// 14. Symbol Puzzle (Δ–T1 5 inward nodes)
const SymbolObeliskGame: React.FC<GameProps> = ({ onWin }) => {
  const [step, setStep] = useState(0);
  const solved = step >= 5;
  const nodes = [
    { x: 140, y: 20, label: 'Külső Küszöb' },
    { x: 215, y: 95, label: 'Fagy Hulláma' },
    { x: 155, y: 170, label: '1959 Visszhang' },
    { x: 75, y: 115, label: 'Tudat Hídja' },
    { x: 120, y: 100, label: 'Δ–T1 Mag' },
  ];

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs font-mono text-slate-400">
        Érintsd meg sorrendben a fekete obeliszk spirális csomópontjait kívülről befelé (1 → 5)!
      </p>
      <div className="flex justify-center">
        <svg viewBox="0 0 260 200" className="w-72 h-52 bg-slate-950 rounded-xl border border-slate-800">
          {nodes.map((n, idx) => {
            const done = idx < step;
            const current = idx === step;
            return (
              <g key={idx} onClick={() => {
                if (idx === step) {
                  const next = step + 1;
                  setStep(next);
                  soundEngine.playCrystalResonance(400 + next * 50);
                  if (next === 5) onWin();
                }
              }} className="cursor-pointer">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={current ? 16 : 13}
                  fill={done ? '#34d399' : current ? '#22d3ee' : '#1e293b'}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill={done || current ? '#020617' : '#94a3b8'} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {solved && <div className="text-xs font-mono text-emerald-300">✓ Δ–T1 Obeliszk szinkronizálva!</div>}
    </div>
  );
};

// 15. Rings Puzzle & Infinite Mirror
const ThreeRingsAlignGame: React.FC<GameProps> = ({ onWin }) => {
  const [locks, setLocks] = useState([false, false, false]);
  const rings = [
    { name: '1. Kör: A Jég Emléke', desc: 'Kassarah fagyott emlékgömbjeinek felébresztése' },
    { name: '2. Kör: A Hangok Alagútja', desc: 'Nok-Tura hamis visszhangjainak kiszűrése' },
    { name: '3. Kör: A Végtelen Szeme', desc: 'A tudat középpontjának kinyitása' },
  ];

  const activate = (idx: number) => {
    soundEngine.playCrystalResonance(432 + idx * 96);
    setLocks((prev) => {
      const next = prev.map((v, i) => (i === idx ? true : v));
      if (next.every(Boolean)) onWin();
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-400">
        Aktiváld mindhárom kódfordulatot a Három Kör összekapcsolásához!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rings.map((ring, idx) => (
          <button
            key={ring.name}
            type="button"
            onClick={() => activate(idx)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              locks[idx]
                ? 'border-emerald-400 bg-emerald-950/30'
                : 'border-cyan-500/30 bg-slate-950 hover:border-cyan-400'
            }`}
          >
            <div className="text-xs font-mono font-bold text-cyan-300">{ring.name}</div>
            <p className="text-xs text-slate-400 mt-1">{ring.desc}</p>
            <div className="text-[11px] font-mono mt-3 text-emerald-300">
              {locks[idx] ? '✓ Hangolva' : 'Kattints a hangoláshoz →'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 16. Acoustic Phase Lock (Lena Chapter: Filter noise & lock 3 temporal channels)
const ACOUSTIC_TARGETS = [2, 4, 3];
const AcousticPhaseLockGame: React.FC<GameProps> = ({ onWin }) => {
  const [phases, setPhases] = useState([0, 1, 5]);
  const [noiseMuted, setNoiseMuted] = useState([false, false]);
  const [solved, setSolved] = useState(false);

  const phasesAligned = phases.every((p, i) => p === ACOUSTIC_TARGETS[i]);
  const cleanSignal = noiseMuted.every(Boolean);
  const ready = phasesAligned && cleanSignal;

  const updatePhase = (idx: number, val: number) => {
    if (solved) return;
    soundEngine.playCrystalResonance(320 + val * 55 + idx * 40);
    setPhases((prev) => prev.map((p, i) => (i === idx ? val : p)));
  };

  const toggleNoise = (idx: number) => {
    if (solved) return;
    soundEngine.playMechanicalTick(idx);
    setNoiseMuted((prev) => prev.map((m, i) => (i === idx ? !m : m)));
  };

  const confirmLock = () => {
    if (!ready || solved) return;
    setSolved(true);
    soundEngine.playHarmonicChord([432, 528, 639]);
    onWin();
  };

  const channelNames = ['Viktor (1982 · 82.0 MHz)', 'Lena (1979 · Projekt Δ–0)', 'Mira (Időtlen · 142.8 MHz)'];

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Némítsd le a két hamis interferencia-csatornát, majd állítsd mindhárom idősáv fázisát a közös 0-csúcsra ({ACOUSTIC_TARGETS.join(' / ')})!
      </p>

      {/* Oscilloscope Preview */}
      <svg viewBox="0 0 360 110" className="w-full h-28 bg-slate-950 rounded-xl border border-cyan-500/30">
        <line x1="0" y1="55" x2="360" y2="55" stroke="#1e293b" strokeWidth="1" />
        {[0, 1, 2].map((idx) => {
          const offset = phases[idx] - ACOUSTIC_TARGETS[idx];
          const ok = offset === 0;
          const colors = ['#22d3ee', '#a78bfa', '#fbbf24'];
          const pts: string[] = [];
          for (let x = 0; x <= 360; x += 6) {
            const amp = cleanSignal ? 22 : 16 + (idx % 2) * 8;
            const noise = cleanSignal ? 0 : Math.sin(x * 0.4 + idx) * 7;
            const y = 55 + Math.sin((x / 360) * Math.PI * 4 + offset * 0.9) * amp + noise;
            pts.push(`${x},${y.toFixed(1)}`);
          }
          return (
            <polyline
              key={idx}
              fill="none"
              stroke={ok && cleanSignal ? '#34d399' : colors[idx]}
              strokeWidth={ok ? 2.4 : 1.5}
              strokeOpacity={ok ? 0.95 : 0.65}
              points={pts.join(' ')}
            />
          );
        })}
      </svg>

      {/* Noise filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
        {['Katonai Rejtjelező Zaj (1979)', 'Mágneses Viharsztatika (82°S)'].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => toggleNoise(idx)}
            className={`px-3 py-2.5 min-h-[40px] rounded-lg border text-left flex items-center justify-between cursor-pointer transition-colors ${
              noiseMuted[idx]
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/25 border-rose-500/40 text-rose-200 hover:border-rose-400'
            }`}
          >
            <span>{label}</span>
            <span className="font-bold">{noiseMuted[idx] ? '✓ KISZŰRVE' : 'ZAJ AKTÍV'}</span>
          </button>
        ))}
      </div>

      {/* Phase controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        {channelNames.map((name, idx) => {
          const ok = phases[idx] === ACOUSTIC_TARGETS[idx];
          return (
            <div key={name} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300 truncate">{name}</span>
                <span className={`font-bold ${ok ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  Fázis {phases[idx]}/5
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={phases[idx]}
                onChange={(e) => updatePhase(idx, Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500">
                {ok ? '✓ Rezonancia tiszta' : `Cél fázis: ${ACOUSTIC_TARGETS[idx]}`}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!ready || solved}
        onClick={confirmLock}
        className={`w-full py-2.5 min-h-[42px] rounded-lg text-xs font-mono font-bold uppercase ${
          solved
            ? 'bg-emerald-900/50 text-emerald-300'
            : ready
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {solved ? '✓ Három Sáv Szinkronizálva' : 'Idővisszhang-szálak Rögzítése'}
      </button>
    </div>
  );
};

// 17. Mirror Paradox Game (Mira Chapter: Distinguish real physical laws from The Infinite's mirror simulation)
interface ParadoxRound {
  prompt: string;
  clue: string;
  options: { id: string; label: string; detail: string; isReal: boolean }[];
}

const PARADOX_ROUNDS: ParadoxRound[] = [
  {
    prompt: '1. Ellentmondás — A Két Árnyék a Főtéren',
    clue: 'A Valóságban a Kódvárosi Prizma 8 árnyékot vet, a fagyott bázissátorban pedig csak 1 fényforrás ég.',
    options: [
      {
        id: 'opt_1_fake',
        label: 'A sátor lámpája árnyék nélkül világít felfelé, és a hó nem olvad alatta',
        detail: 'A Másik Mira szerint ez bizonyítja, hogy az egész csak lázálom.',
        isReal: false,
      },
      {
        id: 'opt_1_real',
        label: 'A talpad alatti szilánkon a vérkeringésed 58 BPM-es meleg pulzusa tükröződik',
        detail: 'Egy szimuláció nem képes emberi testmelegre a -3200m-es obeliszk kérgén.',
        isReal: true,
      },
    ],
  },
  {
    prompt: '2. Ellentmondás — Az Óramutató Iránya',
    clue: 'Dr. Kovács Áron 1959-es kronométere minden 8. másodpercben visszaugrik egyet.',
    options: [
      {
        id: 'opt_2_real',
        label: 'A mutató valóban visszafelé lép — a helyi entrópia fordított az időrétegben',
        detail: 'A valós kronométer fizikája megegyezik Viktor és Lena felvételeivel.',
        isReal: true,
      },
      {
        id: 'opt_2_fake',
        label: 'Az óra teljesen megállt 00:00-nál, és a számlapján nincs semmilyen véset',
        detail: 'A tükörváros hamis másolata törli a kényelmetlen részleteket.',
        isReal: false,
      },
    ],
  },
  {
    prompt: '3. Ellentmondás — Ki Kérdezte Először?',
    clue: 'A tükörfal mögött a Másik Mira azt mondja, zárd le a kaput, mert nincs külső megfigyelő.',
    options: [
      {
        id: 'opt_3_fake',
        label: '„Nincs szükség Leventére vagy Viktorra — zárd be az emlékeidet, és biztonságban leszel.”',
        detail: 'Ez a félelem tükre: elszigetelni akarja a tudatodat.',
        isReal: false,
      },
      {
        id: 'opt_3_real',
        label: '„A 142.8 MHz-es jel és a budapesti jégkristály bizonyítja, hogy nem vagy egyedül a hálózatban.”',
        detail: 'A valóság a többi szereplő összekapcsolt emlékeiben él tovább.',
        isReal: true,
      },
    ],
  },
];

const MirrorParadoxGame: React.FC<GameProps> = ({ onWin }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const current = PARADOX_ROUNDS[roundIdx];

  const pickOption = (isReal: boolean) => {
    if (solved) return;
    if (isReal) {
      soundEngine.playCrystalResonance(528 + roundIdx * 70);
      setFeedback('✓ Valódi fizikai törvény azonosítva! A hamis tükör megrepedt.');
      if (roundIdx + 1 >= PARADOX_ROUNDS.length) {
        setSolved(true);
        soundEngine.playHarmonicChord([432, 528, 741]);
        onWin();
      } else {
        setRoundIdx((r) => r + 1);
      }
    } else {
      soundEngine.playMechanicalTick(-2);
      setFeedback('✗ Ez csak a Végtelen szimulált tükörképe — nézd meg újra a fizikát!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Válaszd ki mindhárom ellentmondásnál a valódi tényt az illúzióval szemben!</span>
        <span className="text-amber-300 font-bold tabular-nums">
          {solved ? '3/3 ÁTTÖRVE' : `${roundIdx + 1} / ${PARADOX_ROUNDS.length}. Próba`}
        </span>
      </div>

      {!solved ? (
        <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 space-y-3">
          <div className="text-sm font-cinzel font-bold text-cyan-200">{current.prompt}</div>
          <p className="text-xs font-mono text-slate-400 italic">{current.clue}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pickOption(opt.isReal)}
                className="p-3.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/90 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-semibold text-slate-100">{opt.label}</div>
                <div className="text-[11px] text-slate-400 font-mono">{opt.detail}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-200 text-center">
          ✓ Mindhárom tükörillúzió szétrepedt — látod a valós Kódváros mögötti idővonalat!
        </div>
      )}

      {feedback && !solved && (
        <div className="text-xs font-mono text-amber-200 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
          {feedback}
        </div>
      )}
    </div>
  );
};

// 18. Neural Key Sync (Levente Chapter: Align the 4 character poles to forge the Living Key)
const POLE_META = [
  { name: 'Viktor', domain: 'Jég · Antarktisz', target: 3, x: 75, y: 40 },
  { name: 'Lena', domain: 'Hang · 1979/83', target: 2, x: 245, y: 40 },
  { name: 'Mira', domain: 'Tér · Kódváros', target: 4, x: 245, y: 150 },
  { name: 'Levente', domain: 'Pulzus · Budapest', target: 3, x: 75, y: 150 },
];

const NeuralKeySyncGame: React.FC<GameProps> = ({ onWin }) => {
  const [levels, setLevels] = useState([1, 4, 2, 1]);
  const [solved, setSolved] = useState(false);

  const allAligned = levels.every((val, i) => val === POLE_META[i].target);

  const cyclePole = (idx: number) => {
    if (solved) return;
    const nextVal = (levels[idx] % 4) + 1;
    soundEngine.playCrystalResonance(360 + nextVal * 70);
    setLevels((prev) => {
      const next = prev.map((v, i) => (i === idx ? nextVal : v));
      if (next.every((v, i) => v === POLE_META[i].target)) {
        setSolved(true);
        soundEngine.playHarmonicChord([432, 528, 639, 741]);
        onWin();
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-slate-400">
        Hangold a négy tudati pólust a célrezonanciájára (Viktor: 3, Lena: 2, Mira: 4, Levente: 3), hogy létrejöjjön a Kódváros Élő Kulcsa!
      </p>

      <div className="flex justify-center">
        <svg viewBox="0 0 320 190" className="w-full max-w-md bg-slate-950 rounded-xl border border-cyan-500/30">
          {/* Connecting ring lines */}
          <polygon
            points="75,40 245,40 245,150 75,150"
            fill="none"
            stroke={allAligned ? '#34d399' : '#1e293b'}
            strokeWidth="2"
          />
          <line x1="75" y1="40" x2="245" y2="150" stroke={allAligned ? '#34d399' : '#334155'} strokeDasharray="4 4" />
          <line x1="245" y1="40" x2="75" y2="150" stroke={allAligned ? '#34d399' : '#334155'} strokeDasharray="4 4" />

          {/* Central Key Core */}
          <circle
            cx="160"
            cy="95"
            r="22"
            fill={allAligned ? '#064e3b' : '#0f172a'}
            stroke={allAligned ? '#34d399' : '#22d3ee'}
            strokeWidth="2"
          />
          <text x="160" y="99" textAnchor="middle" fill={allAligned ? '#6ee7b7' : '#67e8f9'} fontSize="11" fontFamily="monospace" fontWeight="bold">
            {allAligned ? 'KULCS OK' : 'Δ–6'}
          </text>

          {POLE_META.map((pole, idx) => {
            const ok = levels[idx] === pole.target;
            return (
              <g key={pole.name} onClick={() => cyclePole(idx)} className="cursor-pointer">
                <circle
                  cx={pole.x}
                  cy={pole.y}
                  r="24"
                  fill={ok ? '#064e3b' : '#0f172a'}
                  stroke={ok ? '#34d399' : '#38bdf8'}
                  strokeWidth="2"
                />
                <text x={pole.x} y={pole.y - 2} textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  {pole.name}
                </text>
                <text x={pole.x} y={pole.y + 11} textAnchor="middle" fill={ok ? '#6ee7b7' : '#fbbf24'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                  {levels[idx]} / {pole.target}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {POLE_META.map((pole, idx) => {
          const ok = levels[idx] === pole.target;
          return (
            <button
              key={pole.name}
              type="button"
              onClick={() => cyclePole(idx)}
              className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                ok
                  ? 'border-emerald-400 bg-emerald-950/30 text-emerald-200'
                  : 'border-slate-700 bg-slate-950 hover:border-cyan-400 text-slate-200'
              }`}
            >
              <div className="font-bold">{pole.name}</div>
              <div className="text-[10px] text-slate-400">{pole.domain}</div>
              <div className="mt-1 text-amber-300 font-bold tabular-nums">
                {levels[idx]} → {pole.target}
              </div>
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="text-xs font-mono text-emerald-300 text-center">
          ✓ A Négy Pólus összekapcsolódott — Kódváros Élő Kulcsa aktív!
        </div>
      )}
    </div>
  );
};

// 19. Echo Viaduct Tuning Game (Kódváros Ring 2)
const EchoViaductTuningGame: React.FC<GameProps> = ({ onWin }) => {
  const [spans, setSpans] = useState<number[]>([210, 390, 610]);
  const targets = [285, 432, 528];
  const labels = ['I. Viadukt (Sára/Veszta)', 'II. Pillér (Tamás 1982)', 'III. Ív (Lena 142.8)'];
  const [solved, setSolved] = useState(false);

  const isLocked = (idx: number) => Math.abs(spans[idx] - targets[idx]) <= 15;
  const allLocked = spans.every((_, i) => isLocked(i));

  useEffect(() => {
    if (allLocked && !solved) {
      setSolved(true);
      soundEngine.playCrystalResonance(528);
      onWin();
    }
  }, [allLocked, solved, onWin]);

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-slate-400">
        Hangold be mindhárom rézhúr-viadukt feszességét (±15 Hz), hogy Tamás 1982-es adása és Veszta szavai sértetlenül átkeljenek a 2. Kör szakadéka fölött.
      </div>
      <div className="bg-slate-950/90 border border-violet-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-violet-300">Akusztikus Híd Folytonosság</span>
          <span className="text-cyan-300 tabular-nums">
            {spans.filter((_, i) => isLocked(i)).length}/3 Pillér Rögzítve
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {spans.map((val, i) => {
            const locked = isLocked(i);
            return (
              <div
                key={labels[i]}
                className={`h-2 rounded-full transition-colors ${
                  locked ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {spans.map((val, idx) => {
          const locked = isLocked(idx);
          return (
            <div
              key={labels[idx]}
              className={`p-3 rounded-xl border ${
                locked ? 'border-emerald-500/45 bg-emerald-950/15' : 'border-slate-800 bg-slate-950/75'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-200">{labels[idx]}</span>
                <span className={locked ? 'text-emerald-300 font-bold tabular-nums' : 'text-violet-300 tabular-nums'}>
                  {val} Hz (Cél: {targets[idx]} Hz) {locked ? '✓' : ''}
                </span>
              </div>
              <input
                type="range"
                min={180}
                max={640}
                step={3}
                value={val}
                onChange={(e) => {
                  const next = [...spans];
                  next[idx] = Number(e.target.value);
                  setSpans(next);
                  soundEngine.playMechanicalTick(idx - 1);
                }}
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-300">
          ✓ A Visszhang-híd minden íve egyetlen tiszta akkordban rezeg! Tamás hangja áthallatszik a Katedrálisból.
        </div>
      )}
    </div>
  );
};

// 20. Mirror City Symmetry Lock Game (Kódváros Ring 3)
const MirrorCitySymmetryGame: React.FC<GameProps> = ({ onWin }) => {
  const [rotations, setRotations] = useState<number[]>([90, 180, 270, 90]);
  const ringNames = ['1. Külső Perem (Jég)', '2. Középső Híd (Hang)', '3. Tükörgyűrű (Tér)', '4. Korona-Írisz (Végtelen)'];
  const [solved, setSolved] = useState(false);

  const rotateRing = (idx: number, delta: number) => {
    soundEngine.playMechanicalTick(delta > 0 ? 1 : -1);
    const next = [...rotations];
    next[idx] = (next[idx] + delta + 360) % 360;
    // Slight harmonic coupling: rotating outer ring shifts inner mirror subtly unless holding aligned
    if (idx === 0) {
      next[2] = (next[2] + (delta > 0 ? 90 : -90) + 360) % 360;
    }
    setRotations(next);

    if (next.every((r) => r === 0) && !solved) {
      setSolved(true);
      soundEngine.playCrystalResonance(639);
      onWin();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-slate-400">
        Forgasd 0°-ra (Északi Tengely) mind a négy szimmetriagyűrűt. Figyelem: a Külső Perem elfordítása a Tükörgyűrűt is elmozdítja — kezdd kívülről befelé!
      </div>

      <div className="flex flex-col md:flex-row items-center gap-5 bg-slate-950/85 border border-amber-500/30 rounded-xl p-4">
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {rotations.map((deg, idx) => {
              const r = 82 - idx * 18;
              const aligned = deg === 0;
              const color = aligned ? '#34d399' : idx === 3 ? '#f59e0b' : '#38bdf8';
              return (
                <g key={ringNames[idx]} transform={`rotate(${deg} 100 100)`}>
                  <circle
                    cx="100"
                    cy="100"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={aligned ? 3 : 2}
                    strokeDasharray={aligned ? 'none' : '12 6'}
                    strokeOpacity={0.85}
                  />
                  <line
                    x1="100"
                    y1={100 - r - 5}
                    x2="100"
                    y2={100 - r + 7}
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
            <circle cx="100" cy="100" r="8" fill={solved ? '#34d399' : '#f59e0b'} />
          </svg>
        </div>

        <div className="flex-1 w-full space-y-2">
          {rotations.map((deg, idx) => {
            const aligned = deg === 0;
            return (
              <div
                key={ringNames[idx]}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-xs font-mono ${
                  aligned ? 'border-emerald-500/45 bg-emerald-950/20 text-emerald-200' : 'border-slate-800 bg-slate-900/70 text-slate-300'
                }`}
              >
                <span className="truncate">{ringNames[idx]}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-10 text-right tabular-nums">{deg}°</span>
                  <button
                    type="button"
                    onClick={() => rotateRing(idx, -90)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                    title="Balra 90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateRing(idx, 90)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                    title="Jobbra 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {solved && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-300">
          ✓ A Tükörváros Koronája 0°-os egyensúlyba állt — Kaelen és Mira tervei egy tengelyen egyesültek!
        </div>
      )}
    </div>
  );
};

interface MiniGameRouterProps {
  miniGameId: MiniGameId;
  onComplete?: (id: MiniGameId, reward: number) => void;
  onClose?: () => void;
  embedded?: boolean;
}

export const MiniGameRouter: React.FC<MiniGameRouterProps> = ({
  miniGameId,
  onComplete,
  onClose,
  embedded = false,
}) => {
  const { completeMiniGame, spiralState } = useGame();
  const meta = MINI_GAME_CATALOG.find((m) => m.id === miniGameId) || {
    id: miniGameId,
    title: 'Spirális Próba',
    subtitle: 'Interaktív rezonancia-teszt',
    chapterTag: 'Spirál',
    reward: 25,
  };
  const alreadyCleared = spiralState.worldState.completedMiniGames.includes(miniGameId);

  const handleWin = () => {
    completeMiniGame(miniGameId, meta.reward);
    if (onComplete) onComplete(miniGameId, meta.reward);
  };

  if (miniGameId === 'georadar') {
    return (
      <div className="space-y-3">
        <GeoRadarScanner onAnomalyLocked={handleWin} isCompleted={alreadyCleared} />
        {onClose && !embedded && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[40px] rounded-lg border border-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
            >
              Bezárás
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-cyan-500/35 rounded-2xl p-5 shadow-2xl text-slate-200">
      <div className="flex items-start justify-between gap-3 border-b border-cyan-500/20 pb-3 mb-4">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            {meta.chapterTag} · Jutalom: +{meta.reward} Rezonancia
          </div>
          <h3 className="text-base font-cinzel font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <span>{meta.title}</span>
            {alreadyCleared && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[40px] min-w-[40px] rounded-lg border border-slate-700 text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
            title="Bezárás"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {miniGameId === 'sound_resonance' && <SoundResonanceGame onWin={handleWin} />}
      {miniGameId === 'spiral_mechanism' && <SpiralMechanismGame onWin={handleWin} />}
      {miniGameId === 'timeline_reconstruction' && <TimelineReconstructionGame onWin={handleWin} />}
      {miniGameId === 'memory_reconstruction' && <MemoryReconstructionGame onWin={handleWin} />}
      {miniGameId === 'gravity_puzzle' && <GravityPuzzleGame onWin={handleWin} />}
      {miniGameId === 'spatial_maze' && <SpatialMazeGame onWin={handleWin} />}
      {miniGameId === 'symbol_translation' && <SymbolTranslationGame onWin={handleWin} />}
      {miniGameId === 'light_shadow' && <LightShadowGame onWin={handleWin} />}
      {miniGameId === 'consciousness_trial' && <ConsciousnessTrialGame onWin={handleWin} />}
      {miniGameId === 'coordinate_triangulation' && <CoordinateTriangulationGame onWin={handleWin} />}
      {miniGameId === 'crystal_resonance' && <CrystalResonanceGame onWin={handleWin} />}
      {miniGameId === 'reality_splice' && <RealitySpliceGame onWin={handleWin} />}
      {miniGameId === 'nine_layer_final' && <NineLayerFinalGame onWin={handleWin} />}
      {miniGameId === 'symbol_puzzle' && <SymbolObeliskGame onWin={handleWin} />}
      {miniGameId === 'acoustic_phase_lock' && <AcousticPhaseLockGame onWin={handleWin} />}
      {miniGameId === 'mirror_paradox' && <MirrorParadoxGame onWin={handleWin} />}
      {miniGameId === 'neural_key_sync' && <NeuralKeySyncGame onWin={handleWin} />}
      {miniGameId === 'echo_viaduct_tuning' && <EchoViaductTuningGame onWin={handleWin} />}
      {miniGameId === 'mirror_city_symmetry' && <MirrorCitySymmetryGame onWin={handleWin} />}
      {miniGameId === 'ocean_memory_dive' && <OceanMemoryDiveGame onWin={handleWin} />}
      {miniGameId === 'desert_trace_reconstruction' && <DesertTraceReconstructionGame onWin={handleWin} />}
      {miniGameId === 'time_fracture_paradox' && <TimeFractureParadoxGame onWin={handleWin} />}
      {miniGameId === 'mirror_reflection_labyrinth' && <MirrorReflectionLabyrinthGame onWin={handleWin} />}
      {miniGameId === 'cathedral_silence_tuning' && <CathedralSilenceTuningGame onWin={handleWin} />}
      {miniGameId === 'soul_machine_circuit' && <SoulMachineCircuitGame onWin={handleWin} />}
      {miniGameId === 'inverted_sky_navigation' && <InvertedSkyNavigationGame onWin={handleWin} />}
      {miniGameId === 'silent_garden_symbiosis' && <SilentGardenSymbiosisGame onWin={handleWin} />}
      {miniGameId === 'infinite_threshold_recognition' && <InfiniteThresholdRecognitionGame onWin={handleWin} />}
      {(miniGameId === 'rings_puzzle' ||
        miniGameId === 'infinite_mirror' ||
        miniGameId === 'guardian_test' ||
        miniGameId === 'radio') && (
        <div className="space-y-4">
          <ThreeRingsAlignGame onWin={handleWin} />
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300/80 pt-2 border-t border-slate-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Kódváros és az Őrzők harmóniája közvetlenül növeli a Rezonanciát.</span>
          </div>
        </div>
      )}
    </div>
  );
};
