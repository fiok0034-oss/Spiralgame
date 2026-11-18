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

const STORAGE_PREFIX = 'spiral_daily_archive_news_v1';

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatHungarianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}. ${parts[1]}. ${parts[2]}.`;
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
  return null;
}

export async function fetchDailyArchiveNewsClient(
  category: NewsCategoryFilter,
  forceRefresh = false
): Promise<DailyArchiveNewsData> {
  if (!forceRefresh) {
    const cached = getCachedArchiveNews(category);
    if (cached) return cached;
  }

  const params = new URLSearchParams({ category });
  if (forceRefresh) {
    params.set('refresh', 'true');
  }

  const response = await fetch(`/api/archive-news?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error || 'Nem sikerült lekérni a Napi Archív Híreket a szerverről.'
    );
  }

  const typedData = payload as DailyArchiveNewsData;
  const cacheKey = `${STORAGE_PREFIX}_${typedData.editionDate || getTodayDateString()}_${category}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(typedData));
  } catch {
    // Ignore storage quota errors
  }

  return typedData;
}
