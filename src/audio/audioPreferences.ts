import { soundEngine } from './SoundEngine';
import { spatialSoundscapeEngine } from './SpatialSoundscapeEngine';

export interface AudioPreferences {
  masterVolume: number;
  ambientVolume: number;
  narrationVolume: number;
  dialogueVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  subtitlesEnabled: boolean;
  autoNarrateScenes: boolean;
}

const STORAGE_KEY = 'spiral_audio_prefs_v1';

const DEFAULT_PREFS: AudioPreferences = {
  masterVolume: 0.75,
  ambientVolume: 0.55,
  narrationVolume: 0.9,
  dialogueVolume: 0.9,
  sfxVolume: 0.8,
  isMuted: false,
  subtitlesEnabled: true,
  autoNarrateScenes: false,
};

let currentPrefs: AudioPreferences = loadPreferences();
applyPreferencesToEngines(currentPrefs);

function clamp01(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function loadPreferences(): AudioPreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
    return {
      masterVolume: clamp01(parsed.masterVolume, DEFAULT_PREFS.masterVolume),
      ambientVolume: clamp01(parsed.ambientVolume, DEFAULT_PREFS.ambientVolume),
      narrationVolume: clamp01(parsed.narrationVolume, DEFAULT_PREFS.narrationVolume),
      dialogueVolume: clamp01(parsed.dialogueVolume, DEFAULT_PREFS.dialogueVolume),
      sfxVolume: clamp01(parsed.sfxVolume, DEFAULT_PREFS.sfxVolume),
      isMuted: Boolean(parsed.isMuted),
      subtitlesEnabled:
        typeof parsed.subtitlesEnabled === 'boolean'
          ? parsed.subtitlesEnabled
          : DEFAULT_PREFS.subtitlesEnabled,
      autoNarrateScenes: Boolean(parsed.autoNarrateScenes),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function applyPreferencesToEngines(prefs: AudioPreferences): void {
  soundEngine.setVolumes(prefs.masterVolume, prefs.ambientVolume, prefs.sfxVolume);
  soundEngine.setMute(prefs.isMuted);
  spatialSoundscapeEngine.setVolumes({
    master: prefs.masterVolume,
    ambient: prefs.ambientVolume,
    narration: prefs.narrationVolume,
    dialogue: prefs.dialogueVolume,
    sfx: prefs.sfxVolume,
  });
  spatialSoundscapeEngine.setMuted(prefs.isMuted);
}

export function getAudioPreferences(): AudioPreferences {
  return { ...currentPrefs };
}

export function updateAudioPreferences(partial: Partial<AudioPreferences>): AudioPreferences {
  currentPrefs = {
    ...currentPrefs,
    ...partial,
  };
  applyPreferencesToEngines(currentPrefs);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPrefs));
    } catch {
      // ignore storage quota errors
    }
  }
  return { ...currentPrefs };
}
