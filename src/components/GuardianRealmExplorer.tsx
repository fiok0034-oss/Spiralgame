import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  Volume2,
  Play,
  ArrowLeft,
  Gamepad2,
  Award,
  Layers,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useGame } from '../game/GameContext';
import { GUARDIANS_LIST } from '../data/storyData';
import { GUARDIAN_DIMENSIONS } from '../data/expansionData';
import { GUARDIAN_REALMS, REALM_CROSS_EFFECTS } from '../data/guardianRealmsData';
import { ECHO_CORE_SECRETS } from '../data/finalRevelationData';
import { ChamberBeyondNinthExperience } from './FinalRevelationPanels';
import { MiniGameRouter } from './MiniGameSuite';
import { soundEngine } from '../audio/SoundEngine';
import { SceneHotspot } from '../types/game';

export const GuardianRealmExplorer: React.FC = () => {
  const {
    activeSceneId,
    spiralState,
    guardianProgress,
    jumpToChapter,
    setActiveCinematicId,
    isRealmZoneUnlocked,
    enterRealmZone,
    inspectRealmHotspot,
    collectRealmEchoCore,
    completeRealmTrial,
    claimRealmReward,
    triggerObserverConvergence,
    markEchoAudioListened,
  } = useGame();

  const [feedbackBanner, setFeedbackBanner] = useState<{ text: string; ok: boolean } | null>(null);
  const [showInlineMiniGame, setShowInlineMiniGame] = useState(false);

  const chosenChoices = useMemo(
    () => new Set(Object.values(spiralState.choiceHistory)),
    [spiralState.choiceHistory]
  );

  // Match g1_realm_<N>
  const realmMatch = activeSceneId.match(/^g1_realm_(\d+)$/);
  const activeGuardianId = realmMatch ? Number(realmMatch[1]) : null;

  // =========================================================================
  // 1. CHAMBER BEYOND THE NINTH COMPACT SYNTHESIS BANNER
  // =========================================================================
  if (activeSceneId === 'g1_chamber_beyond_ninth') {
    const echoesCount = spiralState.worldState.collectedNineEchoIds.length;
    const observerCount = spiralState.worldState.collectedObserverClueIds.length;
    return (
      <div className="mb-8 space-y-5">
        <div className="rounded-2xl border border-amber-400/45 bg-slate-950/90 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-amber-300 font-bold uppercase tracking-wider">
              Θ–∞–Δ · A Kilencediken Túli Kamra Aktív
            </span>
            <span className="text-emerald-300 tabular-nums">
              Kilenc Visszhang: {echoesCount}/9 · Megfigyelő nyomai: {observerCount}/9
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {GUARDIAN_REALMS.map((r) => {
              const g = GUARDIANS_LIST.find((item) => item.id === r.guardianId);
              const hasEcho = spiralState.worldState.collectedNineEchoIds.includes(r.echoCoreId);
              return (
                <div
                  key={r.guardianId}
                  className={`p-2 rounded-lg border text-center text-[11px] font-mono ${
                    hasEcho
                      ? 'border-amber-400/60 bg-amber-950/25 text-amber-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-500'
                  }`}
                >
                  <div className="font-bold">{g?.symbol}</div>
                  <div className="truncate text-[10px]">{g?.name}</div>
                </div>
              );
            })}
          </div>
        </div>
        <ChamberBeyondNinthExperience />
      </div>
    );
  }

  // =========================================================================
  // 2. NINE REALMS NEXUS HUB VIEW (g1_guardians_nexus)
  // =========================================================================
  if (activeSceneId === 'g1_guardians_nexus') {
    const completedRealms = GUARDIANS_LIST.filter(
      (g) => guardianProgress[g.id]?.realmCompleted
    ).length;
    const collectedEchoes = spiralState.worldState.collectedNineEchoIds.length;
    const observerClues = spiralState.worldState.collectedObserverClueIds.length;
    const activeCrossFx = REALM_CROSS_EFFECTS.filter((fx) =>
      Boolean(fx.requiresEchoId && spiralState.worldState.collectedNineEchoIds.includes(fx.requiresEchoId))
    );

    return (
      <div className="mb-8 space-y-6">
        {/* Global Nine Realms Status Strip */}
        <div className="rounded-2xl border border-cyan-500/35 bg-slate-950/90 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
                A Kilenc Őrző Birodalmainak Csillagtérképe
              </div>
              <h3 className="text-base sm:text-lg font-cinzel font-bold text-slate-100 mt-0.5">
                Válassz egy Dimenzió-kaput a Bejáráshoz
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
              <span className="text-emerald-300">Birodalmak: {completedRealms}/9</span>
              <span className="text-amber-300">Visszhang-magok: {collectedEchoes}/9</span>
              <span className="text-purple-300">Megfigyelő: {observerClues}/9</span>
            </div>
          </div>

          {/* 9 Realm Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GUARDIAN_REALMS.map((realm) => {
              const g = GUARDIANS_LIST.find((item) => item.id === realm.guardianId)!;
              const prog = guardianProgress[realm.guardianId];
              const visitedCount = prog?.visitedZones?.length || 0;
              const echoDone = spiralState.worldState.collectedNineEchoIds.includes(realm.echoCoreId);
              const obsDone = spiralState.worldState.collectedObserverClueIds.includes(
                realm.observerClueId
              );
              const crossIncoming = activeCrossFx.some(
                (fx) => fx.targetGuardianId === realm.guardianId
              );

              return (
                <div
                  key={realm.guardianId}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                    prog?.realmCompleted
                      ? 'border-emerald-500/50 bg-emerald-950/15'
                      : 'border-slate-800 bg-slate-900/75 hover:border-cyan-400/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span style={{ color: g.colorHex }} className="font-bold">
                        {g.symbol} · #{g.id} {g.name}
                      </span>
                      <span className={prog?.realmCompleted ? 'text-emerald-300' : 'text-slate-400'}>
                        {prog?.realmCompleted ? '✓ Kész' : `${visitedCount}/6 zóna`}
                      </span>
                    </div>
                    <h4 className="text-sm font-cinzel font-bold text-slate-100">
                      {realm.realmTitle.split('·')[1]?.trim() || realm.realmTitle}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {realm.biomeTag}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pt-1 text-slate-400">
                      <span className={echoDone ? 'text-amber-300' : ''}>
                        {echoDone ? '✓ Mag' : '○ Mag'}
                      </span>
                      <span>·</span>
                      <span className={prog?.miniGameCleared ? 'text-cyan-300' : ''}>
                        {prog?.miniGameCleared ? '✓ Próba' : '○ Próba'}
                      </span>
                      <span>·</span>
                      <span className={obsDone ? 'text-purple-300' : ''}>
                        {obsDone ? '✓ Anomália' : '○ Jel'}
                      </span>
                    </div>
                    {crossIncoming && (
                      <div className="text-[11px] font-mono text-amber-200/90 pt-1">
                        ✦ Másik birodalomból érkező változás aktív
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playRealmSoundscape(realm.guardianId);
                      jumpToChapter('chapter6_guardians', realm.entrySceneId);
                    }}
                    className="w-full py-2 px-3 min-h-[40px] rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-200 cursor-pointer transition-colors"
                  >
                    Belépés a Birodalomba →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nine Echoes + Hidden Observer + Cross-Realm Effects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* The Nine Echoes Pedestal */}
          <div className="rounded-2xl border border-amber-500/35 bg-slate-950/90 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> A Kilenc Visszhang (The Nine Echoes)
              </span>
              <span className="text-slate-300 tabular-nums">{collectedEchoes} / 9</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GUARDIAN_REALMS.map((r) => {
                const owned = spiralState.worldState.collectedNineEchoIds.includes(r.echoCoreId);
                return (
                  <div
                    key={r.echoCoreId}
                    className={`p-2 rounded-lg border text-[11px] font-mono ${
                      owned
                        ? 'border-amber-400/60 bg-amber-950/25 text-amber-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-500'
                    }`}
                  >
                    <div className="font-bold">#{r.guardianId}</div>
                    <div className="truncate">{owned ? r.echoCoreTitle : 'Hiányzó mag'}</div>
                  </div>
                );
              })}
            </div>
            {spiralState.worldState.chamberBeyondNinthUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCinematicId('cin_chamber_beyond_ninth');
                  jumpToChapter('chapter6_guardians', 'g1_chamber_beyond_ninth');
                }}
                className="w-full py-2.5 min-h-[42px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                ★ Belépés A Kilencediken Túli Kamrába (Θ–∞–Δ) →
              </button>
            ) : (
              <p className="text-xs font-mono text-slate-400">
                Gyűjtsd össze mind a 9 birodalmi Visszhang-magot A Kilencediken Túli Kamra megnyitásához!
              </p>
            )}
          </div>

          {/* Hidden Observer + Cross Effects */}
          <div className="rounded-2xl border border-purple-500/35 bg-slate-950/90 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 font-bold uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> A Spirál Rejtett Megfigyelője
              </span>
              <span className="text-slate-300 tabular-nums">{observerClues} / 9 nyom</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Minden birodalomban rejtőzik egyetlen apró, látszólag oda nem illő részlet — egy dátumcédula, egy negyedik óramutató vagy egy tölgyfalevél.
            </p>
            {observerClues >= 9 ? (
              <button
                type="button"
                onClick={triggerObserverConvergence}
                className="w-full py-2.5 min-h-[42px] rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                {spiralState.worldState.observerConvergenceTriggered
                  ? '✓ Megfigyelő Konvergencia Újrajátszása'
                  : '★ A 9 Anomália Összeillesztése (Rejtett Esemény)'}
              </button>
            ) : (
              <div className="text-[11px] font-mono text-slate-400">
                Még {9 - observerClues} anomália rejtőzik a birodalmak zónáiban.
              </div>
            )}

            {activeCrossFx.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[11px] font-mono text-cyan-300 font-bold">
                  Aktív Birodalomközi Ok-okozati Hatások ({activeCrossFx.length}):
                </div>
                {activeCrossFx.slice(0, 3).map((fx) => (
                  <div key={fx.id} className="text-[11px] text-slate-300 leading-snug">
                    ✦ <span className="text-cyan-200 font-semibold">{fx.title}:</span> {fx.visualShiftText}
                  </div>
                ))}
              </div>
            )}

            {collectedEchoes > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[11px] font-mono text-amber-300 font-bold">
                  Csillagtérképen Felragyogó Új Összefüggések ({collectedEchoes}/9):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {ECHO_CORE_SECRETS.filter((s) =>
                    spiralState.worldState.collectedNineEchoIds.includes(s.echoCoreId)
                  ).map((s) => (
                    <div
                      key={s.echoCoreId}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-500/35 bg-amber-950/15 text-[11px] font-mono text-amber-100"
                    >
                      ✦ {s.worldMutation.mapConnectionLabel}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. INDIVIDUAL EXPLORABLE REALM WORKSPACE (g1_realm_1..9)
  // =========================================================================
  if (activeGuardianId !== null) {
    const realm = GUARDIAN_REALMS.find((r) => r.guardianId === activeGuardianId);
    const guardian = GUARDIANS_LIST.find((g) => g.id === activeGuardianId);
    const dim = GUARDIAN_DIMENSIONS.find((d) => d.guardianId === activeGuardianId);
    const prog = guardianProgress[activeGuardianId];

    if (!realm || !guardian || !dim || !prog) return null;

    const currentZone =
      realm.zones.find((z) => z.id === prog.currentZoneId) || realm.zones[0];
    const visitedSet = new Set(prog.visitedZones || []);
    const activeReactions = realm.reactions.filter(
      (react) =>
        (react.requiresChoiceId && chosenChoices.has(react.requiresChoiceId)) ||
        (react.requiresEchoId &&
          spiralState.worldState.collectedNineEchoIds.includes(react.requiresEchoId))
    );

    const handleSelectZone = (zoneId: string) => {
      const res = enterRealmZone(realm.guardianId, zoneId);
      setFeedbackBanner({ text: res.message, ok: res.entered });
    };

    const handleHotspot = (hs: SceneHotspot) => {
      const res = inspectRealmHotspot(
        realm.guardianId,
        hs,
        Boolean(currentZone.hasObserverClue)
      );
      setFeedbackBanner({
        text: res.observerFound
          ? `👁 REJTETT MEGFIGYELŐ ANOMÁLIA ÉSZLELVE! ${res.message}`
          : res.message,
        ok: res.unlocked,
      });
    };

    const handleCollectEcho = () => {
      const res = collectRealmEchoCore(realm.guardianId);
      setFeedbackBanner({ text: res.message, ok: res.collected });
    };

    const handleClaimReward = () => {
      const res = claimRealmReward(realm.guardianId);
      setFeedbackBanner({ text: res.message, ok: res.claimed });
    };

    const trustLabel =
      (prog.trustLevel || 0) >= 2
        ? `Mély Bizalom (+${prog.trustLevel})`
        : (prog.trustLevel || 0) > 0
        ? `Nyitott Bizalom (+${prog.trustLevel})`
        : (prog.trustLevel || 0) < 0
        ? `Távolságtartó (${prog.trustLevel})`
        : 'Semleges Figyelem (0)';

    return (
      <div className="mb-8 space-y-6">
        {/* Biome Header & Quick Controls */}
        <div
          className={`rounded-2xl border border-cyan-500/35 bg-gradient-to-br ${realm.bgToneClass} p-4 sm:p-5 space-y-4`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div
                className="text-xs font-mono font-bold uppercase tracking-wider"
                style={{ color: realm.accentColor }}
              >
                {guardian.symbol} · {realm.biomeTag}
              </div>
              <h3 className="text-lg sm:text-xl font-cinzel font-bold text-slate-100 mt-0.5">
                {realm.realmTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 mt-1 tabular-nums">
                <span>Felfedezett zónák: {visitedSet.size}/6</span>
                <span aria-hidden="true">·</span>
                <span>{trustLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Küldetések: {prog.completedQuestIds.length}/3</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => soundEngine.playRealmSoundscape(realm.guardianId)}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-200 cursor-pointer inline-flex items-center gap-1.5"
                title={realm.soundProfileLabel}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hangtáj</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCinematicId(dim.cinematicEventId)}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-xs font-mono text-purple-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Esemény</span>
              </button>
              <button
                type="button"
                onClick={() => jumpToChapter('chapter6_guardians', 'g1_guardians_nexus')}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Csarnok</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {realm.pastConnectionText}
          </p>

          {/* Dynamic Reactions from Earlier Chapters & Other Realms */}
          {activeReactions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {activeReactions.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/40 text-xs"
                >
                  <div className="font-mono font-bold text-amber-300 uppercase text-[11px]">
                    ✦ {r.title}
                  </div>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Echo Core Dialogue Shifts Triggered Across the World */}
          {(() => {
            const dialogueShifts = ECHO_CORE_SECRETS.filter(
              (s) =>
                spiralState.worldState.collectedNineEchoIds.includes(s.echoCoreId) &&
                (s.guardianId === realm.guardianId ||
                  s.worldMutation.guardianDialogueShift.includes(guardian.name) ||
                  s.echoCoreId === 'echo_core_9')
            );
            if (dialogueShifts.length === 0) return null;
            return (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {dialogueShifts.map((s) => (
                  <div
                    key={`shift_${s.echoCoreId}`}
                    className="p-3 rounded-xl bg-cyan-950/25 border border-cyan-500/40 text-xs"
                  >
                    <div className="font-mono font-bold text-cyan-300 uppercase text-[11px]">
                      ◈ Őrzői Változás · {s.title}
                    </div>
                    <p className="text-slate-100 mt-0.5 leading-relaxed">
                      {s.worldMutation.guardianDialogueShift}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Spatial Topology Map + Zone Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Interactive SVG Spatial Map */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Zónatérkép (Nem-lineáris Bejárás)
              </span>
              <span className="text-slate-400">Kattints bármely zónára az átlépéshez</span>
            </div>

            <svg
              viewBox="0 0 340 205"
              className="w-full h-56 bg-[#040710] rounded-xl border border-slate-800"
            >
              {/* Edges */}
              {realm.zones.flatMap((z) =>
                z.connectedZoneIds.map((targetId) => {
                  if (z.id > targetId) return null;
                  const target = realm.zones.find((t) => t.id === targetId);
                  if (!target) return null;
                  const unlocked = isRealmZoneUnlocked(z) && isRealmZoneUnlocked(target);
                  return (
                    <line
                      key={`${z.id}_${targetId}`}
                      x1={z.x}
                      y1={z.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={unlocked ? realm.accentColor : '#334155'}
                      strokeOpacity={unlocked ? 0.5 : 0.35}
                      strokeWidth={1.8}
                      strokeDasharray={unlocked ? undefined : '4 4'}
                    />
                  );
                })
              )}

              {/* Zone Nodes */}
              {realm.zones.map((z) => {
                const unlocked = isRealmZoneUnlocked(z);
                const visited = visitedSet.has(z.id);
                const isCurrent = z.id === currentZone.id;
                const fill = !unlocked
                  ? '#1e293b'
                  : isCurrent
                  ? realm.accentColor
                  : visited
                  ? '#065f46'
                  : '#0f172a';
                const stroke = !unlocked
                  ? '#64748b'
                  : isCurrent
                  ? '#ffffff'
                  : z.zoneType === 'secret'
                  ? '#fbbf24'
                  : realm.accentColor;

                return (
                  <g
                    key={z.id}
                    onClick={() => handleSelectZone(z.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={z.x}
                      cy={z.y}
                      r={isCurrent ? 18 : 15}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isCurrent ? 2.5 : 1.6}
                    />
                    <text
                      x={z.x}
                      y={z.y + 4}
                      textAnchor="middle"
                      fill={isCurrent ? '#020617' : '#e2e8f0'}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {z.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Zone Quick-Tap Pills List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {realm.zones.map((z) => {
                const unlocked = isRealmZoneUnlocked(z);
                const visited = visitedSet.has(z.id);
                const isCurrent = z.id === currentZone.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => handleSelectZone(z.id)}
                    className={`px-3 py-2 min-h-[42px] rounded-xl border text-left text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-950/45 text-cyan-100'
                        : !unlocked
                        ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-amber-500/40'
                        : visited
                        ? 'border-emerald-500/35 bg-emerald-950/15 text-slate-200 hover:border-emerald-400'
                        : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-400/60'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-mono font-bold mr-1.5" style={{ color: realm.accentColor }}>
                        {z.code}
                      </span>
                      <span className="font-semibold">{z.name}</span>
                    </div>
                    {!unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : visited ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Zone Narrative & Hotspots */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span style={{ color: realm.accentColor }} className="font-bold">
                  {currentZone.code} · {currentZone.zoneType === 'secret' ? 'TITKOS ÁTJÁRÓ' : 'AKTÍV ZÓNA'}
                </span>
                {currentZone.hasObserverClue && (
                  <span className="text-purple-300 font-bold">👁 Különös Részlet</span>
                )}
              </div>

              <div>
                <h4 className="text-base font-cinzel font-bold text-slate-100">
                  {currentZone.name}
                </h4>
                <div className="text-xs font-mono text-slate-400">{currentZone.subtitle}</div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {currentZone.description}
              </p>

              <div className="text-xs font-mono text-cyan-300/80 italic border-t border-slate-800 pt-2">
                {currentZone.ambientHint}
              </div>

              {currentZone.guardianDialogue && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-1">
                  <div className="font-mono text-amber-300 font-semibold">
                    {currentZone.guardianDialogue.prompt}
                  </div>
                  <div className="text-slate-200 leading-relaxed">
                    {currentZone.guardianDialogue.response}
                  </div>
                </div>
              )}

              {/* Zone Hotspots */}
              {currentZone.hotspots.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono uppercase text-slate-400">
                    Zóna Interakciós Pontjai:
                  </div>
                  {currentZone.hotspots.map((hs) => {
                    const done = spiralState.worldState.inspectedHotspots.includes(hs.id);
                    return (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => handleHotspot(hs)}
                        className={`w-full p-3 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                          done
                            ? 'border-emerald-500/45 bg-emerald-950/20'
                            : 'border-cyan-500/35 bg-slate-900 hover:border-cyan-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-mono font-bold text-cyan-200">
                          <span>{hs.label}</span>
                          {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{hs.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Echo Core Extraction Action inside Sanctum (or anytime after sanctum visited) */}
            {(currentZone.zoneType === 'sanctum' || prog.echoCoreCollected) && (() => {
              const coreSecret = ECHO_CORE_SECRETS.find((s) => s.echoCoreId === realm.echoCoreId);
              return (
                <div className="p-3.5 rounded-xl border border-amber-500/45 bg-amber-950/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Birodalmi Visszhang-mag
                    </span>
                    <span className="text-amber-200 tabular-nums">
                      {spiralState.worldState.collectedNineEchoIds.length}/9
                    </span>
                  </div>
                  <div className="text-xs font-cinzel font-bold text-slate-100">
                    {realm.echoCoreTitle}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{realm.echoCoreLore}</p>
                  <button
                    type="button"
                    disabled={prog.echoCoreCollected}
                    onClick={handleCollectEcho}
                    className={`w-full py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      prog.echoCoreCollected
                        ? 'bg-emerald-950/40 border border-emerald-500/45 text-emerald-200 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {prog.echoCoreCollected
                      ? `✓ ${realm.echoCoreTitle} Begyűjtve`
                      : `Visszhang-mag Befogadása →`}
                  </button>

                  {prog.echoCoreCollected && coreSecret && (
                    <div className="pt-2.5 border-t border-amber-500/30 space-y-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="font-mono font-bold text-cyan-300 uppercase">
                          1. Rejtett Emléktöredék · {coreSecret.hiddenMemoryTitle}
                        </div>
                        <p className="text-slate-200 leading-relaxed">{coreSecret.hiddenMemoryText}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-amber-300 uppercase">
                            2. Hangüzenet · {coreSecret.audioMessageTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              markEchoAudioListened(coreSecret.echoCoreId, coreSecret.audioFreqHz)
                            }
                            className="px-2.5 py-1 min-h-[32px] rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-mono inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Lejátszás</span>
                          </button>
                        </div>
                        <p className="text-slate-200 italic">{coreSecret.audioMessageText}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="font-mono text-purple-300 font-bold uppercase">
                          3. Anomália & 4. Nyitott Kérdés
                        </div>
                        <p className="text-slate-300">{coreSecret.anomalyDescription}</p>
                        <p className="text-amber-200 font-medium">Kérdés: {coreSecret.unansweredQuestion}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/35 space-y-1">
                        <div className="font-mono text-emerald-300 font-bold uppercase">
                          5. Utalás a Spirál Természetére
                        </div>
                        <p className="text-slate-100">{coreSecret.spiralNatureHint}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackBanner && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              feedbackBanner.ok
                ? 'border-emerald-500/45 bg-emerald-950/30 text-emerald-200'
                : 'border-amber-500/45 bg-amber-950/30 text-amber-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{feedbackBanner.text}</span>
          </div>
        )}

        {/* Realm Mini-Game Section (Always reachable, auto-highlighted in puzzle zone) */}
        <div className="rounded-2xl border border-cyan-500/35 bg-slate-950/90 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" /> Birodalom-specifikus Mechanikai Próba
              </div>
              <div className="text-sm font-cinzel font-bold text-slate-100 mt-0.5">
                {dim.quests.find((q) => q.objectiveType === 'minigame')?.title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInlineMiniGame((v) => !v)}
              className="px-4 py-2 min-h-[40px] rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-200 cursor-pointer"
            >
              {showInlineMiniGame || Boolean(currentZone.hasMiniGame)
                ? 'Próba Elrejtése / Váltás'
                : prog.miniGameCleared
                ? '✓ Teljesítve · Újrajátszás'
                : 'Minijáték Indítása →'}
            </button>
          </div>

          {(showInlineMiniGame || Boolean(currentZone.hasMiniGame)) && (
            <MiniGameRouter miniGameId={dim.miniGameId} embedded />
          )}
        </div>

        {/* Realm Personal Trial & Reward Claim */}
        <div className="rounded-2xl border border-purple-500/35 bg-slate-950/90 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-purple-300 uppercase font-bold">
                Az Őrző Személyes Próbája
              </div>
              <h4 className="text-base font-cinzel font-bold text-slate-100 mt-0.5">
                {realm.trialTitle}
              </h4>
            </div>
            {prog.trialOutcomeId && (
              <span className="text-xs font-mono text-emerald-300">✓ Döntés rögzítve</span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {realm.trialPrompt}
          </p>

          <div className="space-y-2.5">
            {realm.trialOptions.map((opt) => {
              const selected = prog.trialOutcomeId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => completeRealmTrial(realm.guardianId, opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                    selected
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-900/80 hover:border-purple-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-cinzel font-semibold text-slate-100">
                    <span>{opt.label}</span>
                    <span className="text-[11px] font-mono text-amber-300 shrink-0">
                      {opt.trustDelta >= 0 ? `+${opt.trustDelta}` : opt.trustDelta} bizalom
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 italic">{opt.nuanceNote}</div>
                  {selected && (
                    <div className="text-xs font-mono text-emerald-300 pt-1">
                      Következmény: {opt.consequenceText}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reward Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{realm.rewardSummary}</span>
            </div>
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={!prog.realmCompleted || prog.rewardClaimed}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-mono font-bold cursor-pointer ${
                prog.rewardClaimed
                  ? 'bg-emerald-950/40 border border-emerald-500/45 text-emerald-200 cursor-default'
                  : prog.realmCompleted
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {prog.rewardClaimed
                ? '✓ Birodalmi Jutalom Átvéve'
                : prog.realmCompleted
                ? 'Birodalmi Jutalom Átvétele (+40 Rez.)'
                : 'Teljesítsd mind a 3 feladatot (Zónák, Minijáték, Próba)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
