import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type NewsCategoryFilter = 'all' | 'arctic' | 'anomalies' | 'meta';

interface GroundingSource {
  title: string;
  uri: string;
}

interface ArchiveNewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  dateLabel: string;
  sourceName: string;
  relevanceNote: string;
  sourceUri?: string;
}

interface DailyArchiveNewsResponse {
  editionDate: string;
  fetchedAt: string;
  category: NewsCategoryFilter;
  dailyBriefingIntro: string;
  articles: ArchiveNewsArticle[];
  sources: GroundingSource[];
  searchQueries: string[];
  cached: boolean;
}

const dailyNewsCache = new Map<string, DailyArchiveNewsResponse>();

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGeminiClient(apiVersion?: string): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw Object.assign(
      new Error('A GEMINI_API_KEY nincs beállítva a szerverkörnyezetben. Kérjük, állítsd be a Settings > Secrets panelen.'),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSearchPrompt(category: NewsCategoryFilter, editionDate: string): string {
  const topicInstruction =
    category === 'arctic'
      ? 'kizárólag valós, friss antarktiszi és északi-sarkvidéki expedíciókkal, szubglaciális tavakkal, jégmag-fúrással és sarki kutatóállomásokkal kapcsolatos tudományos híreket'
      : category === 'anomalies'
      ? 'kizárólag valós, friss tudományos anomáliákkal, megmagyarázatlan geofizikai vagy mágneses jelenségekkel, neutrínó-észlelésekkel és különleges fizikai felfedezésekkel kapcsolatos híreket'
      : category === 'meta'
      ? 'kizárólag valós, friss tudományos híreket a tudatkutatás, a kvantummechanikai megfigyelői hatás, az időérzékelés, az információelmélet és a valóságérzékelés határterületeiről (meta-narratív tudományos témák)'
      : 'valós, friss híreket három területről vegyesen: (1) tudományos anomáliák (geofizikai, mágneses, kvantum- vagy neutrínó-észlelések), (2) sarkvidéki és antarktiszi kutatóexpedíciók, valamint (3) meta-narratív tudományos témák (tudatkutatás, megfigyelői hatás, időérzékelés és információelmélet)';

  return `Mai dátum: ${editionDate}.
Használd a Google Keresést (Search Grounding), és gyűjts össze 4 valós, ellenőrizhető, aktuális vagy közelmúltbeli hírt a következő témában: ${topicInstruction}.

KÖVETELMÉNYEK:
1. Minden egyes mező szövege legyen szigorúan hibátlan, választékos és helyesírásilag pontos MAGYAR nyelven megírva (angol mondatok nélkül).
2. Ne találj ki fiktív híreket — kizárólag a keresésben megtalált valós cikkekre és tudományos eredményekre támaszkodj.
3. A válaszod CSAK egy érvényes JSON objektum legyen az alábbi pontos szerkezetben (ne írj köré magyarázó szöveget):
{
  "dailyBriefingIntro": "1-2 mondatos magyar bevezető a mai napi archívumi jelentéshez.",
  "articles": [
    {
      "title": "A hír tömör, pontos magyar címe",
      "summary": "2-3 mondatos, tényszerű magyar összefoglaló a felfedezésről vagy eseményről.",
      "category": "Sarkvidéki Expedíció" vagy "Tudományos Anomália" vagy "Meta-narratív Kutatás",
      "dateLabel": "A megjelenés vagy esemény dátuma / időszaka magyarul (pl. 2026. november)",
      "sourceName": "A forrás médium vagy kutatóintézet neve (pl. Nature, British Antarctic Survey, NASA)",
      "relevanceNote": "1 rövid magyar mondat arról, hogyan rezonál ez a valós felfedezés az ARCHÍV-82 és a jég alatti kutatások világával."
    }
  ]
}`;
}

function extractJsonFromText(rawText: string): {
  dailyBriefingIntro?: string;
  articles?: Array<Partial<ArchiveNewsArticle>>;
} | null {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function fetchDailyArchiveNews(
  category: NewsCategoryFilter,
  forceRefresh: boolean
): Promise<DailyArchiveNewsResponse> {
  const editionDate = getTodayDateString();
  const cacheKey = `${editionDate}:${category}`;

  if (!forceRefresh) {
    const cached = dailyNewsCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildSearchPrompt(category, editionDate),
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw Object.assign(
      new Error('A keresési szolgáltatás üres választ adott vissza.'),
      { statusCode: 502 }
    );
  }

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const rawChunks = groundingMetadata?.groundingChunks ?? [];
  const sourceMap = new Map<string, GroundingSource>();

  for (const chunk of rawChunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title;
    if (uri && !sourceMap.has(uri)) {
      sourceMap.set(uri, {
        uri,
        title: title || uri,
      });
    }
  }
  const sources = Array.from(sourceMap.values());
  const searchQueries = groundingMetadata?.webSearchQueries ?? [];

  const parsed = extractJsonFromText(rawText);
  const parsedArticles = Array.isArray(parsed?.articles) ? parsed.articles : [];

  const articles: ArchiveNewsArticle[] = parsedArticles
    .filter((item) => item && typeof item.title === 'string' && item.title.trim().length > 0)
    .slice(0, 5)
    .map((item, idx) => ({
      id: `news_${editionDate}_${category}_${idx}`,
      title: String(item.title).trim(),
      summary: String(item.summary || 'Részletes tudományos jelentés elérhető a hivatkozott forrásban.').trim(),
      category: String(item.category || 'Tudományos Jelentés').trim(),
      dateLabel: String(item.dateLabel || editionDate).trim(),
      sourceName: String(item.sourceName || sources[idx]?.title || 'Tudományos Forrás').trim(),
      relevanceNote: String(
        item.relevanceNote || 'Kapcsolódó külső megfigyelés az ARCHÍV-82 napi figyelőrendszeréből.'
      ).trim(),
      sourceUri: sources[idx]?.uri,
    }));

  if (articles.length === 0) {
    throw Object.assign(
      new Error('Nem sikerült strukturált híreket kinyerni a Google Keresési válaszból.'),
      { statusCode: 502 }
    );
  }

  const payload: DailyArchiveNewsResponse = {
    editionDate,
    fetchedAt: new Date().toISOString(),
    category,
    dailyBriefingIntro:
      typeof parsed?.dailyBriefingIntro === 'string' && parsed.dailyBriefingIntro.trim().length > 0
        ? parsed.dailyBriefingIntro.trim()
        : `ARCHÍV-82 Napi Tudományos és Sarkvidéki Sajtószemle (${editionDate}).`,
    articles,
    sources,
    searchQueries,
    cached: false,
  };

  dailyNewsCache.set(cacheKey, payload);
  return payload;
}

type VoicePersonaId = 'narrator' | 'lena' | 'infinite' | 'viktor' | 'mira' | 'levente';

interface TtsCacheEntry {
  audioBase64: string;
  mimeType: string;
  model: string;
  persona: VoicePersonaId;
  createdAt: string;
}

const ttsAudioCache = new Map<string, TtsCacheEntry>();
const MAX_TTS_CACHE_ENTRIES = 64;

const VOICE_PERSONA_CONFIG: Record<
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

function makeTtsCacheKey(persona: VoicePersonaId, model: string, text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${persona}:${model}:${(hash >>> 0).toString(16)}:${text.length}`;
}

async function generateHungarianTtsAudio(
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

  const ai = getGeminiClient('v1beta');
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

  // Verify container: unary Gemini TTS returns a complete RIFF WAV; only wrap if upstream ever returns raw L16/PCM without RIFF header
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
    wavHeader.writeUInt32LE(16, 16); // PCM chunk size
    wavHeader.writeUInt16LE(1, 20); // PCM format
    wavHeader.writeUInt16LE(1, 22); // mono
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(sampleRate * 2, 28); // byte rate
    wavHeader.writeUInt16LE(2, 32); // block align
    wavHeader.writeUInt16LE(16, 34); // bits per sample
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/audio/tts', async (req: Request, res: Response) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const rawPersona = String(req.body?.persona || 'narrator');
    const persona: VoicePersonaId =
      rawPersona === 'lena' ||
      rawPersona === 'infinite' ||
      rawPersona === 'viktor' ||
      rawPersona === 'mira' ||
      rawPersona === 'levente'
        ? rawPersona
        : 'narrator';
    const modelOverride = typeof req.body?.model === 'string' ? req.body.model : undefined;

    if (!rawText || rawText.length > 1500) {
      res.status(400).json({
        error: 'Érvénytelen vagy túl hosszú szöveg érkezett a hanggeneráláshoz (1–1500 karakter engedélyezett).',
      });
      return;
    }

    try {
      const result = await generateHungarianTtsAudio(rawText, persona, modelOverride);
      res.json(result);
    } catch (error: unknown) {
      const err = error as { statusCode?: number; status?: number; message?: string };
      const status = err.statusCode || err.status || 500;
      const rawMessage = err.message || '';

      console.error('[api/audio/tts] Error:', status, rawMessage);

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
          'A Gemini API-kulcs érvénytelen vagy hiányzik. Ellenőrizd a Settings > Secrets panelt.';
      } else if (status === 404 || rawMessage.includes('NOT_FOUND')) {
        friendlyMessage = `A kért Gemini TTS modell jelenleg nem érhető el (404): ${rawMessage}`;
      } else if (status === 400 || rawMessage.includes('INVALID_ARGUMENT')) {
        friendlyMessage = `Érvénytelen TTS kérés (400): ${rawMessage}`;
      }

      const httpStatus = status >= 400 && status < 600 ? status : 500;
      res.status(httpStatus).json({
        error: friendlyMessage,
        status: httpStatus,
      });
    }
  });

  app.get('/api/archive-news', async (req: Request, res: Response) => {
    const rawCat = String(req.query.category || 'all');
    const category: NewsCategoryFilter =
      rawCat === 'arctic' || rawCat === 'anomalies' || rawCat === 'meta' ? rawCat : 'all';
    const forceRefresh = req.query.refresh === 'true';

    try {
      const data = await fetchDailyArchiveNews(category, forceRefresh);
      res.json(data);
    } catch (error: unknown) {
      const err = error as { statusCode?: number; status?: number; message?: string };
      const status = err.statusCode || err.status || 500;
      const rawMessage = err.message || '';

      let friendlyMessage =
        rawMessage || 'Ismeretlen hiba történt a Napi Archív Hírek lekérdezése közben.';

      if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
        friendlyMessage =
          'A Gemini Search Grounding szolgáltatás jelenlegi kvótája átmenetileg kimerült (429). Ellenőrizd a használati keretet vagy a számlázási beállításokat a Settings > Secrets panelen, majd próbáld újra később.';
      } else if (
        status === 403 ||
        status === 400 ||
        rawMessage.includes('PERMISSION_DENIED') ||
        rawMessage.includes('API_KEY_INVALID')
      ) {
        friendlyMessage =
          'A Gemini API-kulcs érvénytelen vagy nincs megfelelő jogosultsága. Kérjük, ellenőrizd a GEMINI_API_KEY beállítását a Settings > Secrets panelen.';
      } else if (status === 404 || rawMessage.includes('NOT_FOUND')) {
        friendlyMessage =
          'A kért keresési modell jelenleg nem érhető el a szolgáltatónál (404).';
      }

      console.error('[api/archive-news] Error:', status, rawMessage);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: friendlyMessage,
      });
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'A kért API-végpont nem található.' });
  });

  app.use((err: unknown, req: Request, res: Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      const e = err as { status?: number; statusCode?: number; message?: string };
      const status = e.statusCode || e.status || 400;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: e.message || 'Érvénytelen API kérés vagy belső szerverhiba.',
      });
      return;
    }
    next(err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`A Spirál Lehelete szerver elindult: http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Szerverindítási hiba:', err);
  process.exit(1);
});
