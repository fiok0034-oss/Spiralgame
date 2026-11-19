export type NewsCategoryFilter = 'all' | 'arctic' | 'anomalies' | 'meta';
export type NewsSyncStatus = 'live' | 'cached' | 'offline';

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
  syncStatus?: NewsSyncStatus;
  lastSyncedAt?: string;
  errorReason?: string;
}

const STORAGE_PREFIX = 'spiral_daily_archive_news_v2';
const LAST_PAYLOAD_PREFIX = 'spiral_daily_archive_last_payload_v2';
const LAST_SYNC_KEY = 'spiral_daily_archive_last_sync_v2';

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatHungarianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}. ${parts[1]}. ${parts[2]}.`;
}

export function formatSyncTimestampHu(isoString?: string | null): string {
  if (!isoString) return 'nincs korábbi szinkron';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return 'ismeretlen időpont';

  const today = new Date();
  const sameDay =
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate();

  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  if (sameDay) {
    return `${hh}:${mm}`;
  }
  const yyyy = parsed.getFullYear();
  const mon = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}. ${mon}. ${dd}. ${hh}:${mm}`;
}

export function getLastSyncTimestamp(): string | null {
  try {
    const val = localStorage.getItem(LAST_SYNC_KEY);
    if (!val) return null;
    return Number.isNaN(new Date(val).getTime()) ? null : val;
  } catch {
    return null;
  }
}

function saveLastSyncTimestamp(isoString: string): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, isoString);
  } catch {
    // Ignore storage quota errors
  }
}

export function sanitizeArchiveArticles(rawArticles: unknown): ArchiveNewsArticle[] {
  if (!Array.isArray(rawArticles)) return [];
  const seenTitles = new Set<string>();
  const sanitized: ArchiveNewsArticle[] = [];

  for (let i = 0; i < rawArticles.length; i++) {
    const item = rawArticles[i];
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const rawTitle = typeof record.title === 'string' ? record.title.trim() : '';
    if (!rawTitle) continue;

    const normalizedTitle = rawTitle.toLowerCase();
    if (seenTitles.has(normalizedTitle)) continue;
    seenTitles.add(normalizedTitle);

    const rawUri = typeof record.sourceUri === 'string' ? record.sourceUri.trim() : '';
    const safeUri =
      rawUri.startsWith('https://') || rawUri.startsWith('http://') ? rawUri : undefined;

    sanitized.push({
      id:
        typeof record.id === 'string' && record.id.trim().length > 0
          ? record.id.trim()
          : `article_${i}_${normalizedTitle.slice(0, 12)}`,
      title: rawTitle,
      summary:
        typeof record.summary === 'string' && record.summary.trim().length > 0
          ? record.summary.trim()
          : 'Részletes tudományos jelentés érhető el a hivatkozott forrásban.',
      category:
        typeof record.category === 'string' && record.category.trim().length > 0
          ? record.category.trim()
          : 'Tudományos Jelentés',
      dateLabel:
        typeof record.dateLabel === 'string' && record.dateLabel.trim().length > 0
          ? record.dateLabel.trim()
          : getTodayDateString(),
      sourceName:
        typeof record.sourceName === 'string' && record.sourceName.trim().length > 0
          ? record.sourceName.trim()
          : 'Tudományos Archívum',
      relevanceNote:
        typeof record.relevanceNote === 'string' && record.relevanceNote.trim().length > 0
          ? record.relevanceNote.trim()
          : 'Kapcsolódó megfigyelés az ARCHÍV-82 figyelőrendszeréből.',
      sourceUri: safeUri,
    });
  }

  return sanitized;
}

const FALLBACK_NEWS_DATA: Record<NewsCategoryFilter, DailyArchiveNewsData> = {
  all: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'all',
    dailyBriefingIntro:
      'ARCHÍV-82 Offline Figyelőrendszer · Helyi mentett és ellenőrzött tudományos hírek a sarkvidéki kutatásokról.',
    searchQueries: ['antarctic subglacial lakes research', 'geophysical anomalies recent discoveries'],
    sources: [
      { title: 'British Antarctic Survey Research Reports', uri: 'https://www.bas.ac.uk' },
      { title: 'Nature Geoscience Bulletin', uri: 'https://www.nature.com/ngeo' },
    ],
    articles: [
      {
        id: 'fallback_1',
        title: 'Új subglaciális vízhálózat jeleit térképezték fel a Kelet-Antarktiszi jégpáncél alatt',
        summary:
          'Nemzetközi geofizikai kutatócsoport radaros mérésekkel kimutatta, hogy a 3000 méteres jégtakaró alatt kiterjedt, összekapcsolt tórendszer húzódik meg, amelynek hőmérsékletét geotermikus anomáliák táplálják.',
        category: 'Sarkvidéki Expedíció',
        dateLabel: '2026. November',
        sourceName: 'British Antarctic Survey',
        relevanceNote:
          'Közvetlen párhuzam az ARCHÍV-82 által vizsgált 3200 méteres mélykamra anomáliájával.',
        sourceUri: 'https://www.bas.ac.uk',
      },
      {
        id: 'fallback_2',
        title: 'Mágneses mező ingadozások és szubszonikus rezonancia a 82. szélességi kör közelében',
        summary:
          'A déli sarkvidéki szeizmikus állomások szokatlan, szabályos 432 Hz-es harmonikus rezgéseket rögzítettek, amelyek eredetét a kőzettestek kristályszerkezetével magyarázzák.',
        category: 'Tudományos Anomália',
        dateLabel: '2026. November',
        sourceName: 'Geophysical Research Letters',
        relevanceNote: 'A rádióegységen észlelt morze-jelek és kristályrezonanciák fizikai alapja.',
        sourceUri: 'https://agupubs.onlinelibrary.wiley.com',
      },
      {
        id: 'fallback_3',
        title: 'Kvantum-megfigyelői hatások makroszkopikus rendszerekben: új elmélet az időérzékelésről',
        summary:
          'A legfrissebb elméleti fizikai publikációk szerint a megfigyelő tudatos részvétele mérhetően befolyásolja a kvantumállapotok stabilitását a hűtött kristályrácsokban.',
        category: 'Meta-narratív Kutatás',
        dateLabel: '2026. Október',
        sourceName: 'Nature Physics',
        relevanceNote:
          'A Spirál és a Kilencedik Kamra működési elve a valóságformáló megfigyelőn alapul.',
        sourceUri: 'https://www.nature.com/nphys',
      },
    ],
  },
  arctic: {
    editionDate: getTodayDateString(),
    fetchedAt: new Date().toISOString(),
    category: 'arctic',
    dailyBriefingIntro: 'Sarkvidéki Expedíciós Hírek és Jégmag-elemzési jelentések.',
    searchQueries: ['antarctic ice core drilling 40000 years'],
    sources: [
      {
        title: 'Antarctic Science Journal',
        uri: 'https://www.cambridge.org/core/journals/antarctic-science',
      },
    ],
    articles: [
      {
        id: 'fb_arc_1',
        title: '40 000 éves jégminták elemzése a mélyfúrásokból',
        summary:
          'A legmélyebb antarktiszi jégmagok oxigén-izotóp aránya óriási éghajlati ingadozásokat mutat, miközben kristályrácsaikban ősi gázbuborékok maradtak fenn.',
        category: 'Sarkvidéki Expedíció',
        dateLabel: '2026. November',
        sourceName: 'Antarctic Science',
        relevanceNote: 'Levente pesti szobájában talált jégminták azonos korúak ezzel a réteggel.',
        sourceUri: 'https://www.cambridge.org',
      },
    ],
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
        summary:
          'A kontinensek alatti kőzetlemezeken átvonuló alacsony frekvenciájú hullámok megfejthetetlen fizikai mintázatokat mutatnak.',
        category: 'Tudományos Anomália',
        dateLabel: '2026. November',
        sourceName: 'SSA Bulletin',
        relevanceNote: 'A jég alatti 58 BPM-es pulzus és a morze-jelek analógiája.',
        sourceUri: 'https://www.seismosoc.org',
      },
    ],
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
        summary:
          'A modern kvantum-információelmélet azt vizsgálja, hogy a le nem írt események és a megfigyelő szándéka hogyan formálják a mérési eredményeket.',
        category: 'Meta-narratív Kutatás',
        dateLabel: '2026. November',
        sourceName: 'Quantum Information',
        relevanceNote: '„Talán te.” — A megfigyelő szerepe a Spirál lezárásában.',
        sourceUri: 'https://www.nature.com',
      },
    ],
  },
};

export function getFallbackArchiveNews(
  category: NewsCategoryFilter,
  errorReason?: string
): DailyArchiveNewsData {
  const base = FALLBACK_NEWS_DATA[category] || FALLBACK_NEWS_DATA.all;
  const lastSync = getLastSyncTimestamp() || undefined;
  return {
    ...base,
    editionDate: getTodayDateString(),
    cached: true,
    syncStatus: 'offline',
    lastSyncedAt: lastSync,
    errorReason,
  };
}

export function getCachedArchiveNews(
  category: NewsCategoryFilter
): DailyArchiveNewsData | null {
  const today = getTodayDateString();
  const cacheKey = `${STORAGE_PREFIX}_${today}_${category}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyArchiveNewsData;
    const cleanArticles = sanitizeArchiveArticles(parsed?.articles);
    if (parsed && parsed.editionDate === today && cleanArticles.length > 0) {
      return {
        ...parsed,
        articles: cleanArticles,
        cached: true,
        syncStatus: 'cached',
        lastSyncedAt: parsed.fetchedAt || getLastSyncTimestamp() || undefined,
      };
    }
  } catch {
    // Ignore invalid local storage payload
  }
  return null;
}

export function getLastKnownArchiveNews(
  category: NewsCategoryFilter
): DailyArchiveNewsData | null {
  const todayCached = getCachedArchiveNews(category);
  if (todayCached) return todayCached;

  try {
    const raw = localStorage.getItem(`${LAST_PAYLOAD_PREFIX}_${category}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyArchiveNewsData;
    const cleanArticles = sanitizeArchiveArticles(parsed?.articles);
    if (parsed && cleanArticles.length > 0) {
      return {
        ...parsed,
        articles: cleanArticles,
        cached: true,
        syncStatus: 'offline',
        lastSyncedAt: parsed.fetchedAt || getLastSyncTimestamp() || undefined,
      };
    }
  } catch {
    // Ignore invalid local storage payload
  }
  return null;
}

export async function fetchDailyArchiveNewsClient(
  category: NewsCategoryFilter,
  forceRefresh = false,
  externalSignal?: AbortSignal
): Promise<DailyArchiveNewsData> {
  if (!forceRefresh) {
    const cached = getCachedArchiveNews(category);
    if (cached && cached.articles.length > 0) return cached;
  }

  const buildOfflineFallback = (reason: string): DailyArchiveNewsData => {
    const lastKnown = getLastKnownArchiveNews(category);
    if (lastKnown) {
      return {
        ...lastKnown,
        cached: true,
        syncStatus: 'offline',
        lastSyncedAt: lastKnown.lastSyncedAt || getLastSyncTimestamp() || undefined,
        errorReason: reason,
      };
    }
    return getFallbackArchiveNews(category, reason);
  };

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return buildOfflineFallback('Nincs aktív hálózati kapcsolat');
  }

  const params = new URLSearchParams({ category });
  if (forceRefresh) {
    params.set('refresh', 'true');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);
  const onExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      window.clearTimeout(timeoutId);
      return buildOfflineFallback('A frissítés megszakítva');
    }
    externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(`/api/archive-news?${params.toString()}`, {
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const textSample = await response.text();
      console.warn('[ArchiveNews] Non-JSON response received:', textSample.slice(0, 120));
      return buildOfflineFallback(`Nem várt választípus (HTTP ${response.status})`);
    }

    const payload = await response.json();

    if (!response.ok) {
      const safeErr =
        typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Szerverhiba (HTTP ${response.status})`;
      return buildOfflineFallback(safeErr);
    }

    const typedData = payload as DailyArchiveNewsData;
    const cleanArticles = sanitizeArchiveArticles(typedData?.articles);
    if (!typedData || cleanArticles.length === 0) {
      return buildOfflineFallback('Üres vagy hibás szerkezetű hírlista érkezett');
    }

    const syncedAt = typedData.fetchedAt || new Date().toISOString();
    const normalizedData: DailyArchiveNewsData = {
      ...typedData,
      articles: cleanArticles,
      sources: Array.isArray(typedData.sources) ? typedData.sources : [],
      searchQueries: Array.isArray(typedData.searchQueries) ? typedData.searchQueries : [],
      fetchedAt: syncedAt,
      cached: false,
      syncStatus: 'live',
      lastSyncedAt: syncedAt,
    };

    const cacheKey = `${STORAGE_PREFIX}_${normalizedData.editionDate || getTodayDateString()}_${category}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(normalizedData));
      localStorage.setItem(`${LAST_PAYLOAD_PREFIX}_${category}`, JSON.stringify(normalizedData));
      saveLastSyncTimestamp(syncedAt);
    } catch {
      // Ignore storage quota errors
    }

    return normalizedData;
  } catch (err: unknown) {
    window.clearTimeout(timeoutId);
    console.warn('[ArchiveNews] Fetch failed, using offline fallback:', err);
    const reason =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'Időtúllépés a hírlekérés során'
        : 'A hírszerver jelenleg nem elérhető';
    return buildOfflineFallback(reason);
  } finally {
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}
