import type { Game as GameType } from "@/types";
import {
  calculateTotalNetProfit,
  calculateTotalWagered,
  calculateTotalLoss,
  calculateRTP,
} from "@/utils/calculations";

interface StatCardsProps {
  games: GameType[];
}

export function StatCards({ games }: StatCardsProps) {
  const totalNetProfit = calculateTotalNetProfit(games);
  const totalWagered = calculateTotalWagered(games);
  const totalLoss = calculateTotalLoss(games);
  const rtp = calculateRTP(totalWagered, totalLoss);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">Net Profit/Loss</div>
        <div
          className={`text-3xl font-bold tracking-tight ${
            totalNetProfit >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}
        >
          ${totalNetProfit.toFixed(2)}
        </div>
      </div>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Wagered</div>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          ${totalWagered.toFixed(2)}
        </div>
      </div>
      {/* <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Loss</div>
        <div className="text-3xl font-bold tracking-tight text-red-500 dark:text-red-400">
          ${totalLoss.toFixed(2)}
        </div>
      </div> */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">RTP</div>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {rtp.toFixed(2)}%
        </div>
      </div>
    </div>
  );
} 