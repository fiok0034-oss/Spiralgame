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

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw Object.assign(
      new Error('A GEMINI_API_KEY nincs beállítva a szerverkörnyezetben. Kérjük, állítsd be a Settings > Secrets panelen.'),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({
    apiKey,
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
    model: 'gemini-4-hydrogen',
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

async function startServer() {
  const app = express();
  app.use(express.json());

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
