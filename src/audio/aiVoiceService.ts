import { AudioChannel, spatialSoundscapeEngine, VoiceFxMode } from './SpatialSoundscapeEngine';

export type AiVoicePersona = 'narrator' | 'lena' | 'infinite' | 'viktor' | 'mira' | 'levente';

export interface SubtitleState {
  speakerLabel: string;
  currentSegment: string;
  fullText: string;
  isActive: boolean;
  source: 'ai-audio' | 'subtitle-fallback';
  cached?: boolean;
  errorNote?: string;
}

export interface PlayVoiceLineOptions {
  lineId: string;
  speakerLabel: string;
  persona: AiVoicePersona;
  channel: Extract<AudioChannel, 'narration' | 'dialogue'>;
  fxMode: VoiceFxMode;
  text: string;
  onSubtitle?: (state: SubtitleState) => void;
  onComplete?: () => void;
}

interface CachedWavRecord {
  key: string;
  wavBase64: string;
  mimeType: string;
  model: string;
  persona: AiVoicePersona;
}

interface TtsApiResponsePayload {
  audioBase64?: string;
  mimeType?: string;
  model?: string;
  persona?: AiVoicePersona;
  cached?: boolean;
  error?: string;
}

const memoryWavCache = new Map<string, CachedWavRecord>();
const DB_NAME = 'spiral_ai_audio_cache_v1';
const STORE_NAME = 'tts_clips';

function openCacheDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readPersistentCache(key: string): Promise<CachedWavRecord | null> {
  const mem = memoryWavCache.get(key);
  if (mem) return mem;
  const db = await openCacheDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = (req.result as CachedWavRecord | undefined) ?? null;
        if (result) memoryWavCache.set(key, result);
        resolve(result);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writePersistentCache(record: CachedWavRecord): Promise<void> {
  memoryWavCache.set(record.key, record);
  const db = await openCacheDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
  } catch {
    // ignore storage quota errors gracefully
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const normalized = base64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);
  const len = binary.length;
  const bytes = new Uint8Array(new ArrayBuffer(len));
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function parseTtsApiResponse(response: Response): Promise<TtsApiResponsePayload> {
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const trimmed = rawBody.trim();

  if (!trimmed) {
    throw new Error(
      `A hangszolgáltatás üres választ küldött (HTTP ${response.status}).`
    );
  }

  let parsed: TtsApiResponsePayload | null = null;
  try {
    parsed = JSON.parse(trimmed) as TtsApiResponsePayload;
  } catch {
    const preview = trimmed.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(
      `Nem JSON válasz érkezett a hangszolgáltatástól (HTTP ${response.status}, ${contentType || 'ismeretlen típus'}): ${preview}`
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(
      `Érvénytelen JSON szerkezet érkezett a hangszolgáltatástól (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      parsed.error || `Hanggenerálási szerverhiba (HTTP ${response.status}).`
    );
  }

  if (typeof parsed.audioBase64 !== 'string' || parsed.audioBase64.trim().length < 32) {
    throw new Error(
      parsed.error || 'A szerver válasza nem tartalmazott dekódolható hangadatot.'
    );
  }

  return parsed;
}

function splitIntoSubtitleSegments(text: string): string[] {
  const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const sentences = clean
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [clean];
}

class AiVoiceService {
  private subtitleTimers: number[] = [];
  private activeAbort: AbortController | null = null;
  private listeners = new Set<(state: SubtitleState | null) => void>();

  public subscribe(listener: (state: SubtitleState | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitSubtitle(
    onSubtitle: ((state: SubtitleState) => void) | undefined,
    state: SubtitleState | null
  ): void {
    if (state) {
      onSubtitle?.(state);
    }
    this.listeners.forEach((fn) => fn(state));
  }

  public stop(): void {
    this.subtitleTimers.forEach((id) => window.clearTimeout(id));
    this.subtitleTimers = [];
    if (this.activeAbort) {
      this.activeAbort.abort();
      this.activeAbort = null;
    }
    spatialSoundscapeEngine.stopActiveVoice();
    this.listeners.forEach((fn) => fn(null));
  }

  private scheduleTimedSubtitles(
    segments: string[],
    totalDurationSec: number,
    speakerLabel: string,
    fullText: string,
    source: 'ai-audio' | 'subtitle-fallback',
    cached: boolean | undefined,
    errorNote: string | undefined,
    onSubtitle?: (state: SubtitleState) => void,
    onDone?: () => void
  ): void {
    this.subtitleTimers.forEach((id) => window.clearTimeout(id));
    this.subtitleTimers = [];

    const totalChars = segments.reduce((sum, s) => sum + s.length, 0) || 1;
    let elapsedMs = 0;

    segments.forEach((segment, idx) => {
      const weight = segment.length / totalChars;
      const segDurationMs = Math.max(1400, Math.round(totalDurationSec * 1000 * weight));
      const timerId = window.setTimeout(() => {
        this.emitSubtitle(onSubtitle, {
          speakerLabel,
          currentSegment: segment,
          fullText,
          isActive: true,
          source,
          cached,
          errorNote,
        });
      }, elapsedMs);
      this.subtitleTimers.push(timerId);
      elapsedMs += segDurationMs;

      if (idx === segments.length - 1) {
        const endTimer = window.setTimeout(() => {
          this.emitSubtitle(onSubtitle, {
            speakerLabel,
            currentSegment: segment,
            fullText,
            isActive: false,
            source,
            cached,
            errorNote,
          });
          onDone?.();
        }, elapsedMs + 400);
        this.subtitleTimers.push(endTimer);
      }
    });
  }

  public async playLine(options: PlayVoiceLineOptions): Promise<void> {
    this.stop();
    // Unlock audio synchronously while still inside the user's interaction gesture
    spatialSoundscapeEngine.unlockFromUserGesture();

    const cleanDisplayText = options.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const requestText = options.text.replace(/\s+/g, ' ').trim().slice(0, 1450);
    const segments = splitIntoSubtitleSegments(cleanDisplayText);
    const cacheKey = `${options.lineId}:${options.persona}:${requestText.length}`;

    this.emitSubtitle(options.onSubtitle, {
      speakerLabel: options.speakerLabel,
      currentSegment: segments[0] || cleanDisplayText,
      fullText: cleanDisplayText,
      isActive: true,
      source: 'ai-audio',
    });

    const controller = new AbortController();
    this.activeAbort = controller;

    try {
      let cachedHit = false;
      let record = await readPersistentCache(cacheKey);
      if (record) {
        cachedHit = true;
      } else {
        const response = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text: requestText,
            persona: options.persona,
          }),
          signal: controller.signal,
        });

        const payload = await parseTtsApiResponse(response);

        cachedHit = Boolean(payload.cached);
        record = {
          key: cacheKey,
          wavBase64: payload.audioBase64 as string,
          mimeType: String(payload.mimeType || 'audio/wav'),
          model: String(payload.model || 'gemini-3.8-flash-tts'),
          persona: options.persona,
        };
        await writePersistentCache(record);
      }

      if (controller.signal.aborted) return;

      const wavBuffer = base64ToArrayBuffer(record.wavBase64);
      if (wavBuffer.byteLength < 44) {
        throw new Error('A visszakapott hangfájl túl rövid vagy sérült.');
      }

      const durationSec = await spatialSoundscapeEngine.playDecodedVoiceBuffer(
        wavBuffer,
        options.channel,
        options.fxMode,
        () => {
          options.onComplete?.();
        },
        record.mimeType || 'audio/wav'
      );

      if (!Number.isFinite(durationSec) || durationSec <= 0) {
        throw new Error('A böngésző nem tudta elindítani a hanglejátszást.');
      }

      this.scheduleTimedSubtitles(
        segments,
        durationSec,
        options.speakerLabel,
        cleanDisplayText,
        'ai-audio',
        cachedHit,
        undefined,
        options.onSubtitle
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Ismeretlen TTS hiba';
      const fallbackDuration = Math.max(4.5, cleanDisplayText.length / 14);
      this.scheduleTimedSubtitles(
        segments,
        fallbackDuration,
        options.speakerLabel,
        cleanDisplayText,
        'subtitle-fallback',
        false,
        msg,
        options.onSubtitle,
        options.onComplete
      );
    }
  }
}

export const aiVoiceService = new AiVoiceService();
