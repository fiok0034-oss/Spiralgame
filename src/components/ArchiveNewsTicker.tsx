import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  startTransition,
} from 'react';
import {
  ExternalLink,
  Newspaper,
  Pause,
  Play,
  RefreshCw,
  WifiOff,
  Radio,
  Database,
} from 'lucide-react';
import {
  ArchiveNewsArticle,
  NewsSyncStatus,
  fetchDailyArchiveNewsClient,
  formatSyncTimestampHu,
  getCachedArchiveNews,
  getFallbackArchiveNews,
  getLastKnownArchiveNews,
  getLastSyncTimestamp,
  sanitizeArchiveArticles,
} from '../services/archiveNewsService';
import { soundEngine } from '../audio/SoundEngine';

interface ArchiveNewsTickerProps {
  onOpenNewsTab: () => void;
}

const PERIODIC_POLL_MS = 1000 * 60 * 15; // 15 perces periodikus háttérfrissítés

function scheduleNonBlocking(task: () => void): () => void {
  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof idleWindow.requestIdleCallback === 'function') {
    const handle = idleWindow.requestIdleCallback(task, { timeout: 600 });
    return () => {
      if (typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(handle);
      }
    };
  }
  const timerId = globalThis.setTimeout(task, 16);
  return () => globalThis.clearTimeout(timerId);
}

export const ArchiveNewsTicker: React.FC<ArchiveNewsTickerProps> = ({ onOpenNewsTab }) => {
  const initialSnapshot = useMemo(() => {
    const cached = getCachedArchiveNews('all');
    if (cached && cached.articles.length > 0) {
      return {
        articles: sanitizeArchiveArticles(cached.articles),
        syncStatus: (typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'cached') as NewsSyncStatus,
        lastSyncedAt: cached.lastSyncedAt || getLastSyncTimestamp(),
      };
    }

    const lastKnown = getLastKnownArchiveNews('all');
    if (lastKnown && lastKnown.articles.length > 0) {
      return {
        articles: sanitizeArchiveArticles(lastKnown.articles),
        syncStatus: 'offline' as NewsSyncStatus,
        lastSyncedAt: lastKnown.lastSyncedAt || getLastSyncTimestamp(),
      };
    }

    const fallback = getFallbackArchiveNews('all');
    return {
      articles: sanitizeArchiveArticles(fallback.articles),
      syncStatus: 'offline' as NewsSyncStatus,
      lastSyncedAt: getLastSyncTimestamp(),
    };
  }, []);

  const [articles, setArticles] = useState<ArchiveNewsArticle[]>(initialSnapshot.articles);
  const [syncStatus, setSyncStatus] = useState<NewsSyncStatus>(initialSnapshot.syncStatus);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(initialSnapshot.lastSyncedAt);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const lastValidArticlesRef = useRef<ArchiveNewsArticle[]>(initialSnapshot.articles);
  const activeAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const loadHeadlines = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return;

    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortRef.current = controller;

    startTransition(() => {
      setIsLoading(true);
    });

    try {
      const data = await fetchDailyArchiveNewsClient('all', forceRefresh, controller.signal);
      if (!isMountedRef.current || controller.signal.aborted) return;

      const validated = sanitizeArchiveArticles(data?.articles);

      startTransition(() => {
        if (validated.length > 0) {
          lastValidArticlesRef.current = validated;
          setArticles(validated);
          setSyncStatus(data.syncStatus || (data.cached ? 'cached' : 'live'));
          if (data.lastSyncedAt) {
            setLastSyncedAt(data.lastSyncedAt);
          } else if (data.syncStatus === 'live' && data.fetchedAt) {
            setLastSyncedAt(data.fetchedAt);
          }
          setErrorReason(data.errorReason || null);
        } else {
          // Hibás vagy üres adat esetén megtartjuk az utolsó érvényes adatsort, hogy az animáció ne álljon le
          if (lastValidArticlesRef.current.length === 0) {
            const safeFallback = sanitizeArchiveArticles(getFallbackArchiveNews('all').articles);
            lastValidArticlesRef.current = safeFallback;
          }
          setArticles(lastValidArticlesRef.current);
          setSyncStatus('offline');
          setErrorReason('Hibás vagy üres hírfolyam érkezett');
        }
      });
    } catch {
      if (!isMountedRef.current || controller.signal.aborted) return;
      startTransition(() => {
        // Soha ne ürítsük ki a tickert hiba esetén sem
        if (lastValidArticlesRef.current.length === 0) {
          lastValidArticlesRef.current = sanitizeArchiveArticles(
            getFallbackArchiveNews('all').articles
          );
        }
        setArticles(lastValidArticlesRef.current);
        setSyncStatus('offline');
        setErrorReason('A hírszinkronizálás jelenleg nem elérhető');
      });
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        startTransition(() => {
          setIsLoading(false);
        });
      }
    }
  }, []);

  // Nem blokkoló kezdeti háttérszinkronizálás idle ciklusban
  useEffect(() => {
    isMountedRef.current = true;
    const cancelIdle = scheduleNonBlocking(() => {
      void loadHeadlines(false);
    });

    return () => {
      isMountedRef.current = false;
      cancelIdle();
      if (activeAbortRef.current) {
        activeAbortRef.current.abort();
      }
    };
  }, [loadHeadlines]);

  // Periodikus háttérfrissítés nem blokkoló ütemezéssel
  useEffect(() => {
    let cancelIdlePoll: (() => void) | null = null;
    const pollId = window.setInterval(() => {
      cancelIdlePoll = scheduleNonBlocking(() => {
        void loadHeadlines(true);
      });
    }, PERIODIC_POLL_MS);

    return () => {
      window.clearInterval(pollId);
      if (cancelIdlePoll) cancelIdlePoll();
    };
  }, [loadHeadlines]);

  // Böngésző online/offline események követése
  useEffect(() => {
    let cancelOnlineIdle: (() => void) | null = null;

    const handleOffline = () => {
      startTransition(() => {
        setSyncStatus('offline');
        setErrorReason('Nincs aktív hálózati kapcsolat');
      });
    };

    const handleOnline = () => {
      cancelOnlineIdle = scheduleNonBlocking(() => {
        void loadHeadlines(true);
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (cancelOnlineIdle) cancelOnlineIdle();
    };
  }, [loadHeadlines]);

  // Garantáljuk, hogy a futószalag mindig rendelkezzen biztonságos elemekkel és megfelelő hosszúsággal
  const safeArticles = useMemo(() => {
    const cleaned = sanitizeArchiveArticles(articles);
    if (cleaned.length > 0) return cleaned;
    return sanitizeArchiveArticles(getFallbackArchiveNews('all').articles);
  }, [articles]);

  const marqueeItems = useMemo(() => {
    if (safeArticles.length === 0) return [];
    const baseTrack = [...safeArticles];
    while (baseTrack.length < 4) {
      baseTrack.push(...safeArticles);
    }
    return [...baseTrack, ...baseTrack];
  }, [safeArticles]);

  const formattedSyncTime = formatSyncTimestampHu(lastSyncedAt);

  const statusMeta = useMemo(() => {
    if (isLoading) {
      return {
        label: `Szinkronizálás... (${formattedSyncTime})`,
        badgeClass: 'border-cyan-500/35 bg-cyan-950/35 text-cyan-300',
        dotClass: 'bg-cyan-400 animate-ping',
        tooltip: 'Háttérben futó frissítés — a hírszalag zavartalanul folytatódik',
        Icon: RefreshCw,
        spin: true,
      };
    }

    if (syncStatus === 'live') {
      return {
        label: `Élő · utolsó szinkronizálás: ${formattedSyncTime}`,
        badgeClass: 'border-emerald-500/35 bg-emerald-950/30 text-emerald-300',
        dotClass: 'bg-emerald-400',
        tooltip: 'Valós idejű Google Search Grounding kapcsolat aktív',
        Icon: Radio,
        spin: false,
      };
    }

    if (syncStatus === 'cached') {
      return {
        label: `Gyorsítótár · utolsó szinkronizálás: ${formattedSyncTime}`,
        badgeClass: 'border-cyan-500/30 bg-slate-900/80 text-cyan-200',
        dotClass: 'bg-cyan-400',
        tooltip: 'Mai mentett archívum megjelenítése',
        Icon: Database,
        spin: false,
      };
    }

    return {
      label: `Offline: utolsó szinkronizálás: ${formattedSyncTime}`,
      badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
      dotClass: 'bg-amber-400',
      tooltip: errorReason || 'Offline vagy tartalék archívum aktív',
      Icon: WifiOff,
      spin: false,
    };
  }, [isLoading, syncStatus, formattedSyncTime, errorReason]);

  const StatusIcon = statusMeta.Icon;

  return (
    <div className="px-3 sm:px-5 py-2 bg-[#030916] border-b border-cyan-500/25 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 text-xs font-mono">
      {/* Ticker Badge + Sync Status */}
      <div className="flex items-center gap-1.5 shrink-0 max-w-full">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onOpenNewsTab();
          }}
          className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold uppercase text-[10px] inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          title="Teljes Napi Archív Hírek nézet megnyitása"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
          <Newspaper className="w-3 h-3" />
          <span className="hidden sm:inline">Napi Archív Hírek</span>
          <span className="sm:hidden">Hírek</span>
        </button>

        <div
          className={`px-2 py-1 rounded border text-[10px] inline-flex items-center gap-1.5 min-w-0 max-w-[195px] sm:max-w-[260px] ${statusMeta.badgeClass}`}
          title={statusMeta.tooltip}
          aria-live="polite"
        >
          <StatusIcon className={`w-3 h-3 shrink-0 ${statusMeta.spin ? 'animate-spin' : ''}`} />
          <span className="truncate">{statusMeta.label}</span>
        </div>
      </div>

      {/* Scrolling Marquee Container — mindvégig aktív marad */}
      <div className="flex-1 min-w-[180px] overflow-hidden relative">
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
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
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

        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            soundEngine.playUiClick();
            scheduleNonBlocking(() => {
              void loadHeadlines(true);
            });
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
