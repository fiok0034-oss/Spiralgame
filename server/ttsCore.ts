import { Buffer } from 'node:buffer';
import { GoogleGenAI } from '@google/genai';

export type VoicePersonaId = 'narrator' | 'lena' | 'infinite' | 'viktor' | 'mira' | 'levente';

export const GOOGLE_GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com';
export const GOOGLE_GEMINI_API_VERSION = 'v1beta';
export const PRIMARY_TTS_MODEL = 'gemini-3.8-flash-tts' as const;
export const FALLBACK_TTS_MODEL = 'gemini-3.8-flash-lite-tts' as const;

export type TtsModelId = typeof PRIMARY_TTS_MODEL | typeof FALLBACK_TTS_MODEL;

export interface TtsCacheEntry {
  audioBase64: string;
  mimeType: string;
  model: string;
  persona: VoicePersonaId;
  createdAt: string;
}

export const VOICE_PERSONA_CONFIG: Record<
  VoicePersonaId,
  {
    voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
    style: string;
    preferredModel: TtsModelId;
  }
> = {
  narrator: {
    voiceName: 'Charon',
    style:
      'Mély, visszafogott, feszült magyar irodalmi narrátor. Lassú, filmszerű tempó, tiszta magyar kiejtés, lélegzetvételnyi szünetekkel a súlyos mondatok között.',
    preferredModel: PRIMARY_TTS_MODEL,
  },
  lena: {
    voiceName: 'Kore',
    style:
      'Tiszta, érzelmes, kissé kimerült és sürgető magyar kutatónői hang egy 1983-as sarkvidéki expedíciós mikrofonon keresztül. Valódi aggodalom és melegség.',
    preferredModel: PRIMARY_TTS_MODEL,
  },
  infinite: {
    voiceName: 'Fenrir',
    style:
      'Mélyről zengő, időtlen, rendkívül nyugodt és hipnotikus magyar hang. Nem emberi sietséggel beszél, hanem végtelen türelemmel és súllyal.',
    preferredModel: PRIMARY_TTS_MODEL,
  },
  viktor: {
    voiceName: 'Charon',
    style:
      'Határozott, tapasztalt magyar geofizikus kutató hangja a hidegben, enyhe feszültséggel és koncentrációval.',
    preferredModel: FALLBACK_TTS_MODEL,
  },
  mira: {
    voiceName: 'Zephyr',
    style:
      'Kifinomult, tiszta, építészi pontosságú és kissé rejtélyes magyar női hang.',
    preferredModel: FALLBACK_TTS_MODEL,
  },
  levente: {
    voiceName: 'Puck',
    style:
      'Álomszerű, töprengő, fiatalabb magyar férfihang, mintha éber álomból emlékezne.',
    preferredModel: FALLBACK_TTS_MODEL,
  },
};

const ttsAudioCache = new Map<string, TtsCacheEntry>();
const MAX_TTS_CACHE_ENTRIES = 64;

export function normalizePersona(raw: unknown): VoicePersonaId {
  const val = String(raw || 'narrator');
  if (
    val === 'lena' ||
    val === 'infinite' ||
    val === 'viktor' ||
    val === 'mira' ||
    val === 'levente'
  ) {
    return val;
  }
  return 'narrator';
}

export function normalizeTtsModelId(raw: unknown): TtsModelId | undefined {
  if (typeof raw !== 'string') return undefined;
  const bare = raw
    .trim()
    .replace(/^gemini\//i, '')
    .replace(/^models\//i, '');
  if (bare === PRIMARY_TTS_MODEL) return PRIMARY_TTS_MODEL;
  if (bare === FALLBACK_TTS_MODEL) return FALLBACK_TTS_MODEL;
  return undefined;
}

export function getGeminiTtsClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw Object.assign(
      new Error(
        'A GEMINI_API_KEY környezeti változó nincs beállítva a szerveren. Netlifyon a Site configuration > Environment variables alatt állítsd be.'
      ),
      { statusCode: 503 }
    );
  }

  // Pin baseUrl directly to Google's Gemini Developer API so Netlify AI Gateway
  // or third-party GOOGLE_GEMINI_BASE_URL proxies cannot intercept TTS routing.
  return new GoogleGenAI({
    apiKey,
    vertexai: false,
    apiVersion: GOOGLE_GEMINI_API_VERSION,
    httpOptions: {
      baseUrl: GOOGLE_GEMINI_API_BASE_URL,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function makeTtsCacheKey(persona: VoicePersonaId, model: string, text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${persona}:${model}:${(hash >>> 0).toString(16)}:${text.length}`;
}

function getCandidateModels(preferred: TtsModelId, modelOverride?: string): TtsModelId[] {
  const normalizedOverride = normalizeTtsModelId(modelOverride);
  const first: TtsModelId = normalizedOverride || preferred;
  const second: TtsModelId =
    first === PRIMARY_TTS_MODEL ? FALLBACK_TTS_MODEL : PRIMARY_TTS_MODEL;
  return [first, second];
}

function isRetryableOrFallbackError(error: unknown): boolean {
  const err = error as { statusCode?: number; status?: number; message?: string };
  const status = err?.statusCode || err?.status || 0;
  const msg = err?.message || '';
  if (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('PERMISSION_DENIED') ||
    status === 401 ||
    status === 403
  ) {
    return false;
  }
  return (
    status === 429 ||
    status === 404 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('UNAVAILABLE')
  );
}

async function synthesizeWithModel(
  ai: GoogleGenAI,
  model: TtsModelId,
  text: string,
  profile: { voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'; style: string }
): Promise<{ audioBase64: string; mimeType: string }> {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style: profile.style,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: profile.voiceName,
          },
        },
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const inlineAudio = parts.find((p) => p.inlineData?.data)?.inlineData;
  let base64Audio = inlineAudio?.data;
  let mimeType = inlineAudio?.mimeType || 'audio/wav';

  if (!base64Audio) {
    throw Object.assign(
      new Error('A Gemini hanggeneráló szolgáltatás nem adott vissza hangadatot.'),
      { statusCode: 502 }
    );
  }

  // Unary Gemini TTS returns a complete RIFF WAV; wrap only if upstream ever returns raw L16/PCM
  const rawBytes = Buffer.from(base64Audio, 'base64');
  const isRiffWav = rawBytes.length >= 12 && rawBytes.toString('ascii', 0, 4) === 'RIFF';
  if (!isRiffWav && /l16|pcm/i.test(mimeType)) {
    const rateMatch = mimeType.match(/rate=(\d+)/i);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
    const wavHeader = Buffer.alloc(44);
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + rawBytes.length, 4);
    wavHeader.write('WAVE', 8);
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16);
    wavHeader.writeUInt16LE(1, 20);
    wavHeader.writeUInt16LE(1, 22);
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(sampleRate * 2, 28);
    wavHeader.writeUInt16LE(2, 32);
    wavHeader.writeUInt16LE(16, 34);
    wavHeader.write('data', 36);
    wavHeader.writeUInt32LE(rawBytes.length, 40);
    base64Audio = Buffer.concat([wavHeader, rawBytes]).toString('base64');
    mimeType = 'audio/wav';
  }

  return { audioBase64: base64Audio, mimeType };
}

export async function generateHungarianTtsAudio(
  text: string,
  persona: VoicePersonaId,
  modelOverride?: string
): Promise<TtsCacheEntry & { cached: boolean }> {
  const profile = VOICE_PERSONA_CONFIG[persona] || VOICE_PERSONA_CONFIG.narrator;
  const candidates = getCandidateModels(profile.preferredModel, modelOverride);

  for (const candidateModel of candidates) {
    const cached = ttsAudioCache.get(makeTtsCacheKey(persona, candidateModel, text));
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  const ai = getGeminiTtsClient();
  const attempts: Array<{ model: TtsModelId; waitBeforeMs: number }> = [
    { model: candidates[0], waitBeforeMs: 0 },
    { model: candidates[1], waitBeforeMs: 400 },
  ];

  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const { model, waitBeforeMs } = attempts[i];
    if (waitBeforeMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitBeforeMs));
    }
    try {
      const { audioBase64, mimeType } = await synthesizeWithModel(ai, model, text, profile);
      const entry: TtsCacheEntry = {
        audioBase64,
        mimeType,
        model,
        persona,
        createdAt: new Date().toISOString(),
      };

      const cacheKey = makeTtsCacheKey(persona, model, text);
      if (ttsAudioCache.size >= MAX_TTS_CACHE_ENTRIES) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, entry);

      return { ...entry, cached: false };
    } catch (error: unknown) {
      lastError = error;
      if (i < attempts.length - 1 && isRetryableOrFallbackError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export function classifyTtsError(error: unknown): { status: number; error: string } {
  const err = error as { statusCode?: number; status?: number; message?: string };
  const status = err?.statusCode || err?.status || 500;
  const rawMessage = err?.message || '';
  const hasGatewayEnv = Boolean(process.env.GOOGLE_GEMINI_BASE_URL?.trim());
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const looksLikeGoogleApiKey = apiKey.startsWith('AIza');

  let friendlyMessage = rawMessage || 'Ismeretlen hiba történt az AI hanggenerálás közben.';
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    friendlyMessage =
      'A Gemini TTS kvóta átmenetileg kimerült (429). A rendszer feliratos módban folytatja.';
  } else if (
    status === 401 ||
    status === 403 ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('API key not valid') ||
    rawMessage.includes('API key should be set')
  ) {
    friendlyMessage =
      hasGatewayEnv && !looksLikeGoogleApiKey
        ? 'A Netlify AI Gateway által automatikusan adott token nem jogosult a közvetlen Google Gemini Developer API TTS végpontra. Állíts be saját Google AI Studio GEMINI_API_KEY kulcsot (AIza...) a Netlify Environment variables alatt, majd indíts új deployt.'
        : 'A Gemini API-kulcs érvénytelen vagy nincs megfelelő jogosultsága a közvetlen Google Gemini Developer API-hoz. Ellenőrizd a GEMINI_API_KEY környezeti változót.';
  } else if (status === 404 || rawMessage.includes('NOT_FOUND')) {
    friendlyMessage = `A kért Gemini TTS modell jelenleg nem érhető el (404): ${rawMessage}`;
  } else if (status === 400 || rawMessage.includes('INVALID_ARGUMENT')) {
    friendlyMessage = `Érvénytelen TTS kérés (400): ${rawMessage}`;
  }

  const httpStatus = status >= 400 && status < 600 ? status : 500;
  return {
    status: httpStatus,
    error: friendlyMessage,
  };
}

export function getTtsHealthPayload(environment: 'netlify' | 'express') {
  const hasGatewayEnv = Boolean(process.env.GOOGLE_GEMINI_BASE_URL?.trim());
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  return {
    ok: true,
    endpoint: '/api/audio/tts',
    healthEndpoint: '/api/audio/health',
    environment,
    targetApiHost: GOOGLE_GEMINI_API_BASE_URL,
    apiVersion: GOOGLE_GEMINI_API_VERSION,
    primaryModel: PRIMARY_TTS_MODEL,
    fallbackModel: FALLBACK_TTS_MODEL,
    gatewayEnvDetected: hasGatewayEnv,
    hasGeminiKey: Boolean(apiKey),
    directGoogleKeyConfigured: Boolean(apiKey) && (!hasGatewayEnv || apiKey.startsWith('AIza')),
    mode:
      environment === 'netlify'
        ? process.env.CONTEXT || 'production'
        : process.env.NODE_ENV || 'development',
  };
}
