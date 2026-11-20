import { Buffer } from 'node:buffer';
import { GoogleGenAI } from '@google/genai';

export type VoicePersonaId = 'narrator' | 'lena' | 'infinite' | 'viktor' | 'mira' | 'levente';

export interface TtsCacheEntry {
  audioBase64: string;
  mimeType: string;
  model: string;
  persona: VoicePersonaId;
  createdAt: string;
}

export const VOICE_PERSONA_CONFIG: Record<
  VoicePersonaId,
  { voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'; style: string; preferredModel: string }
> = {
  narrator: {
    voiceName: 'Charon',
    style:
      'Mély, visszafogott, feszült magyar irodalmi narrátor. Lassú, filmszerű tempó, tiszta magyar kiejtés, lélegzetvételnyi szünetekkel a súlyos mondatok között.',
    preferredModel: 'gemini-3.8-flash-tts',
  },
  lena: {
    voiceName: 'Kore',
    style:
      'Tiszta, érzelmes, kissé kimerült és sürgető magyar kutatónői hang egy 1983-as sarkvidéki expedíciós mikrofonon keresztül. Valódi aggodalom és melegség.',
    preferredModel: 'gemini-3.8-flash-tts',
  },
  infinite: {
    voiceName: 'Fenrir',
    style:
      'Mélyről zengő, időtlen, rendkívül nyugodt és hipnotikus magyar hang. Nem emberi sietséggel beszél, hanem végtelen türelemmel és súllyal.',
    preferredModel: 'gemini-3.8-flash-tts',
  },
  viktor: {
    voiceName: 'Charon',
    style:
      'Határozott, tapasztalt magyar geofizikus kutató hangja a hidegben, enyhe feszültséggel és koncentrációval.',
    preferredModel: 'gemini-3.8-flash-lite-tts',
  },
  mira: {
    voiceName: 'Zephyr',
    style:
      'Kifinomult, tiszta, építészi pontosságú és kissé rejtélyes magyar női hang.',
    preferredModel: 'gemini-3.8-flash-lite-tts',
  },
  levente: {
    voiceName: 'Puck',
    style:
      'Álomszerű, töprengő, fiatalabb magyar férfihang, mintha éber álomból emlékezne.',
    preferredModel: 'gemini-3.8-flash-lite-tts',
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
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
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

export async function generateHungarianTtsAudio(
  text: string,
  persona: VoicePersonaId,
  modelOverride?: string
): Promise<TtsCacheEntry & { cached: boolean }> {
  const profile = VOICE_PERSONA_CONFIG[persona] || VOICE_PERSONA_CONFIG.narrator;
  const model =
    modelOverride === 'gemini-3.8-flash-lite-tts' || modelOverride === 'gemini-3.8-flash-tts'
      ? modelOverride
      : profile.preferredModel;

  const cacheKey = makeTtsCacheKey(persona, model, text);
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const ai = getGeminiTtsClient();
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

  const entry: TtsCacheEntry = {
    audioBase64: base64Audio,
    mimeType,
    model,
    persona,
    createdAt: new Date().toISOString(),
  };

  if (ttsAudioCache.size >= MAX_TTS_CACHE_ENTRIES) {
    const oldestKey = ttsAudioCache.keys().next().value;
    if (oldestKey) ttsAudioCache.delete(oldestKey);
  }
  ttsAudioCache.set(cacheKey, entry);

  return { ...entry, cached: false };
}

export function classifyTtsError(error: unknown): { status: number; error: string } {
  const err = error as { statusCode?: number; status?: number; message?: string };
  const status = err?.statusCode || err?.status || 500;
  const rawMessage = err?.message || '';

  let friendlyMessage = rawMessage || 'Ismeretlen hiba történt az AI hanggenerálás közben.';
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    friendlyMessage =
      'A Gemini TTS kvóta átmenetileg kimerült (429). A rendszer feliratos módban folytatja.';
  } else if (
    status === 403 ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('API key not valid') ||
    rawMessage.includes('API key should be set')
  ) {
    friendlyMessage =
      'A Gemini API-kulcs érvénytelen vagy hiányzik a szerverről. Ellenőrizd a GEMINI_API_KEY környezeti változót.';
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
  return {
    ok: true,
    endpoint: '/api/audio/tts',
    healthEndpoint: '/api/audio/health',
    environment,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    mode:
      environment === 'netlify'
        ? process.env.CONTEXT || 'production'
        : process.env.NODE_ENV || 'development',
  };
}
