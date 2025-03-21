import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Game as GameType, AutoPlaySession, GameSession } from "@/types";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/EditableField";
import { ChevronDown, ChevronUp, Edit, GripVertical, Plus, Trash2, BarChart2, PieChart, Play, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { calculateRTP } from "@/utils/calculations";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatShortDate, formatChartDate } from "@/utils/date";

interface SortableGameItemProps {
  game: GameType;
  index: number;
  deleteGame: (id: number) => void;
  toggleExpand: (id: number) => void;
  setGames: React.Dispatch<React.SetStateAction<GameType[]>>;
  games: GameType[];
  updateGames: (games: GameType[]) => void;
}

interface EditableSessionProps {
  session: GameSession;
  onUpdate: (sessionId: number, updates: Partial<GameSession>) => void;
  formatDate: (date: string) => string;
}

function EditableSession({ session, onUpdate, formatDate }: EditableSessionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    wagered: session.wagered.toString(),
    profit: session.profit.toString(),
  });

  const handleSave = () => {
    const wagered = parseFloat(editValues.wagered);
    const profit = parseFloat(editValues.profit);
    
    if (!isNaN(wagered) && !isNaN(profit)) {
      onUpdate(session.id, {
        wagered,
        profit,
        loss: wagered - profit,
      });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="py-3 pr-4 text-gray-900 dark:text-gray-300">{formatDate(session.date)}</td>
        <td className="py-3 pr-4">
          {session.bonusBuy ? (
            <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/20 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/30">
              Bonus Buy
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/30">
              Regular
            </span>
          )}
        </td>
        <td className="py-3 pr-4 text-right">
          <Input
            type="number"
            value={editValues.wagered}
            onChange={(e) => setEditValues(prev => ({ ...prev, wagered: e.target.value }))}
            className="h-7 text-sm w-24 ml-auto"
          />
        </td>
        <td className="py-3 pr-4 text-right">
          <Input
            type="number"
            value={editValues.profit}
            onChange={(e) => setEditValues(prev => ({ ...prev, profit: e.target.value }))}
            className="h-7 text-sm w-24 ml-auto"
          />
        </td>
        <td className={`py-3 pr-4 text-right font-medium ${parseFloat(editValues.profit) - parseFloat(editValues.wagered) >= 0 ? "text-green-500" : "text-red-500"}`}>
          ${((parseFloat(editValues.profit) || 0) - (parseFloat(editValues.wagered) || 0)).toFixed(2)}
        </td>
        <td className="py-3 pr-4 text-right font-medium text-gray-900 dark:text-gray-300">
          {calculateRTP(parseFloat(editValues.wagered) || 0, (parseFloat(editValues.wagered) || 0) - (parseFloat(editValues.profit) || 0)).toFixed(1)}%
        </td>
        <td className="py-3 text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-7"
            >
              <Check size={14} className="text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-7"
            >
              <X size={14} className="text-red-500" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="py-3 pr-4 text-gray-900 dark:text-gray-300">{formatDate(session.date)}</td>
      <td className="py-3 pr-4">
        {session.bonusBuy ? (
          <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/20 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/30">
            Bonus Buy
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/30">
            Regular
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-right font-medium text-gray-900 dark:text-gray-300">
        ${session.wagered.toFixed(2)}
      </td>
      <td className="py-3 pr-4 text-right font-medium text-gray-900 dark:text-gray-300">
        ${session.profit.toFixed(2)}
      </td>
      <td
        className={`py-3 pr-4 text-right font-medium ${
          session.profit - session.wagered >= 0
            ? "text-green-500 dark:text-green-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        ${(session.profit - session.wagered >= 0 ? "+" : "")}{(session.profit - session.wagered).toFixed(2)}
      </td>
      <td className="py-3 pr-4 text-right font-medium text-gray-900 dark:text-gray-300">
        {calculateRTP(session.wagered, session.loss).toFixed(1)}%
      </td>
      <td className="py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <Edit size={14} />
        </Button>
      </td>
    </tr>
  );
}

export function SortableGameItem({
  game,
  index,
  deleteGame,
  toggleExpand,
  setGames,
  games,
  updateGames,
}: SortableGameItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: game.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [betAmount, setBetAmount] = useState("");
  const [spinsCount, setSpinsCount] = useState("");
  const [totalWin, setTotalWin] = useState("");
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  const handleAutoPlaySubmit = () => {
    if (!betAmount || !spinsCount) return;

    const wageredAmount = Number(betAmount) * Number(spinsCount);
    const winAmount = totalWin ? Number(totalWin) : 0;
    const balanceChange = winAmount - wageredAmount;

    const autoPlaySession: AutoPlaySession = {
      betAmount: Number(betAmount),
      spinsCount: Number(spinsCount),
      totalWin: winAmount,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };

    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      profit: winAmount,
      wagered: wageredAmount,
      loss: wageredAmount - winAmount,
      bonusBuy: false,
      autoPlay: autoPlaySession,
    };

    const updatedGame = {
      ...game,
      profit: game.profit + winAmount,
      wagered: game.wagered + wageredAmount,
      loss: game.loss + (wageredAmount - winAmount),
      count: game.count + Number(spinsCount),
      sessions: [...game.sessions, newSession],
      history: [
        ...game.history,
        {
          date: new Date().toISOString(),
          profit: winAmount,
          wagered: wageredAmount,
        },
      ],
    };

    const newGames = games.map((g) => (g.id === game.id ? updatedGame : g));
    updateGames(newGames);

    // Reset form
    setBetAmount("");
    setSpinsCount("");
    setTotalWin("");
    setIsAutoPlayActive(false);
  };

  const handleUpdateAutoPlaySession = (sessionId: number, newWinAmount: number) => {
    const session = game.sessions.find(s => s.id === sessionId);
    if (!session?.autoPlay) return;

    const oldWagered = session.wagered;
    const oldWinAmount = session.profit;
    const oldLoss = session.loss;
    const oldSpinsCount = session.autoPlay.spinsCount;

    const newLoss = session.wagered - newWinAmount;

    const updatedSession = {
      ...session,
      profit: newWinAmount,
      loss: newLoss,
      autoPlay: {
        ...session.autoPlay,
        totalWin: newWinAmount
      }
    };

    const updatedGame = {
      ...game,
      profit: game.profit - oldWinAmount + newWinAmount,
      loss: game.loss - oldLoss + newLoss,
      count: game.count - oldSpinsCount + session.autoPlay.spinsCount,
      sessions: game.sessions.map(s => s.id === sessionId ? updatedSession : s),
      history: [
        ...game.history.filter(h => h.date !== session.date),
        {
          date: session.date,
          profit: newWinAmount,
          wagered: oldWagered,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };

    const newGames = games.map((g) => (g.id === game.id ? updatedGame : g));
    updateGames(newGames);
    setEditingSessionId(null);
  };

  const handleUpdateSession = (sessionId: number, updates: Partial<GameSession>) => {
    const session = game.sessions.find(s => s.id === sessionId);
    if (!session) return;

    const oldWagered = session.wagered;
    const oldProfit = session.profit;
    const oldLoss = session.loss;
    const oldSpinsCount = session.autoPlay?.spinsCount || 0;

    const updatedSession = {
      ...session,
      ...updates,
    };

    const updatedGame = {
      ...game,
      profit: game.profit - oldProfit + (updates.profit || oldProfit),
      wagered: game.wagered - oldWagered + (updates.wagered || oldWagered),
      loss: game.loss - oldLoss + (updates.loss || oldLoss),
      count: game.count - oldSpinsCount + (session.autoPlay?.spinsCount || 0),
      sessions: game.sessions.map(s => s.id === sessionId ? updatedSession : s),
      history: [
        ...game.history.filter(h => h.date !== session.date),
        {
          date: session.date,
          profit: updates.profit || oldProfit,
          wagered: updates.wagered || oldWagered,
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };

    const newGames = games.map((g) => (g.id === game.id ? updatedGame : g));
    updateGames(newGames);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
    >
      <div className="grid grid-cols-6 items-center p-4">
        <div className="col-span-2 flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex flex-col gap-2">
            <EditableField
              value={game.name}
              onSave={(fieldName, newValue) => {
                const newGames = games.map((g) =>
                  g.id === game.id
                    ? {
                        ...g,
                        name: newValue,
                      }
                    : g
                );
                updateGames(newGames);
              }}
              fieldName="name"
              className="font-medium text-gray-900 dark:text-gray-100"
            />
            <EditableField
              value={game.provider}
              onSave={(fieldName, newValue) => {
                const newGames = games.map((g) =>
                  g.id === game.id
                    ? {
                        ...g,
                        provider: newValue,
                      }
                    : g
                );
                updateGames(newGames);
              }}
              fieldName="provider"
              className="text-sm text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>
        <div className={`text-right ${game.profit >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          <EditableField
            value={game.profit.toFixed(2)}
            onSave={(fieldName, newValue) => {
              const numValue = parseFloat(newValue);
              if (!isNaN(numValue)) {
                const newGames = games.map((g) =>
                  g.id === game.id
                    ? {
                        ...g,
                        profit: numValue,
                        loss: g.wagered - numValue,
                      }
                    : g
                );
                updateGames(newGames);
              }
            }}
            fieldName="win"
            className={`text-lg font-medium ${game.profit >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
            prefix="$"
          />
        </div>
        <div className="text-right">
          <EditableField
            value={game.wagered.toFixed(2)}
            onSave={(fieldName, newValue) => {
              const numValue = parseFloat(newValue);
              if (!isNaN(numValue)) {
                const newGames = games.map((g) =>
                  g.id === game.id
                    ? {
                        ...g,
                        wagered: numValue,
                      }
                    : g
                );
                updateGames(newGames);
              }
            }}
            fieldName="wagered"
            className="text-lg font-medium text-gray-900 dark:text-gray-100"
            prefix="$"
          />
        </div>
        <div className={`text-right ${game.profit - game.wagered >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          <div className="text-lg font-medium">
            ${(game.profit - game.wagered >= 0 ? "+" : "")}{(game.profit - game.wagered).toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <EditableField
            value={game.count.toString()}
            onSave={(fieldName, newValue) => {
              const numValue = parseInt(newValue);
              if (!isNaN(numValue)) {
                const newGames = games.map((g) =>
                  g.id === game.id
                    ? {
                        ...g,
                        count: numValue,
                      }
                    : g
                );
                updateGames(newGames);
              }
            }}
            fieldName="count"
            className="text-lg font-medium text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteGame(game.id)}
            className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Trash2 size={16} className="text-red-500 dark:text-red-400" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleExpand(game.id)}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {game.expanded ? (
            <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </Button>
        <div className="flex-1" />
      </div>
      {game.expanded && (
        <div className="bg-muted/50 p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="mb-4 font-medium flex items-center gap-2">
                <BarChart2 size={16} className="text-muted-foreground" />
                Session History
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={game.history}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="date" 
                    className="text-muted-foreground"
                    tickFormatter={formatChartDate}
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      padding: "8px"
                    }}
                    itemStyle={{
                      color: "hsl(var(--card-foreground))",
                      padding: "4px 0"
                    }}
                    labelStyle={{
                      color: "hsl(var(--card-foreground))",
                      fontWeight: 500
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h4 className="mb-4 font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <PieChart size={16} className="text-gray-500 dark:text-gray-400" />
                Performance Metrics
              </h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Win Rate
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {game.wagered > 0
                      ? ((game.profit / game.wagered) * 100).toFixed(1)
                      : "0"}
                    %
                  </div>
                  <Progress
                    value={
                      game.wagered > 0
                        ? (game.profit / game.wagered) * 100 + 50
                        : 50
                    }
                    className="h-2 mt-2"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Average Bet
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    $
                    {game.count > 0
                      ? (game.wagered / game.count).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    RTP
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {calculateRTP(game.wagered, game.loss).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h4 className="mb-4 font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Play size={16} className="text-gray-500 dark:text-gray-400" />
                Auto Play Session
              </h4>
              
              {!isAutoPlayActive ? (
                <Button
                  onClick={() => setIsAutoPlayActive(true)}
                  className="w-full"
                >
                  Start Auto Play Session
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="betAmount">Bet Amount</Label>
                    <Input
                      type="number"
                      id="betAmount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Enter bet amount"
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="spinsCount">Number of Spins</Label>
                    <Input
                      type="number"
                      id="spinsCount"
                      value={spinsCount}
                      onChange={(e) => setSpinsCount(e.target.value)}
                      placeholder="Enter number of spins"
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="totalWin">Total Win (Optional)</Label>
                    <Input
                      type="number"
                      id="totalWin"
                      value={totalWin}
                      onChange={(e) => setTotalWin(e.target.value)}
                      placeholder="Enter total win amount if available"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAutoPlaySubmit}
                      className="flex-1"
                      variant="default"
                    >
                      Save Session
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAutoPlayActive(false);
                        setBetAmount("");
                        setSpinsCount("");
                        setTotalWin("");
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {game.sessions.filter(session => session.autoPlay).length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">
                    Auto Play History
                  </h5>
                  <div className="space-y-2">
                    {game.sessions
                      .filter(session => session.autoPlay)
                      .map(session => (
                        <div
                          key={session.id}
                          className="bg-muted/50 p-3 rounded-lg text-sm"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">
                              {formatDate(session.date)}
                            </span>
                            <span className="font-medium">
                              {session.autoPlay!.spinsCount} spins
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Bet: ${session.autoPlay!.betAmount}
                            </span>
                            {editingSessionId === session.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={totalWin}
                                  onChange={(e) => setTotalWin(e.target.value)}
                                  placeholder="Enter win amount"
                                  className="w-24 h-7 text-sm"
                                />
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7"
                                  onClick={() => {
                                    if (totalWin) {
                                      handleUpdateAutoPlaySession(session.id, Number(totalWin));
                                      setTotalWin("");
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7"
                                  onClick={() => {
                                    setEditingSessionId(null);
                                    setTotalWin("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Win: ${session.profit}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7"
                                    onClick={() => setEditingSessionId(session.id)}
                                  >
                                    <Edit size={14} />
                                  </Button>
                                </div>
                                <span className={`text-sm ${session.profit - session.wagered >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  Balance: ${session.profit - session.wagered >= 0 ? '+' : ''}{(session.profit - session.wagered).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h4 className="mb-4 font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
              Individual Sessions
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm">
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 text-right">
                      Wagered
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 text-right">
                      Win Amount
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 text-right">
                      Balance Change
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400 text-right">
                      RTP
                    </th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {game.sessions.map((session) => (
                    <EditableSession
                      key={session.id}
                      session={session}
                      onUpdate={handleUpdateSession}
                      formatDate={formatShortDate}
                    />
                  ))}
                  <tr>
                    <td colSpan={7} className="pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                        onClick={() => {
                          const newSession = {
                            id: Date.now(),
                            date: new Date().toISOString().split("T")[0],
                            profit: 0,
                            wagered: 0,
                            loss: 0,
                            bonusBuy: false,
                          };
                          setGames(
                            games.map((g) =>
                              g.id === game.id
                                ? {
                                    ...g,
                                    sessions: [...g.sessions, newSession],
                                  }
                                : g
                            )
                          );
                        }}
                      >
                        <Plus size={16} className="mr-2" /> Add Session
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 