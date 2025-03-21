import type { Game as GameType } from "@/types";
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateRTP } from "@/utils/calculations";

interface AnalyticsChartsProps {
  games: GameType[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function AnalyticsCharts({ games }: AnalyticsChartsProps) {
  const profitByGame = games.map((game) => ({
    name: game.name,
    profit: game.profit,
  }));

  const wageredByGame = games.map((game) => ({
    name: game.name,
    wagered: game.wagered,
  }));

  const rtpByGame = games.map((game) => ({
    name: game.name,
    rtp: calculateRTP(game.wagered, game.loss),
  }));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-4 font-medium flex items-center gap-2">
          <BarChart2 size={16} className="text-muted-foreground" />
          Profit by Game
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitByGame}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="profit"
              fill="hsl(var(--chart-1))"
              name="Profit"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-4 font-medium flex items-center gap-2">
          <PieChartIcon size={16} className="text-muted-foreground" />
          Wagered Distribution
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={wageredByGame}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="hsl(var(--chart-1))"
              dataKey="wagered"
              isAnimationActive={false}
            >
              {wageredByGame.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${COLORS[index % COLORS.length]})`}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "8px",
              }}
              itemStyle={{
                color: "hsl(var(--card-foreground))",
                padding: "4px 0",
              }}
              labelStyle={{
                color: "hsl(var(--card-foreground))",
                fontWeight: 500,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-4 font-medium flex items-center gap-2">
          <BarChart2 size={16} className="text-muted-foreground" />
          RTP by Game (%)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rtpByGame}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="rtp"
              fill="hsl(var(--chart-2))"
              name="RTP %"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
