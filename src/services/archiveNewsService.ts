export type NewsCategoryFilter = 'all' | 'arctic' | 'anomalies' | 'meta';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ArchiveNewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  dateLabel: string;
  sourceName: string;
  relevanceNote: string;
  sourceUri?: string;
}

export interface DailyArchiveNewsData {
  editionDate: string;
  fetchedAt: string;
  category: NewsCategoryFilter;
  dailyBriefingIntro: string;
  articles: ArchiveNewsArticle[];
  sources: GroundingSource[];
  searchQueries: string[];
  cached?: boolean;
}

const STORAGE_PREFIX = 'spiral_daily_archive_news_v2';

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatHungarianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}. ${parts[1]}. ${parts[2]}.`;
}

const FALLBACK_NEWS_DATA: Record<NewsCategoryFilter, DailyArchiveNewsData> = {
  all: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'all',
    dailyBriefingIntro: 'ARCHÍV-82 Offline Figyelőrendszer · Helyi mentett és ellenőrzött tudományos hírek a sarkvidéki kutatásokról.',
    searchQueries: ['antarctic subglacial lakes research', 'geophysical anomalies recent discoveries'],
    sources: [
      { title: 'British Antarctic Survey Research Reports', uri: 'https://www.bas.ac.uk' },
      { title: 'Nature Geoscience Bulletin', uri: 'https://www.nature.com/ngeo' }
    ],
    articles: [
      {
        id: 'fallback_1',
        title: 'Új subglaciális vízhálózat jeleit térképezték fel a Kelet-Antarktiszi jégpáncél alatt',
        summary: 'Nemzetközi geofizikai kutatócsoport radaros mérésekkel kimutatta, hogy a 3000 méteres jégtakaró alatt kiterjedt, összekapcsolt tórendszer húzódik meg, amelynek hőmérsékletét geotermikus anomáliák táplálják.',
        category: 'Sarkvidéki Expedíció',
        dateLabel: '2026. November',
        sourceName: 'British Antarctic Survey',
        relevanceNote: 'Közvetlen párhuzam az ARCHÍV-82 által vizsgált 3200 méteres mélykamra anomáliájával.',
        sourceUri: 'https://www.bas.ac.uk'
      },
      {
        id: 'fallback_2',
        title: 'Mágneses mező ingadozások és szubszonikus rezonancia a 82. szélességi kör közelében',
        summary: 'A déli sarkvidéki szeizmikus állomások szokatlan, szabályos 432 Hz-es harmonikus rezgéseket rögzítettek, amelyek eredetét a kőzettestek kristályszerkezetével magyarázzák.',
        category: 'Tudományos Anomália',
        dateLabel: '2026. November',
        sourceName: 'Geophysical Research Letters',
        relevanceNote: 'A rádióegységen észlelt morze-jelek és kristályrezonanciák fizikai alapja.',
        sourceUri: 'https://agupubs.onlinelibrary.wiley.com'
      },
      {
        id: 'fallback_3',
        title: 'Kvantum-megfigyelői hatások makroszkopikus rendszerekben: új elmélet az időérzékelésről',
        summary: 'A legfrissebb elméleti fizikai publikációk szerint a megfigyelő tudatos részvétele mérhetően befolyásolja a kvantumállapotok stabilitását a hűtött kristályrácsokban.',
        category: 'Meta-narratív Kutatás',
        dateLabel: '2026. Október',
        sourceName: 'Nature Physics',
        relevanceNote: 'A Spirál és a Kilencedik Kamra működési elve a valóságformáló megfigyelőn alapul.',
        sourceUri: 'https://www.nature.com/nphys'
      }
    ]
  },
  arctic: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'arctic',
    dailyBriefingIntro: 'Sarkvidéki Expedíciós Hírek és Jégmag-elemzési jelentések.',
    searchQueries: ['antarctic ice core drilling 40000 years'],
    sources: [{ title: 'Antarctic Science Journal', uri: 'https://www.cambridge.org/core/journals/antarctic-science' }],
    articles: [
      {
        id: 'fb_arc_1',
        title: '40 000 éves jégminták elemzése a mélyfúrásokból',
        summary: 'A legmélyebb antarktiszi jégmagok oxigén-izotóp aránya óriási éghajlati ingadozásokat mutat, miközben kristályrácsaikban ősi gázbuborékok maradtak fenn.',
        category: 'Sarkvidéki Expedíció',
        dateLabel: '2026. November',
        sourceName: 'Antarctic Science',
        relevanceNote: 'Levente pesti szobájában talált jégminták azonos korúak ezzel a réteggel.',
        sourceUri: 'https://www.cambridge.org'
      }
    ]
  },
  anomalies: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'anomalies',
    dailyBriefingIntro: 'Geofizikai és Szeizmikus Anomáliák Hírei.',
    searchQueries: ['unexplained seismic low frequency hum'],
    sources: [{ title: 'Seismological Society of America', uri: 'https://www.seismosoc.org' }],
    articles: [
      {
        id: 'fb_anom_1',
        title: 'Mélyföldi rezgések és alacsony frekvenciájú akusztikai anomáliák',
        summary: 'A kontinensek alatti kőzetlemezeken átvonuló alacsony frekvenciájú hullámok megfejthetetlen fizikai mintázatokat mutatnak.',
        category: 'Tudományos Anomália',
        dateLabel: '2026. November',
        sourceName: 'SSA Bulletin',
        relevanceNote: 'A jég alatti 58 BPM-es pulzus és a morze-jelek analógiája.',
        sourceUri: 'https://www.seismosoc.org'
      }
    ]
  },
  meta: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'meta',
    dailyBriefingIntro: 'Tudatkutatás, Kvantum-megfigyelés és Információelmélet.',
    searchQueries: ['quantum observer effect information theory'],
    sources: [{ title: 'Quantum Information Journal', uri: 'https://www.nature.com' }],
    articles: [
      {
        id: 'fb_meta_1',
        title: 'A megfigyelő paradoxon és az információ megmaradása',
        summary: 'A modern kvantum-információelmélet azt vizsgálja, hogy a le nem írt események és a megfigyelő szándéka hogyan formálják a mérési eredményeket.',
        category: 'Meta-narratív Kutatás',
        dateLabel: '2026. November',
        sourceName: 'Quantum Information',
        relevanceNote: '„Talán te.” — A megfigyelő szerepe a Spirál lezárásában.',
        sourceUri: 'https://www.nature.com'
      }
    ]
  }
};

export function getCachedArchiveNews(
  category: NewsCategoryFilter
): DailyArchiveNewsData | null {
  const today = getTodayDateString();
  const cacheKey = `${STORAGE_PREFIX}_${today}_${category}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyArchiveNewsData;
    if (
      parsed &&
      parsed.editionDate === today &&
      Array.isArray(parsed.articles) &&
      parsed.articles.length > 0
    ) {
      return { ...parsed, cached: true };
    }
  } catch {
    // Ignore invalid local storage payload
  }
  return FALLBACK_NEWS_DATA[category] || FALLBACK_NEWS_DATA.all;
}

export async function fetchDailyArchiveNewsClient(
  category: NewsCategoryFilter,
  forceRefresh = false
): Promise<DailyArchiveNewsData> {
  if (!forceRefresh) {
    const cached = getCachedArchiveNews(category);
    if (cached && cached.articles.length > 0) return cached;
  }

  const params = new URLSearchParams({ category });
  if (forceRefresh) {
    params.set('refresh', 'true');
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`/api/archive-news?${params.toString()}`, {
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const textSample = await response.text();
      console.warn('[ArchiveNews] Non-JSON response received:', textSample.slice(0, 150));
      // Fallback to local cache or static fallback data if server returned HTML (e.g. 404/500 index.html)
      const fallback = getCachedArchiveNews(category) || FALLBACK_NEWS_DATA[category] || FALLBACK_NEWS_DATA.all;
      return { ...fallback, cached: true };
    }

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload?.error || `Szerverhiba (${response.status}): Nem sikerült lekérni a Napi Archív Híreket.`
      );
    }

    const typedData = payload as DailyArchiveNewsData;
    if (!typedData || !Array.isArray(typedData.articles) || typedData.articles.length === 0) {
      throw new Error('A szerver érvénytelen vagy üres hírlistát adott vissza.');
    }

    const cacheKey = `${STORAGE_PREFIX}_${typedData.editionDate || getTodayDateString()}_${category}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(typedData));
    } catch {
      // Ignore storage quota errors
    }

    return typedData;
  } catch (err: unknown) {
    console.warn('[ArchiveNews] Fetch failed, using offline fallback:', err);
    const fallback = getCachedArchiveNews(category) || FALLBACK_NEWS_DATA[category] || FALLBACK_NEWS_DATA.all;
    return { ...fallback, cached: true };
  }
}
