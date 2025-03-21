import { toast } from "sonner";
import { Game } from "@/types";
import debounce from "lodash/debounce";

const STORAGE_KEY = 'slot-tracker-data';
const CURRENT_VERSION = 1;

interface StorageData {
  version: number;
  lastUpdated: string;
  games: Game[];
}

// Validate game data structure
const isValidGame = (game: any): game is Game => {
  return (
    typeof game === 'object' &&
    game !== null &&
    typeof game.id === 'number' &&
    typeof game.name === 'string' &&
    typeof game.provider === 'string' &&
    typeof game.profit === 'number' &&
    typeof game.wagered === 'number' &&
    typeof game.loss === 'number' &&
    typeof game.count === 'number' &&
    Array.isArray(game.sessions) &&
    Array.isArray(game.history)
  );
};

// Parse numeric values in game data
const parseGameData = (game: Game): Game => ({
  ...game,
  id: Number(game.id),
  profit: Number(game.profit),
  wagered: Number(game.wagered),
  loss: Number(game.loss),
  count: Number(game.count),
  sessions: game.sessions.map(session => ({
    ...session,
    id: Number(session.id),
    profit: Number(session.profit),
    wagered: Number(session.wagered),
    loss: Number(session.loss)
  })),
  history: game.history.map(h => ({
    ...h,
    profit: Number(h.profit),
    wagered: Number(h.wagered)
  }))
});

// Save data with debounce
export const saveToLocalStorage = debounce((games: Game[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    const storageData: StorageData = {
      version: CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
      games
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    toast.success('Data saved successfully');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    toast.error('Failed to save data');
  }
}, 1000);

export const loadFromLocalStorage = (): Game[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];

    let storageData: StorageData;
    
    try {
      storageData = JSON.parse(rawData);
    } catch {
      // Try to parse as old format (just array of games)
      const oldFormatData = JSON.parse(rawData) as Game[];
      if (Array.isArray(oldFormatData)) {
        return oldFormatData.map(parseGameData);
      }
      throw new Error('Invalid data format');
    }

    // Validate version and structure
    if (!storageData.version || !Array.isArray(storageData.games)) {
      throw new Error('Invalid data structure');
    }

    // Validate each game
    const validGames = storageData.games.filter(isValidGame);
    if (validGames.length !== storageData.games.length) {
      console.warn('Some games were invalid and were filtered out');
      toast.warning('Some game data was corrupted and has been removed');
    }

    return validGames.map(parseGameData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    toast.error('Failed to load saved data');
    return [];
  }
};

// Export data as JSON file
export const exportData = () => {
  try {
    const games = loadFromLocalStorage();
    const storageData: StorageData = {
      version: CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
      games
    };
    
    const blob = new Blob([JSON.stringify(storageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slot-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Failed to export data');
  }
};

// Import data from JSON file
export const importData = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const importedData = JSON.parse(text);
    
    // Validate imported data
    if (!importedData.version || !Array.isArray(importedData.games)) {
      throw new Error('Invalid import file format');
    }

    const validGames = importedData.games.filter(isValidGame);
    if (validGames.length === 0) {
      throw new Error('No valid games found in import file');
    }

    if (validGames.length !== importedData.games.length) {
      toast.warning('Some imported games were invalid and have been skipped');
    }

    const parsedGames = validGames.map(parseGameData);
    saveToLocalStorage(parsedGames);
    toast.success('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    toast.error('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
}; 