export interface Game {
  id: number;
  name: string;
  provider: string;
  profit: number;
  wagered: number;
  loss: number;
  count: number;
  expanded: boolean;
  history: GameHistory[];
  sessions: GameSession[];
  readonly balanceChange?: number; // Virtual field for sorting
}

export interface GameHistory {
  date: string;
  profit: number;
  wagered: number;
}

export interface AutoPlaySession {
  betAmount: number;
  spinsCount: number;
  totalWin: number;
  startDate: string;
  endDate: string;
}

export interface GameSession {
  id: number;
  date: string;
  profit: number;
  wagered: number;
  loss: number;
  bonusBuy: boolean;
  autoPlay?: AutoPlaySession;
}

export interface SortConfig {
  key: keyof Game;
  direction: 'asc' | 'desc';
} 