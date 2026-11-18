import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Calendar,
  Compass,
  Radio,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import {
  DailyArchiveNewsData,
  NewsCategoryFilter,
  fetchDailyArchiveNewsClient,
  formatHungarianDate,
  getCachedArchiveNews,
  getTodayDateString,
} from '../services/archiveNewsService';

const AUTO_SYNC_PREF_KEY = 'spiral_daily_archive_auto_sync_v1';

const CATEGORY_OPTIONS: Array<{ id: NewsCategoryFilter; label: string }> = [
  { id: 'all', label: 'Összes Témakör' },
  { id: 'arctic', label: 'Sarkvidéki Expedíciók' },
  { id: 'anomalies', label: 'Tudományos Anomáliák' },
  { id: 'meta', label: 'Meta-narratív Kutatás' },
];

export const DailyArchiveNewsTab: React.FC = () => {
  const [category, setCategory] = useState<NewsCategoryFilter>('all');
  const [newsData, setNewsData] = useState<DailyArchiveNewsData | null>(() =>
    getCachedArchiveNews('all')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoDailySync, setAutoDailySync] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTO_SYNC_PREF_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const loadArchiveNews = useCallback(
    async (selectedCategory: NewsCategoryFilter, forceRefresh = false) => {
      if (!forceRefresh) {
        const cached = getCachedArchiveNews(selectedCategory);
        if (cached) {
          setNewsData(cached);
          setErrorMessage(null);
          return;
        }
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchDailyArchiveNewsClient(selectedCategory, forceRefresh);
        setNewsData(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Váratlan hálózati hiba történt a hírek szinkronizálása közben.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadArchiveNews(category, false);
  }, [category, loadArchiveNews]);

  // Recurring daily rollover check when autoDailySync is active
  useEffect(() => {
    if (!autoDailySync) return;
    const intervalId = window.setInterval(() => {
      const today = getTodayDateString();
      if (newsData && newsData.editionDate !== today) {
        void loadArchiveNews(category, true);
      }
    }, 60_000 * 5);
    return () => window.clearInterval(intervalId);
  }, [autoDailySync, category, loadArchiveNews, newsData]);

  const toggleAutoSync = () => {
    const next = !autoDailySync;
    setAutoDailySync(next);
    soundEngine.playUiClick();
    try {
      localStorage.setItem(AUTO_SYNC_PREF_KEY, String(next));
    } catch {
      // Ignore storage error
    }
  };

  const todayFormatted = formatHungarianDate(newsData?.editionDate || getTodayDateString());

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/35 bg-slate-950/75 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Napi Archív Hírek · Valós Idejű Sajtószemle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Az ARCHÍV-82 külső műholdas figyelőrendszere naponta összegyűjti a való világ friss sarkvidéki kutatási expedícióit és tudományos anomáliáit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAutoSync}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-mono cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                autoDailySync
                  ? 'border-emerald-500/45 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
              title="Automatikus napi hírszinkronizáció napváltáskor"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{autoDailySync ? 'Napi szinkron: Aktív' : 'Napi szinkron: Kézi'}</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                soundEngine.playDiscovery();
                void loadArchiveNews(category, true);
              }}
              className="px-3.5 py-1.5 min-h-[36px] rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Keresés...' : 'Frissítés most'}</span>
            </button>
          </div>
        </div>

        {/* Category Selector & Edition Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  soundEngine.playUiClick();
                  setCategory(opt.id);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                  category === opt.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Kiadás dátuma: {todayFormatted}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-8 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-cinzel font-bold text-cyan-200">
            Valós idejű tudományos és sarkvidéki hírek keresése...
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            A Google Keresési (Search Grounding) csatorna ellenőrzi a legfrissebb geofizikai, kvantumfizikai és antarktiszi publikációkat.
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="rounded-2xl border border-red-500/45 bg-red-950/20 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-cinzel font-bold text-red-200">
                A Napi Archív Hírek lekérdezése sikertelen
              </div>
              <p className="text-xs font-mono text-red-200/85 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadArchiveNews(category, true)}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-xs font-mono font-bold text-red-100 cursor-pointer"
          >
            Újrapróbálkozás
          </button>
        </div>
      )}

      {/* News Content */}
      {!isLoading && !errorMessage && newsData && (
        <div className="space-y-4">
          {/* Briefing Intro */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/35 text-xs text-amber-100 leading-relaxed flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-amber-300 uppercase text-[11px] block mb-0.5">
                Napi Összefoglaló · {todayFormatted}
              </span>
              {newsData.dailyBriefingIntro}
            </div>
          </div>

          {/* News Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {newsData.articles.map((article) => (
              <article
                key={article.id}
                className="rounded-xl border border-slate-800 hover:border-cyan-500/45 bg-slate-950/80 p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/35 text-cyan-300">
                      {article.category}
                    </span>
                    <span className="text-slate-400">{article.dateLabel}</span>
                  </div>

                  <h4 className="text-sm md:text-base font-cinzel font-bold text-slate-100 leading-snug">
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2.5 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-amber-300/90 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{article.relevanceNote}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <span className="truncate">Forrás: {article.sourceName}</span>
                    {article.sourceUri && (
                      <a
                        href={article.sourceUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 shrink-0 underline underline-offset-2"
                      >
                        <span>Megnyitás</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Grounding Sources Footer */}
          {newsData.sources && newsData.sources.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                Ellenőrzött Google Keresési Hivatkozások ({newsData.sources.length} forrás)
              </div>
              <div className="flex flex-wrap gap-2">
                {newsData.sources.map((src) => (
                  <a
                    key={src.uri}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/50 bg-slate-900/90 text-[11px] font-mono text-slate-300 hover:text-cyan-200 inline-flex items-center gap-1.5 transition-colors max-w-xs"
                  >
                    <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{src.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
