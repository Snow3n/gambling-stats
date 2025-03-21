import { Game } from "@/types";

export const calculateNetProfit = (game: Game) => {
  return game.profit - game.wagered;
};

export const calculateTotalNetProfit = (games: Game[]) => {
  return games.reduce((sum, game) => sum + calculateNetProfit(game), 0);
};

export const calculateTotalWagered = (games: Game[]) => {
  return games.reduce((sum, game) => sum + game.wagered, 0);
};

export const calculateTotalLoss = (games: Game[]) => {
  return games.reduce((sum, game) => sum + game.loss, 0);
};

export const calculateRTP = (wagered: number, loss: number) => {
  return wagered > 0 ? ((wagered - loss) / wagered) * 100 : 0;
};

export const sortGames = (
  games: Game[],
  sortConfig: { key: keyof Game; direction: "asc" | "desc" } | null
) => {
  if (!sortConfig) return games;

  return [...games].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};
