import React from 'react';
import { IceBreathIndicator } from '../effects/IceBreathIndicator';
import { soundEngine } from '../audio/SoundEngine';

interface TopBarNavProps {
  onOpenArchive: () => void;
  onOpenRadio: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenStoryLog?: () => void;
  unlockedMemoriesCount: number;
  totalMemoriesCount: number;
  storyLogCount?: number;
}

export const TopBarNav: React.FC<TopBarNavProps> = ({
  onOpenArchive,
  onOpenRadio,
  onOpenProfile,
  onOpenSettings,
  onOpenStoryLog,
  unlockedMemoriesCount,
  totalMemoriesCount,
  storyLogCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/20 px-4 md:px-8 py-3 flex items-center justify-between gap-3 transition-colors">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm md:text-lg font-cinzel font-bold tracking-wider text-slate-100 select-none whitespace-nowrap">
          A SPIRÁL LEHELETE
        </span>
        <div className="hidden sm:block border-l border-slate-800 pl-3">
          <IceBreathIndicator />
        </div>
      </div>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider shrink-0">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onOpenArchive();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>ARCHÍV-82</span>
          <span className="text-[11px] text-cyan-400 font-semibold tabular-nums">
            ({unlockedMemoriesCount}/{totalMemoriesCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onOpenRadio();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          RÁDIÓEGYSÉG
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onOpenProfile();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          SPIRÁLPROFIL
        </button>

        {onOpenStoryLog && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onOpenStoryLog();
            }}
            className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            title="Történeti Napló és kulcsdöntések"
          >
            <span>NAPLÓ</span>
            {storyLogCount !== undefined && (
              <span className="text-[11px] text-cyan-400 font-semibold tabular-nums">
                ({storyLogCount})
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex md:hidden items-center gap-1.5">
          {onOpenStoryLog && (
            <button
              type="button"
              onClick={onOpenStoryLog}
              className="px-2 py-1.5 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-800 rounded"
              title="Történeti Napló"
            >
              NAPLÓ
            </button>
          )}
          <button
            type="button"
            onClick={onOpenArchive}
            className="px-2 py-1.5 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-800 rounded"
            title="Archívum"
          >
            ARCHÍV
          </button>
          <button
            type="button"
            onClick={onOpenRadio}
            className="px-2 py-1.5 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-800 rounded"
            title="Rádió"
          >
            RÁDIÓ
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            className="px-2 py-1.5 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-800 rounded"
            title="Profil"
          >
            PROFIL
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            onOpenSettings();
          }}
          className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          title="Beállítások"
        >
          BEÁLLÍTÁSOK
        </button>
      </div>
    </header>
  );
};
