import React, { useEffect, useState, useCallback } from 'react';
import {
  ExternalLink,
  Newspaper,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import {
  ArchiveNewsArticle,
  fetchDailyArchiveNewsClient,
  getCachedArchiveNews,
} from '../services/archiveNewsService';
import { soundEngine } from '../audio/SoundEngine';

interface ArchiveNewsTickerProps {
  onOpenNewsTab: () => void;
}

const PERIODIC_POLL_MS = 1000 * 60 * 15; // 15 perces periodikus frissítés

export const ArchiveNewsTicker: React.FC<ArchiveNewsTickerProps> = ({ onOpenNewsTab }) => {
  const [articles, setArticles] = useState<ArchiveNewsArticle[]>(() => {
    const cached = getCachedArchiveNews('all') || getCachedArchiveNews('arctic');
    return cached?.articles || [];
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const loadHeadlines = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const data = await fetchDailyArchiveNewsClient('all', forceRefresh);
      if (data.articles.length > 0) {
        setArticles(data.articles);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'A napi hírszál jelenleg nem érhető el.';
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (articles.length === 0) {
      void loadHeadlines(false);
    }
  }, [articles.length, loadHeadlines]);

  // Periodikus háttérfrissítés valós idejű hírekhez
  useEffect(() => {
    const pollId = window.setInterval(() => {
      void loadHeadlines(true);
    }, PERIODIC_POLL_MS);
    return () => window.clearInterval(pollId);
  }, [loadHeadlines]);

  // Duplicated track for seamless continuous horizontal marquee scrolling
  const marqueeItems = articles.length > 0 ? [...articles, ...articles] : [];

  return (
    <div className="px-4 sm:px-5 py-2 bg-[#030916] border-b border-cyan-500/25 flex items-center gap-2.5 text-xs font-mono">
      {/* Ticker Badge */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playUiClick();
          onOpenNewsTab();
        }}
        className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold uppercase text-[10px] inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
        title="Teljes Napi Archív Hírek nézet megnyitása"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <Newspaper className="w-3 h-3" />
        <span>Napi Archív Hírek</span>
      </button>

      {/* Scrolling Marquee Container */}
      <div className="flex-1 min-w-0 overflow-hidden relative">
        {isLoading && articles.length === 0 ? (
          <div className="text-slate-400 inline-flex items-center gap-1.5 py-0.5">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
            <span className="truncate">
              Valós idejű tudományos anomáliák, sarkvidéki és meta-narratív hírek betöltése...
            </span>
          </div>
        ) : marqueeItems.length > 0 ? (
          <div
            className={`archive-ticker-track items-center gap-8 ${
              isPaused ? 'archive-ticker-paused' : ''
            }`}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}_${idx}`}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] uppercase">
                  {item.category}
                </span>
                <span className="text-amber-300 text-[10px]">[{item.dateLabel}]</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    onOpenNewsTab();
                  }}
                  className="text-slate-100 hover:text-cyan-200 cursor-pointer transition-colors"
                  title={`${item.title} — ${item.summary}`}
                >
                  {item.title}
                </button>
                <span className="text-slate-500">— {item.sourceName}</span>
                {item.sourceUri && (
                  <a
                    href={item.sourceUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center"
                    title="Forrás megnyitása új lapon"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="text-cyan-500/40 pl-4" aria-hidden="true">
                  ◈
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-amber-300/90 truncate py-0.5" title={errorText || undefined}>
            {errorText || 'Nincsenek megjeleníthető napi tudományos és sarkvidéki hírek.'}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {articles.length > 0 && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              setIsPaused((p) => !p);
            }}
            className="p-1.5 rounded border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-slate-100 cursor-pointer"
            aria-label={isPaused ? 'Hírszalag indítása' : 'Hírszalag szüneteltetése'}
            title={isPaused ? 'Hírszalag folytatása' : 'Hírszalag szüneteltetése'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            soundEngine.playUiClick();
            void loadHeadlines(true);
          }}
          className="p-1.5 rounded border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
          aria-label="Hírszalag frissítése"
          title="Valós idejű hírek frissítése"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
