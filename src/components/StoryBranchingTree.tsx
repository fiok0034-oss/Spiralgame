import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../game/GameContext';
import { STORY_NODES } from '../data/storyData';
import { soundEngine } from '../audio/SoundEngine';

export interface StoryBranchingTreeProps {
  onClose?: () => void;
}

interface GraphNode {
  id: string;
  tier: number;
  actName: string;
  title: string;
  subtitle: string;
  speaker: string;
  speakerColor: string;
  column: number; // 0, 1, 2, 3
  totalColumnsInTier: number;
  isEnding?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  choiceLabel: string;
  choiceId: string;
}

// Full narrative graph nodes definition
const GRAPH_NODES: GraphNode[] = [
  // TIER 1: ACT 1 VIKTOR INTRO
  {
    id: 'v1_intro',
    tier: 1,
    actName: 'I. FEJEZET: VIKTOR',
    title: 'ARCHÍV-82 Bázis',
    subtitle: 'Kezdőpont · 82°16’S · Mínusz 58°C',
    speaker: 'VIKTOR H.',
    speakerColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 2: ACT 1 BRANCH (RADAR VS RADIO)
  {
    id: 'v1_radar_scan',
    tier: 2,
    actName: 'I. FEJEZET: VIKTOR',
    title: 'Georadar Szkenner',
    subtitle: 'Mélységi anomália · -3200m spirál',
    speaker: 'GEORADAR Δ–82',
    speakerColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
    column: 0,
    totalColumnsInTier: 2,
  },
  {
    id: 'v1_radio_scan',
    tier: 2,
    actName: 'I. FEJEZET: VIKTOR',
    title: 'Poláris Rádió',
    subtitle: '142.8 MHz · Dr. Lena hangja a jégből',
    speaker: 'POLÁRIS RÁDIÓ',
    speakerColor: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40',
    column: 1,
    totalColumnsInTier: 2,
  },

  // TIER 3: ACT 1 CAVERN DESCENT (CONVERGENCE)
  {
    id: 'v1_cavern_descent',
    tier: 3,
    actName: 'I. FEJEZET: VIKTOR',
    title: 'A Subglaciális Obeliszk',
    subtitle: 'Δ–T1 jelzés · Fekete monolit · Meleg kő',
    speaker: 'VIKTOR H.',
    speakerColor: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 4: TRANSITION
  {
    id: 'transition_to_lena',
    tier: 4,
    actName: 'ÁTMENET: Δ–T1',
    title: 'A Spirál Átmenet',
    subtitle: 'Tudati rezonancia · Időátcsúszás',
    speaker: 'A SPIRÁL ÁTMENET',
    speakerColor: 'text-teal-300 border-teal-500/50 bg-teal-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 5: ACT 2 LENA INTRO
  {
    id: 'l1_intro',
    tier: 5,
    actName: 'II. FEJEZET: DR. LENA',
    title: 'Neuro-akusztikai Szelet',
    subtitle: 'A jég szalagként emlékszik a döntésekre',
    speaker: 'DR. LENA V.',
    speakerColor: 'text-violet-400 border-violet-500/50 bg-violet-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 6: ACT 2 TRANSMISSIONS
  {
    id: 'l1_transmissions',
    tier: 6,
    actName: 'II. FEJEZET: DR. LENA',
    title: 'A Hangok Alagútja',
    subtitle: 'Mira hívása a Második Kapun át',
    speaker: 'DR. LENA V.',
    speakerColor: 'text-violet-400 border-violet-500/50 bg-violet-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 7: ACT 3 MIRA INTRO
  {
    id: 'm1_intro',
    tier: 7,
    actName: 'III. FEJEZET: MIRA',
    title: 'A Kódváros Pereme',
    subtitle: '„Mit érdemes létrehozni?” · Lebegő Geometria',
    speaker: 'MIRA KESSLER',
    speakerColor: 'text-amber-400 border-amber-500/50 bg-amber-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 8: LEVENTE'S DREAM BRANCH
  {
    id: 'lev1_intro',
    tier: 8,
    actName: 'IV. FEJEZET: LEVENTE',
    title: 'Az Álomvilág Szinkronlelke',
    subtitle: 'Pesti szoba · Jégkristályok a tenyéren',
    speaker: 'LEVENTE',
    speakerColor: 'text-rose-400 border-rose-500/50 bg-rose-950/40',
    column: 1,
    totalColumnsInTier: 2,
  },
  {
    id: 'k1_three_rings',
    tier: 8,
    actName: 'V. FEJEZET: KÓDVÁROS',
    title: 'A Három Kör Központja',
    subtitle: 'Koncentrikus gyűrűk · Szakrális tér',
    speaker: 'HÁROM KÖR MAGJA',
    speakerColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40',
    column: 0,
    totalColumnsInTier: 2,
  },

  // TIER 9: ACT 6 GUARDIANS
  {
    id: 'g1_guardians_confrontation',
    tier: 9,
    actName: 'VI. FEJEZET: ŐRZŐK',
    title: 'Kassarah & Ir-Haya Tanácsa',
    subtitle: 'Az emlékezet és a felejtés egyensúlya',
    speaker: 'KASSARAH & IR-HAYA',
    speakerColor: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 10: FINAL ENCOUNTER
  {
    id: 'inf_final_encounter',
    tier: 10,
    actName: 'VÉGSŐ FEJEZET: A VÉGTELEN',
    title: 'A Végtelen Szeme',
    subtitle: 'A Megfigyelő, a Tükör és a Három Út',
    speaker: 'A VÉGTELEN',
    speakerColor: 'text-purple-300 border-purple-500/50 bg-purple-950/40',
    column: 0,
    totalColumnsInTier: 1,
  },

  // TIER 11: ENDINGS (4 COLUMNS)
  {
    id: 'ending_close',
    tier: 11,
    actName: 'EPILÓGUS — 1. ÚT',
    title: 'A Spirál Lezárása',
    subtitle: 'A kapuk bezárulnak · Az emberiség megmarad',
    speaker: 'EPILÓGUS',
    speakerColor: 'text-blue-400 border-blue-500/50 bg-blue-950/40',
    column: 0,
    totalColumnsInTier: 4,
    isEnding: true,
  },
  {
    id: 'ending_share',
    tier: 11,
    actName: 'EPILÓGUS — 2. ÚT',
    title: 'A Spirál Megosztása',
    subtitle: 'Közös álom · Kollektív emberi tudat',
    speaker: 'EPILÓGUS',
    speakerColor: 'text-cyan-300 border-cyan-400/50 bg-cyan-950/40',
    column: 1,
    totalColumnsInTier: 4,
    isEnding: true,
  },
  {
    id: 'ending_new_world',
    tier: 11,
    actName: 'EPILÓGUS — 3. ÚT',
    title: 'Új Világ: Együttélés',
    subtitle: 'Új horizont · Élet a Spirál leheletével',
    speaker: 'EPILÓGUS',
    speakerColor: 'text-emerald-300 border-emerald-400/50 bg-emerald-950/40',
    column: 2,
    totalColumnsInTier: 4,
    isEnding: true,
  },
  {
    id: 'ending_meta_room',
    tier: 11,
    actName: 'TITKOS BEFEJEZÉS',
    title: 'A Nyitott Ablakú Szoba',
    subtitle: 'A Szerző asztala · „Talán te.”',
    speaker: 'EPILÓGUS META',
    speakerColor: 'text-amber-300 border-amber-400/50 bg-amber-950/40',
    column: 3,
    totalColumnsInTier: 4,
    isEnding: true,
  },
];

// Narrative flow edges
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'v1_intro', to: 'v1_radar_scan', choiceId: 'c_v1_inspect_instruments', choiceLabel: 'Georadar kalibrálása' },
  { from: 'v1_intro', to: 'v1_radio_scan', choiceId: 'c_v1_tune_radio', choiceLabel: 'Rádiófrekvenciák pásztázása' },
  { from: 'v1_radar_scan', to: 'v1_cavern_descent', choiceId: 'c_v1_descend_prepare', choiceLabel: 'Járat feltárása' },
  { from: 'v1_radar_scan', to: 'v1_radio_scan', choiceId: 'c_v1_listen_radio_first', choiceLabel: 'Rádióinterferencia vizsgálata' },
  { from: 'v1_radio_scan', to: 'v1_cavern_descent', choiceId: 'c_v1_record_radio', choiceLabel: 'Barlang bejárata felé sietés' },
  { from: 'v1_radio_scan', to: 'v1_radar_scan', choiceId: 'c_v1_verify_radar', choiceLabel: 'Radar koordináták megerősítése' },
  { from: 'v1_cavern_descent', to: 'transition_to_lena', choiceId: 'c_v1_touch_obelisk', choiceLabel: 'Obeliszk megérintése' },
  { from: 'v1_cavern_descent', to: 'transition_to_lena', choiceId: 'c_v1_document_obelisk', choiceLabel: 'Csak jegyzőkönyvezés' },
  { from: 'transition_to_lena', to: 'l1_intro', choiceId: 'c_enter_chapter_2', choiceLabel: 'Belépés Lena tudatába' },
  { from: 'l1_intro', to: 'l1_transmissions', choiceId: 'c_l1_synchronize', choiceLabel: 'Tudati szinkronizáció' },
  { from: 'l1_intro', to: 'l1_transmissions', choiceId: 'c_l1_analyze_conflict', choiceLabel: 'Konfliktusok elemzése' },
  { from: 'l1_transmissions', to: 'm1_intro', choiceId: 'c_l1_choose_mira', choiceLabel: 'Kapcsolódás Mirához' },
  { from: 'm1_intro', to: 'k1_three_rings', choiceId: 'c_m1_explore_city', choiceLabel: 'Belépés a Kódvárosba' },
  { from: 'm1_intro', to: 'lev1_intro', choiceId: 'c_m1_seek_levente', choiceLabel: 'Levente megkeresése' },
  { from: 'lev1_intro', to: 'k1_three_rings', choiceId: 'c_lev1_awaken_rings', choiceLabel: 'A Három Kör megnyitása' },
  { from: 'k1_three_rings', to: 'g1_guardians_confrontation', choiceId: 'c_ring_1', choiceLabel: '1. Kör: A Jég Emléke' },
  { from: 'k1_three_rings', to: 'g1_guardians_confrontation', choiceId: 'c_ring_2', choiceLabel: '2. Kör: A Hangok Alagútja' },
  { from: 'k1_three_rings', to: 'g1_guardians_confrontation', choiceId: 'c_ring_3', choiceLabel: '3. Kör: A Végtelen Szeme' },
  { from: 'g1_guardians_confrontation', to: 'inf_final_encounter', choiceId: 'c_accept_guardians', choiceLabel: 'Szembenézés a Végtelennel' },
  { from: 'inf_final_encounter', to: 'ending_close', choiceId: 'c_end_close', choiceLabel: '1. Út: Lezárás' },
  { from: 'inf_final_encounter', to: 'ending_share', choiceId: 'c_end_share', choiceLabel: '2. Út: Megosztás' },
  { from: 'inf_final_encounter', to: 'ending_new_world', choiceId: 'c_end_new_world', choiceLabel: '3. Út: Új Világ' },
  { from: 'inf_final_encounter', to: 'ending_meta_room', choiceId: 'c_end_meta', choiceLabel: 'Titkos Út: A Szoba' },
];

export const StoryBranchingTree: React.FC<StoryBranchingTreeProps> = () => {
  const { storyLog, activeSceneId, spiralState } = useGame();

  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeSceneId);
  const [filterAct, setFilterAct] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLDivElement>(null);

  // Set of visited node IDs in order
  const visitedNodeSet = useMemo(() => {
    return new Set(storyLog.map((entry) => entry.sceneId));
  }, [storyLog]);

  // Map of sceneId to the StoryLogEntry for fast lookup
  const visitedMap = useMemo(() => {
    const map = new Map<string, typeof storyLog[0]>();
    storyLog.forEach((entry) => {
      map.set(entry.sceneId, entry);
    });
    return map;
  }, [storyLog]);

  // Set of chosen edge keys ("from->to")
  const chosenEdgeKeys = useMemo(() => {
    const set = new Set<string>();
    storyLog.forEach((entry) => {
      if (entry.chosenOption) {
        // Find which node this choice points to in STORY_NODES
        const rawNode = STORY_NODES[entry.sceneId];
        const choice = rawNode?.choices.find((c) => c.id === entry.chosenOption?.id);
        if (choice) {
          set.add(`${entry.sceneId}->${choice.nextSceneId}`);
        }
      }
    });
    return set;
  }, [storyLog]);

  // Accessible nodes (either visited or directly reachable from a visited node)
  const accessibleNodeSet = useMemo(() => {
    const set = new Set<string>(visitedNodeSet);
    GRAPH_EDGES.forEach((edge) => {
      if (visitedNodeSet.has(edge.from)) {
        set.add(edge.to);
      }
    });
    return set;
  }, [visitedNodeSet]);

  // Scroll to active node
  const handleScrollToActive = () => {
    soundEngine.playUiClick();
    setSelectedNodeId(activeSceneId);
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Group nodes by tier
  const tiers = useMemo(() => {
    const map = new Map<number, GraphNode[]>();
    GRAPH_NODES.forEach((node) => {
      const list = map.get(node.tier) || [];
      list.push(node);
      map.set(node.tier, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, []);

  // Filtered tiers if an Act filter is active
  const displayedTiers = useMemo(() => {
    if (filterAct === 'all') return tiers;
    return tiers.filter(([, nodes]) => nodes.some((n) => n.actName.includes(filterAct)));
  }, [tiers, filterAct]);

  // Details for currently inspected node
  const selectedNode = useMemo(() => {
    return GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];
  }, [selectedNodeId]);

  const selectedNodeLog = useMemo(() => {
    return visitedMap.get(selectedNodeId);
  }, [visitedMap, selectedNodeId]);

  const selectedRawNode = useMemo(() => {
    return STORY_NODES[selectedNodeId];
  }, [selectedNodeId]);

  const isSelectedVisited = visitedNodeSet.has(selectedNodeId);
  const isSelectedCurrent = selectedNodeId === activeSceneId;

  // Calculate statistics
  const totalVisited = visitedNodeSet.size;
  const totalNodes = GRAPH_NODES.length;
  const progressPercent = Math.round((totalVisited / totalNodes) * 100);
  const endingsUnlocked = GRAPH_NODES.filter((n) => n.isEnding && visitedNodeSet.has(n.id)).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 font-sans">
      {/* TOOLBAR & CONTROLS */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🌳</span>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                NARRATÍV ELÁGAZÁSI FA // STORY MAP
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  {progressPercent}% FELTÁRVA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Interaktív döntési térkép: követi a bejárt utadat és mutatja az alternatívákat
              </p>
            </div>
          </div>
        </div>

        {/* STATS & ACTIONS */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <span className="text-slate-400">Bejárva:</span>
            <span className="text-cyan-400 font-bold">{totalVisited}/{totalNodes}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Befejezések:</span>
            <span className="text-amber-400 font-bold">{endingsUnlocked}/4</span>
          </div>

          <button
            onClick={handleScrollToActive}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ugrás a jelenlegi narratív pozícióhoz"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Pozícióm</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              title="Kicsinyítés"
            >
              −
            </button>
            <span className="px-1.5 text-[10px] text-slate-400 font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.2, Number((z + 0.1).toFixed(1))))}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              title="Nagyítás"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* LEGEND STRIP */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-200 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-cyan-200">Jelenlegi pont</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-200" />
            <span className="text-slate-300">Bejárt szakasz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-gradient-to-r from-cyan-400 to-amber-400 rounded" />
            <span className="text-amber-300">Választott elágazás</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-slate-700 bg-slate-900" />
            <span className="text-slate-500">Alternatív / Zárt ág</span>
          </div>
        </div>

        {/* Chapter filter selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[10px]">Szűrés:</span>
          <select
            value={filterAct}
            onChange={(e) => {
              soundEngine.playUiClick();
              setFilterAct(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">Minden felvonás</option>
            <option value="VIKTOR">I. Viktor (Antarktisz)</option>
            <option value="LENA">II. Dr. Lena (Tudat)</option>
            <option value="MIRA">III. Mira (Kódváros)</option>
            <option value="LEVENTE">IV. Levente (Álom)</option>
            <option value="KÓDVÁROS">V. Kódváros Gyűrűi</option>
            <option value="ŐRZŐK">VI. Őrzők</option>
            <option value="VÉGTELEN">Végső & Befejezések</option>
          </select>
        </div>
      </div>

      {/* MAIN VIEW AREA: FLOWCHART TREE & INSPECTOR */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT / CENTER: TREE CANVAS CONTAINER */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-950 relative"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {displayedTiers.map(([tierNum, tierNodes]) => {
            const actName = tierNodes[0]?.actName || '';

            return (
              <div key={tierNum} className="relative flex flex-col items-center">
                {/* ACT HEADER PILL */}
                <div className="mb-3 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 shadow-sm">
                  {actName}
                </div>

                {/* NODES ROW IN THIS TIER */}
                <div
                  className={`grid gap-4 sm:gap-6 w-full max-w-4xl justify-center items-stretch ${
                    tierNodes.length === 1
                      ? 'grid-cols-1 max-w-md'
                      : tierNodes.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                      : tierNodes.length === 3
                      ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl'
                  }`}
                >
                  {tierNodes.map((node) => {
                    const isVisited = visitedNodeSet.has(node.id);
                    const isCurrent = node.id === activeSceneId;
                    const isAccessible = accessibleNodeSet.has(node.id);
                    const isSelected = selectedNodeId === node.id;
                    const nodeLog = visitedMap.get(node.id);

                    // Step sequence number in player's history
                    const stepIndex = storyLog.findIndex((e) => e.sceneId === node.id);

                    return (
                      <div
                        key={node.id}
                        ref={isCurrent ? activeNodeRef : undefined}
                        onClick={() => {
                          soundEngine.playUiClick();
                          setSelectedNodeId(node.id);
                        }}
                        className={`group relative rounded-xl p-3.5 sm:p-4 text-left transition-all cursor-pointer border flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/60'
                            : isSelected
                            ? 'bg-slate-900/90 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : isVisited
                            ? 'bg-slate-900/70 border-slate-700/80 hover:border-cyan-500/50'
                            : isAccessible
                            ? 'bg-slate-950/80 border-dashed border-slate-700/70 hover:border-slate-500 opacity-80'
                            : 'bg-slate-950/40 border-slate-800/40 opacity-45'
                        }`}
                      >
                        {/* Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 text-[10px] font-mono">
                          <div className="flex items-center gap-1.5">
                            {isCurrent ? (
                              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                ● ITT VAGY MOST
                              </span>
                            ) : isVisited ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                <span>✓</span>
                                <span>LÉPÉS #{stepIndex + 1}</span>
                              </span>
                            ) : isAccessible ? (
                              <span className="text-amber-400 font-bold">
                                ⚡ FELFEDEZHETŐ
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                🔒 ZÁRT ÁG
                              </span>
                            )}
                          </div>

                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${node.speakerColor}`}>
                            {node.speaker}
                          </span>
                        </div>

                        {/* Node Title & Subtitle */}
                        <div>
                          <h4
                            className={`text-sm sm:text-base font-cinzel font-bold tracking-wide transition-colors ${
                              isCurrent
                                ? 'text-cyan-200'
                                : isVisited
                                ? 'text-slate-100 group-hover:text-cyan-200'
                                : 'text-slate-400'
                            }`}
                          >
                            {node.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-2">
                            {node.subtitle}
                          </p>
                        </div>

                        {/* Player's Decision preview at this node */}
                        {nodeLog?.chosenOption ? (
                          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-amber-300/90 flex items-center gap-1 truncate">
                            <span>⚡</span>
                            <span className="truncate">« {nodeLog.chosenOption.label} »</span>
                          </div>
                        ) : isCurrent ? (
                          <div className="mt-3 pt-2 border-t border-cyan-500/30 text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                            <span className="animate-spin">🌀</span>
                            <span>Döntésre vár a jelenetben...</span>
                          </div>
                        ) : null}

                        {/* Selected Indicator Arrow */}
                        {isSelected && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rotate-45 rounded-sm shadow-md hidden lg:block" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CONNECTOR ARROWS DOWN */}
                {tierNum < 11 && (
                  <div className="py-2 flex flex-col items-center text-slate-600 font-mono text-xs select-none">
                    <span className="h-4 w-0.5 bg-gradient-to-b from-slate-700 to-slate-800" />
                    <span>↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT / BOTTOM: NODE INSPECTOR DRAWER */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-cyan-500/20 bg-slate-900/95 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[45vh] lg:max-h-none flex-shrink-0 shadow-2xl">
          <div>
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                <span>🔍</span>
                <span>CSOMÓPONT RÉSZLETEK</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isSelectedCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                    : isSelectedVisited
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {isSelectedCurrent ? 'AKTÍV PONT' : isSelectedVisited ? 'BEJÁRVA' : 'FELTÁRATLAN'}
              </span>
            </div>

            {/* Node Title & Speaker */}
            <div className="mb-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {selectedNode.actName}
              </span>
              <h3 className="text-lg font-cinzel font-bold text-slate-100 mt-0.5">
                {selectedNode.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${selectedNode.speakerColor}`}>
                  {selectedNode.speaker}
                </span>
                {selectedRawNode?.location && (
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    📍 {selectedRawNode.location}
                  </span>
                )}
              </div>
            </div>

            {/* Narrative Excerpt */}
            {selectedRawNode && (
              <div className="my-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans max-h-40 overflow-y-auto scrollbar-thin">
                <p className="whitespace-pre-line italic">
                  „{selectedRawNode.text}”
                </p>
                {selectedRawNode.subtext && (
                  <p className="mt-2 text-[11px] text-cyan-300/80 font-mono">
                    ℹ️ {selectedRawNode.subtext}
                  </p>
                )}
              </div>
            )}

            {/* PLAYER'S RECORDED DECISION (IF VISITED) */}
            {selectedNodeLog?.chosenOption ? (
              <div className="my-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1 mb-1">
                  <span>⚡</span>
                  <span>Meghozott Döntés ezen a ponton:</span>
                </div>
                <div className="text-xs sm:text-sm font-cinzel font-semibold text-amber-100">
                  « {selectedNodeLog.chosenOption.label} »
                </div>
                {selectedNodeLog.chosenOption.reflection && (
                  <p className="text-[11px] font-sans text-slate-400 italic mt-1 pl-2 border-l border-amber-500/30">
                    {selectedNodeLog.chosenOption.reflection}
                  </p>
                )}
              </div>
            ) : isSelectedCurrent ? (
              <div className="my-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Jelenlegi jelenet:</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Itt állsz most a történetben. Zárd be a naplót, és válaszd ki a következő lépésed!
                </p>
              </div>
            ) : null}

            {/* AVAILABLE CHOICES FROM THIS NODE */}
            {selectedRawNode && selectedRawNode.choices.length > 0 && (
              <div className="my-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                  Lehetséges utak ebből a pontból:
                </div>
                <div className="space-y-1.5">
                  {selectedRawNode.choices.map((choice) => {
                    const isChosen = selectedNodeLog?.chosenOption?.id === choice.id;
                    const targetNode = GRAPH_NODES.find((n) => n.id === choice.nextSceneId);

                    return (
                      <div
                        key={choice.id}
                        onClick={() => {
                          if (targetNode) {
                            soundEngine.playUiClick();
                            setSelectedNodeId(targetNode.id);
                          }
                        }}
                        className={`p-2 rounded border text-xs font-mono transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isChosen
                            ? 'bg-amber-950/40 border-amber-400/80 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">
                          {isChosen ? '⚡ ' : '○ '}
                          {choice.label}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-bold opacity-80 flex-shrink-0">
                          {targetNode?.title || choice.nextSceneId} →
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* INSPECTOR FOOTER STATS */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Spirál állapot: {spiralState.spiralAwareness}%</span>
            <span>Tudati mélység: {spiralState.consciousnessDepth}/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
