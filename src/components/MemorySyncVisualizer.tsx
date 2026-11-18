import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  Customized,
} from 'recharts';
import {
  Sparkles,
  Radio,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { EchoRecord, StoryLogEntry } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';

export interface ActiveQuestSummary {
  id: string;
  title: string;
  source: string;
  targetHint: string;
}

interface MemorySyncVisualizerProps {
  echoes: EchoRecord[];
  syncedEchoIds: string[];
  storyLog: StoryLogEntry[];
  activeSceneId: string;
  missionTitle: string;
  activeQuests: ActiveQuestSummary[];
  activePulseEchoId: string | null;
  onTriggerSync: (echoId: string) => void;
  onSyncAllEchoes: () => void;
  onJumpToLogEntry?: (entryId: string) => void;
}

type GraphFilter = 'all' | 'choices' | 'echoes';

interface ScatterBeatPoint {
  id: string;
  echoId?: string;
  logEntryId?: string;
  originSceneId?: string;
  sceneId: string;
  step: number;
  resonance: number;
  weight: number;
  kind: 'core' | 'history' | 'choice' | 'echo';
  label: string;
  subtitle: string;
  detail: string;
  choiceText?: string;
  matchedQuestTitle?: string;
  isSynced: boolean;
  resonatesHere: boolean;
}

interface CustomAxisLike {
  scale?: (value: number) => number;
}

interface RechartsCustomizedProps {
  xAxisMap?: Record<string, CustomAxisLike>;
  yAxisMap?: Record<string, CustomAxisLike>;
  points: ScatterBeatPoint[];
  selectedNodeId: string | null;
}

const GraphEdgesOverlay: React.FC<RechartsCustomizedProps> = ({
  xAxisMap,
  yAxisMap,
  points,
  selectedNodeId,
}) => {
  if (!xAxisMap || !yAxisMap || points.length === 0) return null;
  const xAxis = Object.values(xAxisMap)[0];
  const yAxis = Object.values(yAxisMap)[0];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;

  const corePoint = points.find((p) => p.kind === 'core');
  const timelinePoints = points
    .filter((p) => p.kind === 'history' || p.kind === 'choice')
    .sort((a, b) => a.step - b.step);
  const echoPoints = points.filter((p) => p.kind === 'echo');

  const sceneToPoint = new Map<string, ScatterBeatPoint>();
  timelinePoints.forEach((p) => sceneToPoint.set(p.sceneId, p));

  return (
    <g className="recharts-sync-edges pointer-events-none">
      {/* Chronological narrative flow lines */}
      {timelinePoints.map((pt, idx) => {
        const nextPt = timelinePoints[idx + 1] || corePoint;
        if (!nextPt) return null;
        const x1 = xScale(pt.step);
        const y1 = yScale(pt.resonance);
        const x2 = xScale(nextPt.step);
        const y2 = yScale(nextPt.resonance);
        if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
          return null;
        }
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 14;
        return (
          <path
            key={`tl_${pt.id}_${nextPt.id}`}
            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke="rgba(52, 211, 153, 0.35)"
            strokeWidth={1.6}
          />
        );
      })}

      {/* EchoRecord origin -> echo -> mission core connections */}
      {echoPoints.map((ep) => {
        const ex = xScale(ep.step);
        const ey = yScale(ep.resonance);
        if (!Number.isFinite(ex) || !Number.isFinite(ey)) return null;

        const originPt = ep.originSceneId ? sceneToPoint.get(ep.originSceneId) : undefined;
        const ox = originPt ? xScale(originPt.step) : null;
        const oy = originPt ? yScale(originPt.resonance) : null;

        const cx = corePoint ? xScale(corePoint.step) : null;
        const cy = corePoint ? yScale(corePoint.resonance) : null;

        const isSelected = selectedNodeId === ep.id;

        return (
          <g key={`edges_${ep.id}`}>
            {ox !== null && oy !== null && Number.isFinite(ox) && Number.isFinite(oy) && (
              <path
                d={`M ${ox} ${oy} Q ${(ox + ex) / 2} ${(oy + ey) / 2 - 18} ${ex} ${ey}`}
                fill="none"
                stroke="rgba(192, 132, 252, 0.5)"
                strokeWidth={isSelected ? 2.4 : 1.4}
                strokeDasharray="4 3"
              />
            )}
            {cx !== null && cy !== null && Number.isFinite(cx) && Number.isFinite(cy) && (
              <path
                d={`M ${ex} ${ey} Q ${(ex + cx) / 2} ${(ey + cy) / 2 - 22} ${cx} ${cy}`}
                fill="none"
                stroke={
                  ep.isSynced
                    ? ep.resonatesHere
                      ? 'rgba(251, 191, 36, 0.8)'
                      : 'rgba(34, 211, 238, 0.7)'
                    : 'rgba(168, 85, 247, 0.35)'
                }
                strokeWidth={isSelected ? 2.6 : ep.isSynced ? 1.8 : 1.2}
                strokeDasharray={ep.isSynced ? undefined : '5 4'}
              />
            )}
          </g>
        );
      })}

      {/* Selection halo ring */}
      {selectedNodeId &&
        (() => {
          const sel = points.find((p) => p.id === selectedNodeId);
          if (!sel) return null;
          const sx = xScale(sel.step);
          const sy = yScale(sel.resonance);
          if (!Number.isFinite(sx) || !Number.isFinite(sy)) return null;
          return (
            <g>
              <circle
                cx={sx}
                cy={sy}
                r={15}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeOpacity={0.9}
              />
              <circle
                cx={sx}
                cy={sy}
                r={22}
                fill="none"
                stroke="#a855f7"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                strokeOpacity={0.75}
              />
            </g>
          );
        })()}
    </g>
  );
};

interface TooltipPayloadEntry {
  payload?: ScatterBeatPoint;
}

const HungarianScatterTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div className="max-w-xs rounded-xl border border-cyan-500/50 bg-slate-950/95 p-3 shadow-2xl text-xs space-y-1">
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-cyan-300 uppercase">
        <span>{pt.subtitle}</span>
        <span>Rezonancia: {pt.resonance}%</span>
      </div>
      <div className="font-cinzel font-bold text-slate-100 text-sm">{pt.label}</div>
      {pt.choiceText && (
        <div className="text-[11px] font-mono text-amber-300">
          Döntés: « {pt.choiceText} »
        </div>
      )}
      {pt.matchedQuestTitle && (
        <div className="text-[11px] font-mono text-emerald-300">
          Kapcsolt küldetés: {pt.matchedQuestTitle}
        </div>
      )}
      <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">{pt.detail}</p>
      <div className="text-[10px] font-mono text-cyan-400 pt-0.5">
        Kattints a pontra a részletek visszahívásához
      </div>
    </div>
  );
};

export const MemorySyncVisualizer: React.FC<MemorySyncVisualizerProps> = ({
  echoes,
  syncedEchoIds,
  storyLog,
  activeSceneId,
  missionTitle,
  activeQuests,
  activePulseEchoId,
  onTriggerSync,
  onSyncAllEchoes,
  onJumpToLogEntry,
}) => {
  const [graphFilter, setGraphFilter] = useState<GraphFilter>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const { allPoints, historyPoints, choicePoints, echoPoints, corePoints, maxStep } =
    useMemo(() => {
      const recentLogs = storyLog.slice(-24);
      const sceneToStep = new Map<string, number>();

      const hist: ScatterBeatPoint[] = [];
      const choices: ScatterBeatPoint[] = [];

      recentLogs.forEach((entry, idx) => {
        const step = idx + 1;
        sceneToStep.set(entry.sceneId, step);
        const hasChoice = Boolean(entry.chosenOption);

        if (graphFilter === 'echoes') return;
        if (graphFilter === 'choices' && !hasChoice) return;

        const baseResonance = hasChoice ? 66 + (idx % 4) * 5 : 28 + (idx % 4) * 7;
        const point: ScatterBeatPoint = {
          id: `log_${entry.id || idx}`,
          logEntryId: entry.id,
          sceneId: entry.sceneId,
          step,
          resonance: baseResonance,
          weight: hasChoice ? 220 : 120,
          kind: hasChoice ? 'choice' : 'history',
          label: hasChoice ? entry.chosenOption!.label : `${entry.speaker} — Jelenet`,
          subtitle: hasChoice
            ? `#${step} Kulcsdöntés · ${entry.speaker}`
            : `#${step} Történeti szakasz · ${entry.location || entry.sceneId}`,
          detail: hasChoice
            ? entry.chosenOption!.reflection || entry.text.slice(0, 160)
            : entry.text.slice(0, 160),
          choiceText: entry.chosenOption?.label,
          isSynced: true,
          resonatesHere: entry.sceneId === activeSceneId,
        };

        if (hasChoice) {
          choices.push(point);
        } else {
          hist.push(point);
        }
      });

      const baseStepCount = Math.max(recentLogs.length, echoes.length, 1);

      const echoPts: ScatterBeatPoint[] =
        graphFilter === 'choices'
          ? []
          : echoes.map((echo, idx) => {
              const isSynced = syncedEchoIds.includes(echo.id);
              const resonatesHere = echo.targetScenes.includes(activeSceneId);
              const mappedOriginStep = sceneToStep.get(echo.originSceneId);
              const fallbackStep = Math.max(
                1,
                Math.round(((idx + 1) / (echoes.length + 1)) * baseStepCount)
              );
              const matchedQuest = activeQuests[idx % Math.max(activeQuests.length, 1)];

              return {
                id: `echo_${echo.id}`,
                echoId: echo.id,
                originSceneId: echo.originSceneId,
                sceneId: echo.originSceneId,
                step: mappedOriginStep ?? fallbackStep,
                resonance: isSynced ? (resonatesHere ? 94 : 88) : 80 + (idx % 3) * 3,
                weight: isSynced ? 320 : 250,
                kind: 'echo',
                label: echo.title,
                subtitle: `Visszhang-emlék · ${echo.category}`,
                detail: echo.manifestationText || echo.description,
                matchedQuestTitle: matchedQuest?.title,
                isSynced,
                resonatesHere,
              };
            });

      const missionStep = baseStepCount + 1;
      const core: ScatterBeatPoint[] = [
        {
          id: 'core_mission',
          sceneId: activeSceneId,
          step: missionStep,
          resonance: 100,
          weight: 420,
          kind: 'core',
          label: missionTitle,
          subtitle: 'Aktuális Küldetési Mag',
          detail: `Aktív jelenet: ${activeSceneId} · Összes aktív küldetés: ${activeQuests.length} db`,
          isSynced: true,
          resonatesHere: true,
        },
      ];

      return {
        allPoints: [...hist, ...choices, ...echoPts, ...core],
        historyPoints: hist,
        choicePoints: choices,
        echoPoints: echoPts,
        corePoints: core,
        maxStep: missionStep,
      };
    }, [storyLog, echoes, syncedEchoIds, activeSceneId, missionTitle, activeQuests, graphFilter]);

  const activeNode = useMemo(() => {
    if (selectedNodeId) {
      const found = allPoints.find((p) => p.id === selectedNodeId);
      if (found) return found;
    }
    if (activePulseEchoId) {
      const found = allPoints.find((p) => p.echoId === activePulseEchoId);
      if (found) return found;
    }
    return echoPoints[0] || choicePoints[choicePoints.length - 1] || historyPoints[historyPoints.length - 1] || null;
  }, [allPoints, selectedNodeId, activePulseEchoId, echoPoints, choicePoints, historyPoints]);

  const handleSelectPoint = (rawData: unknown) => {
    const pt =
      (rawData as { payload?: ScatterBeatPoint })?.payload ||
      (rawData as ScatterBeatPoint | undefined);
    if (!pt || !pt.id) return;

    setSelectedNodeId(pt.id);

    if (pt.kind === 'echo' && pt.echoId) {
      onTriggerSync(pt.echoId);
      setStatusFeedback(`Szinkronizálva az aktív küldetésekkel: „${pt.label}”`);
    } else if (pt.kind === 'choice') {
      soundEngine.playDiscovery();
      setStatusFeedback(`Kulcsdöntés visszahívva: „${pt.label}”`);
    } else {
      soundEngine.playUiClick();
      setStatusFeedback(`Narratív pillanat kijelölve: ${pt.label}`);
    }
  };

  const unsyncedCount = echoes.filter((e) => !syncedEchoIds.includes(e.id)).length;

  return (
    <div className="rounded-2xl border border-cyan-500/35 bg-[#050b18] p-4 space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>Emlékszinkronizáció · Recharts Történeti Szórásdiagram</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Kattints bármely csomópontra a narratív pillanatok, kulcsdöntések és Visszhang-emlékek visszahívásához!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'Teljes Előzményháló' },
              { id: 'choices', label: 'Kulcsdöntések' },
              { id: 'echoes', label: 'Visszhang-emlékek' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setGraphFilter(f.id);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                graphFilter === f.id
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          {echoes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onSyncAllEchoes();
                setStatusFeedback('Minden Visszhang-emlék összevetve az aktív küldetésekkel!');
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-xs font-mono font-bold text-purple-200 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {unsyncedCount > 0
                  ? `Összes Szinkronizálása (${unsyncedCount})`
                  : 'Összes Újraellenőrzése'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Recharts Interactive ScatterChart */}
      <div className="rounded-xl border border-slate-800/90 bg-[#030711] p-2 sm:p-3">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 18, right: 24, bottom: 18, left: 4 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="step"
                name="Időrendi lépés"
                domain={[0, maxStep + 1]}
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#334155"
                label={{
                  value: 'Időrendi történeti lépések',
                  position: 'insideBottom',
                  offset: -8,
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <YAxis
                type="number"
                dataKey="resonance"
                name="Narratív rezonancia"
                domain={[15, 108]}
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#334155"
                unit="%"
              />
              <ZAxis type="number" dataKey="weight" range={[90, 420]} />
              <ReferenceLine
                y={80}
                stroke="rgba(168, 85, 247, 0.35)"
                strokeDasharray="4 4"
                label={{
                  value: 'Szinkronizációs küszöb',
                  fill: '#c084fc',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#22d3ee' }}
                content={<HungarianScatterTooltip />}
              />

              {/* Graph Edges Layer inside Recharts SVG */}
              <Customized
                component={(props: { xAxisMap?: Record<string, CustomAxisLike>; yAxisMap?: Record<string, CustomAxisLike> }) => (
                  <GraphEdgesOverlay
                    xAxisMap={props.xAxisMap}
                    yAxisMap={props.yAxisMap}
                    points={allPoints}
                    selectedNodeId={selectedNodeId}
                  />
                )}
              />

              {/* Plain Narrative Beats */}
              <Scatter
                name="Történeti Jelenetek"
                data={historyPoints}
                fill="#94a3b8"
                onClick={handleSelectPoint}
                className="cursor-pointer"
              >
                {historyPoints.map((pt) => (
                  <Cell
                    key={pt.id}
                    fill={pt.resonatesHere ? '#38bdf8' : '#64748b'}
                    stroke="#e2e8f0"
                    strokeWidth={selectedNodeId === pt.id ? 2 : 1}
                  />
                ))}
              </Scatter>

              {/* Key Decision Points */}
              <Scatter
                name="Kulcsdöntések"
                data={choicePoints}
                fill="#34d399"
                onClick={handleSelectPoint}
                className="cursor-pointer"
              >
                {choicePoints.map((pt) => (
                  <Cell
                    key={pt.id}
                    fill="#34d399"
                    stroke="#ecfdf5"
                    strokeWidth={selectedNodeId === pt.id ? 2.5 : 1.2}
                  />
                ))}
              </Scatter>

              {/* EchoRecord Nodes */}
              <Scatter
                name="Visszhang-emlékek"
                data={echoPoints}
                fill="#c084fc"
                onClick={handleSelectPoint}
                className="cursor-pointer"
              >
                {echoPoints.map((pt) => (
                  <Cell
                    key={pt.id}
                    fill={
                      pt.isSynced
                        ? pt.resonatesHere
                          ? '#fbbf24'
                          : '#22d3ee'
                        : '#c084fc'
                    }
                    stroke="#f8fafc"
                    strokeWidth={selectedNodeId === pt.id ? 2.5 : 1.5}
                  />
                ))}
              </Scatter>

              {/* Active Mission Core */}
              <Scatter
                name="Aktuális Küldetési Mag"
                data={corePoints}
                fill="#22d3ee"
                onClick={handleSelectPoint}
                className="cursor-pointer"
              >
                {corePoints.map((pt) => (
                  <Cell key={pt.id} fill="#0ea5e9" stroke="#e0f2fe" strokeWidth={2.5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            Szinkronizált Emlék
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Jelenet-rezonancia
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            Visszahívásra vár
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Kulcsdöntés
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            Történeti Jelenet
          </span>
        </div>

        {statusFeedback && (
          <div className="text-cyan-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{statusFeedback}</span>
          </div>
        )}
      </div>

      {/* Selected Beat Retrieval Detail Panel */}
      {activeNode && (
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/75 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-cyan-300 font-bold">{activeNode.subtitle}</span>
            <div className="flex items-center gap-2">
              <span className={activeNode.isSynced ? 'text-emerald-300' : 'text-purple-300'}>
                {activeNode.isSynced ? '✓ Szinkronizálva a maggal' : 'Kattints a szinkronizáláshoz'}
              </span>
              {activeNode.logEntryId && onJumpToLogEntry && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    onJumpToLogEntry(activeNode.logEntryId!);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ugrás a Naplóbejegyzéshez</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="font-cinzel font-bold text-slate-100 text-sm">{activeNode.label}</div>
          <p className="text-slate-300 leading-relaxed">{activeNode.detail}</p>
        </div>
      )}
    </div>
  );
};
