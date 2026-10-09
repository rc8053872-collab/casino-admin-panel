import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Trophy,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  useGameSession,
  useGameRounds,
  useSessionPlayers,
  useSessionTransactions,
  useSessionTimeline,
  useSessionAuditLog,
} from '../hooks/useGameHistoryQuery';
import type { GameRound } from '../types/gameHistory';
import { formatINR } from '../utils/currency';
import { gameHistoryService } from '../services/gameHistoryService';
import { useToast } from '../hooks/useToast';

type DetailTab = 'overview' | 'rounds' | 'players' | 'transactions' | 'timeline' | 'audit-log';

export const GameSessionDetailPage: React.FC = () => {
  const { sessionId = 'GS-102829' } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as DetailTab | null;
  const validTabs: DetailTab[] = ['overview', 'rounds', 'players', 'transactions', 'timeline', 'audit-log'];

  const [activeTab, setActiveTab] = useState<DetailTab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'overview'
  );

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabSelect = (tab: DetailTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [selectedRound, setSelectedRound] = useState<GameRound | null>(null);

  // Queries
  const { data: session, isLoading } = useGameSession(sessionId);
  const { data: rounds = [] } = useGameRounds(sessionId);
  const { data: players = [] } = useSessionPlayers(sessionId);
  const { data: transactions = [] } = useSessionTransactions(sessionId);
  const { data: timeline = [] } = useSessionTimeline(sessionId);
  const { data: auditLogs = [] } = useSessionAuditLog(sessionId);

  const handleExportRounds = () => {
    if (!session) return;
    gameHistoryService.exportRoundDataToCsv(session.sessionId, rounds);
    toast.success('Rounds Exported', `Downloaded rounds archive for ${session.sessionId}.`);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>Loading session archive...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">Session not found</h3>
        <p className="text-xs text-slate-500">The session ID {sessionId} does not exist in the archive.</p>
        <button
          onClick={() => navigate('/admin/games/history')}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to History Archive
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Header & Quick Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <button
            onClick={() => navigate('/admin/games/history')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Game History Archive</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{session.gameName}</h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              Session #{session.sessionId}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                session.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : session.status === 'disputed'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              ● {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Round ID: {session.roundId} • Table: {session.tableId} • Stakes: {session.stakes}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportRounds}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Round Data</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Started</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm">16:19:30 IST</div>
          <div className="text-[10px] text-slate-400">06 Oct 2026</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Ended</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm">16:38:12 IST</div>
          <div className="text-[10px] text-slate-400">06 Oct 2026</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm font-mono">{session.duration}</div>
          <div className="text-[10px] text-slate-400">{session.rounds} Rounds</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Seated Players</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm">{session.playerCount}</div>
          <div className="text-[10px] text-slate-400">Peak: {session.peakPlayers}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Pot</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm tabular-nums">{formatINR(session.totalPot)}</div>
          <div className="text-[10px] text-emerald-600">Rake: {formatINR(session.platformRake)}</div>
        </div>

        <div className="bg-white border border-blue-200 ring-1 ring-blue-500/10 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-blue-600 uppercase">Total Payout</div>
          <div className="font-bold text-blue-700 mt-0.5 text-sm tabular-nums">{formatINR(session.totalPayout)}</div>
          <div className="text-[10px] text-slate-500">96.5% Net Distributed</div>
        </div>
      </div>

      {/* 3. Session Navigation Tabs with Framer Motion layoutId */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: 'overview' as DetailTab, label: 'Overview' },
              { id: 'rounds' as DetailTab, label: `Rounds (${rounds.length || session.rounds})` },
              { id: 'players' as DetailTab, label: `Players (${players.length || session.playerCount})` },
              { id: 'transactions' as DetailTab, label: `Transactions (${transactions.length || 3})` },
              { id: 'timeline' as DetailTab, label: 'Timeline' },
              { id: 'audit-log' as DetailTab, label: 'Audit Log' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors z-10 ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sessionDetailTabIndicator"
                    className="absolute inset-0 bg-blue-50/70 border border-blue-200/60 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Contents */}
      <div className="space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Game Information & Config */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Game Specification & Engine Details</span>
                <span className="text-slate-400 font-mono text-[11px]">{session.configurationVersion}</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Game Name:</span>
                  <span className="font-semibold text-slate-900">{session.gameName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Game ID:</span>
                  <button
                    onClick={() => navigate(`/admin/games/${session.gameId}`)}
                    className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>{session.gameId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Game Category:</span>
                  <span className="font-semibold text-slate-900">{session.gameType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Table Identifier:</span>
                  <span className="font-mono text-slate-800">{session.tableId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Cryptographic Integrity:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {session.integrityStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Winner & Hand Showcase */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Result & Payout Settlements</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </h3>

              {session.winnerName ? (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-emerald-700 uppercase font-bold">First Place Winner</span>
                      <div className="text-sm font-bold text-slate-900">
                        {session.winnerName}{' '}
                        <span className="text-slate-400 font-mono text-xs font-normal">({session.winnerPlayerId})</span>
                      </div>
                    </div>
                    <span className="text-base font-bold text-emerald-700">{formatINR(session.totalPayout)}</span>
                  </div>
                  {session.winningHandOrOutcome && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 text-slate-800 font-medium text-[11px]">
                      {session.winningHandOrOutcome}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  {session.cancellationReason || 'Game cancelled prior to showdown.'}
                </div>
              )}

              {session.communityCards && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500">Board Runout (Final State):</div>
                  <div className="flex items-center gap-1.5">
                    {session.communityCards.map((card, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-900 font-mono"
                      >
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ROUNDS TABLE */}
        {activeTab === 'rounds' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">Concluded Match Rounds</span>
              <span className="text-slate-400">Click a round to inspect player telemetry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="px-4 py-3">ROUND</th>
                    <th className="px-4 py-3">STARTED</th>
                    <th className="px-4 py-3">ENDED</th>
                    <th className="px-4 py-3">PLAYERS</th>
                    <th className="px-4 py-3">WINNER</th>
                    <th className="px-4 py-3">POT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rounds.map((rnd) => (
                    <tr
                      key={rnd.id}
                      onClick={() => setSelectedRound(rnd)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">Round {rnd.roundNumber}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{rnd.startedAt}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{rnd.endedAt || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{rnd.playerCount} players</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{rnd.winnerName || 'Split / In-play'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{formatINR(rnd.pot)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rnd.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRound(rnd);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-700 font-semibold text-xs transition-colors"
                        >
                          Inspect Actions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PLAYERS TABLE */}
        {activeTab === 'players' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">Seated Players</span>
              <span className="text-slate-400">{players.length} players tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="px-4 py-3">PLAYER</th>
                    <th className="px-4 py-3">PLAYER ID</th>
                    <th className="px-4 py-3">JOINED / LEFT</th>
                    <th className="px-4 py-3">ROUNDS</th>
                    <th className="px-4 py-3">SCORE</th>
                    <th className="px-4 py-3">RANK</th>
                    <th className="px-4 py-3">PAYOUT</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                            {p.avatarInitials}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate(`/admin/players/${p.playerId}`)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {p.name}
                            </button>
                            <div className="text-[10px] text-slate-400">@{p.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.playerId}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {p.joinedAt} – {p.leftAt}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{p.rounds}</td>
                      <td className="px-4 py-3 font-mono text-slate-800">{p.score.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">#{p.rank}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        {p.payout > 0 ? formatINR(p.payout) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Winner'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100">
              <span className="font-bold text-slate-900">Session Financial Ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="px-4 py-3">TRANSACTION ID</th>
                    <th className="px-4 py-3">PLAYER / RECIPIENT</th>
                    <th className="px-4 py-3">TYPE</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">TIMESTAMP</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-700 font-semibold">{tx.transactionId}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{tx.playerName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'Prize'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.type === 'Fee'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{formatINR(tx.amount)}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{tx.time}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
              Chronological Match Telemetry Stream
            </h3>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative flex items-start gap-3"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white -left-5 relative top-1 shrink-0" />
                  <div>
                    <span className="font-mono text-slate-400 text-xs mr-2">{item.time}</span>
                    <span className="text-slate-800 font-medium text-xs">{item.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOG */}
        {activeTab === 'audit-log' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100">
              <span className="font-bold text-slate-900">Immutable System Audit Trail</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="px-4 py-3">TIMESTAMP</th>
                    <th className="px-4 py-3">ACTOR</th>
                    <th className="px-4 py-3">ACTION</th>
                    <th className="px-4 py-3">ENTITY</th>
                    <th className="px-4 py-3">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{log.actor}</td>
                      <td className="px-4 py-3 font-bold text-blue-600">{log.action}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{log.entity}</td>
                      <td className="px-4 py-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Round Details Drawer */}
      <AnimatePresence>
        {selectedRound && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRound(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-[440px] h-full bg-white shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Round {selectedRound.roundNumber} Telemetry</h3>
                  <p className="text-[11px] text-slate-400">{selectedRound.duration} duration</p>
                </div>
                <button
                  onClick={() => setSelectedRound(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Round Pot</span>
                    <span className="font-bold text-slate-900">{formatINR(selectedRound.pot)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Winner</span>
                    <span className="font-bold text-emerald-700">{selectedRound.winnerName || 'Split'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                    Sequential Player Actions ({selectedRound.playerActions.length})
                  </span>

                  <div className="space-y-1.5">
                    {selectedRound.playerActions.map((act, i) => (
                      <div key={i} className="p-2 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{act.player}</span>
                          <span className="font-mono text-[10px] text-slate-400">{act.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{act.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameSessionDetailPage;
