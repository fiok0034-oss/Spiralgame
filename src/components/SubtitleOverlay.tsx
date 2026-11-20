import React from 'react';
import { Square, Volume2 } from 'lucide-react';
import { SubtitleState } from '../audio/aiVoiceService';

interface SubtitleOverlayProps {
  subtitle: SubtitleState | null;
  enabled: boolean;
  onStop: () => void;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitle,
  enabled,
  onStop,
}) => {
  if (!subtitle || (!subtitle.isActive && !subtitle.errorNote)) return null;
  if (!enabled && !subtitle.errorNote) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[min(760px,94vw)] pointer-events-auto"
    >
      <div className="rounded-xl bg-[#040812]/95 border border-cyan-500/40 px-4 py-3 shadow-2xl flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-cyan-400 mb-1">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{subtitle.speakerLabel}</span>
            {subtitle.source === 'subtitle-fallback' && (
              <span className="text-amber-300">· Feliratos tartalék mód</span>
            )}
            {subtitle.cached && <span className="text-slate-400">· Gyorsítótárból</span>}
          </div>
          <p className="text-sm md:text-base text-slate-100 font-sans leading-relaxed">
            „{subtitle.currentSegment}”
          </p>
          {subtitle.errorNote && (
            <p className="text-[11px] font-mono text-amber-300/90 mt-1">{subtitle.errorNote}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onStop}
          className="px-2.5 py-1.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg inline-flex items-center gap-1 shrink-0 cursor-pointer"
          title="Hang és felirat leállítása"
        >
          <Square className="w-3 h-3" />
          <span>Állj</span>
        </button>
      </div>
    </div>
  );
};
