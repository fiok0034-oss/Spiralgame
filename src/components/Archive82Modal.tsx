import React, { useState } from 'react';
import { MemoryFragment } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';

interface Archive82ModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryFragment[];
}

export const Archive82Modal: React.FC<Archive82ModalProps> = ({
  isOpen,
  onClose,
  memories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMemory, setSelectedMemory] = useState<MemoryFragment | null>(
    memories.find((m) => m.isUnlocked) || null
  );

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Összes Dosszié' },
    { id: 'antarktisz', label: 'Antarktisz 82°' },
    { id: 'tudat', label: 'Tudati Rétegek' },
    { id: 'idotorzulas', label: 'Időanomáliák' },
    { id: 'orzo', label: 'Őrzők Krónikája' },
    { id: 'vegtelen', label: 'A Végtelen' },
  ];

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const unlockedCount = memories.filter((m) => m.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📁</span>
            <div>
              <h2 className="text-base font-semibold tracking-wider text-cyan-300 uppercase font-mono">
                ARCHÍV-82 // AZ EMLÉKEZETI ADATBÁZIS
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>Felfedezett töredékek:</span>
                <span className="text-cyan-400 font-semibold tabular-nums">
                  {unlockedCount} / {memories.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>Integritás: Stabil</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 text-xs font-mono border border-slate-700 rounded hover:border-slate-500 transition-colors cursor-pointer"
          >
            BEZÁRÁS [ESC]
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                soundEngine.playUiClick();
              }}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Memory List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-4 space-y-2">
            {filteredMemories.map((mem) => {
              const isSelected = selectedMemory?.id === mem.id;
              return (
                <div
                  key={mem.id}
                  onClick={() => {
                    if (mem.isUnlocked) {
                      setSelectedMemory(mem);
                      soundEngine.playUiClick();
                    }
                  }}
                  className={`p-3 rounded-lg border transition-all ${
                    !mem.isUnlocked
                      ? 'border-slate-800/60 bg-slate-950/30 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">
                      {mem.isUnlocked ? mem.date : 'TITKOSÍTOTT DÁTUM'}
                    </span>
                    <span className="text-cyan-400/80">
                      {mem.isUnlocked ? `REZ: ${mem.resonanceLevel}` : 'ZÁROLT'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {mem.isUnlocked ? mem.title : '/// TÖREDÉK ELÉRÉSE BLOKKOLVA ///'}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {mem.isUnlocked
                      ? mem.preview
                      : 'A valóság rétege még nem emlékezett rá. Fedezd fel a döntéseidben.'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Memory Detailed Dossier */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-slate-950/30 flex flex-col justify-between">
            {selectedMemory && selectedMemory.isUnlocked ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    <span>ARCHÍV-82 DOKUMENTUM</span>
                    {selectedMemory.coordinates && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400">{selectedMemory.coordinates}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-cinzel font-bold text-slate-100 mt-1">
                    {selectedMemory.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    Rögzítés ideje: {selectedMemory.date}
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                  {selectedMemory.fullText}
                </div>

                {/* Related Memories Linker */}
                {selectedMemory.relatedMemoryIds && selectedMemory.relatedMemoryIds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h5 className="text-xs font-mono text-cyan-300 uppercase tracking-wider mb-2">
                      KAPCSOLÓDÓ TUDATVONALAK:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.relatedMemoryIds.map((relId) => {
                        const relMem = memories.find((m) => m.id === relId);
                        if (!relMem) return null;
                        return (
                          <button
                            key={relId}
                            onClick={() => {
                              if (relMem.isUnlocked) {
                                setSelectedMemory(relMem);
                                soundEngine.playUiClick();
                              }
                            }}
                            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                              relMem.isUnlocked
                                ? 'border-cyan-500/30 bg-slate-900 text-cyan-200 hover:bg-slate-800 cursor-pointer'
                                : 'border-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            🔗 {relMem.isUnlocked ? relMem.title : 'Ismeretlen kapcsolat'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-500 font-mono text-xs">
                Válassz ki egy feloldott emlékfragmentumot a bal oldali listából.
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>CSURIK KONRÁD // A SPIRÁL LEHELETE</span>
              <span>KÁNONI FORRÁS: ARCHÍV-82 EXPEDÍCIÓS JEGYZÉK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
