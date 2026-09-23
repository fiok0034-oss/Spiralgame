import React from 'react';
import { IceBreathIndicator } from '../effects/IceBreathIndicator';
import { soundEngine } from '../audio/SoundEngine';

interface TopBarNavProps {
  onOpenArchive: () => void;
  onOpenRadio: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  unlockedMemoriesCount: number;
  totalMemoriesCount: number;
}

export const TopBarNav: React.FC<TopBarNavProps> = ({
  onOpenArchive,
  onOpenRadio,
  onOpenProfile,
  onOpenSettings,
  unlockedMemoriesCount,
  totalMemoriesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 md:px-8 py-3 flex items-center justify-between transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-4">
        <span className="text-base md:text-lg font-cinzel font-bold tracking-wider text-slate-100 select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
          A SPIRÁL LEHELETE
        </span>
        <div className="hidden sm:block border-l border-slate-800 pl-3">
          <IceBreathIndicator />
        </div>
      </div>

      {/* Zone 2: Clean 4-6 text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-mono tracking-wider">
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenArchive();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>ARCHÍV-82</span>
          <span className="text-[10px] text-cyan-400 font-semibold tabular-nums">
            ({unlockedMemoriesCount}/{totalMemoriesCount})
          </span>
        </button>

        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenRadio();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          RÁDIÓEGYSÉG
        </button>

        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenProfile();
          }}
          className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          SPIRÁLPROFIL
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        {/* Mobile menu quick buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenArchive}
            className="p-1.5 text-slate-300 hover:text-cyan-300 text-xs font-mono"
            title="Archívum"
          >
            📁
          </button>
          <button
            onClick={onOpenRadio}
            className="p-1.5 text-slate-300 hover:text-cyan-300 text-xs font-mono"
            title="Rádió"
          >
            📻
          </button>
          <button
            onClick={onOpenProfile}
            className="p-1.5 text-slate-300 hover:text-cyan-300 text-xs font-mono"
            title="Profil"
          >
            🌀
          </button>
        </div>

        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenSettings();
          }}
          className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
          title="Beállítások"
        >
          ⚙️ BEÁLLÍTÁSOK
        </button>
      </div>
    </header>
  );
};
