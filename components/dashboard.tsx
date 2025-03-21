"use client";

import { useState, useEffect } from "react";
import type { Game as GameType, SortConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Upload } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableGameItem } from "@/components/SortableGameItem";
import { StatCards } from "@/components/StatCards";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import {
  saveToLocalStorage,
  exportData,
  importData,
  loadFromLocalStorage,
} from "@/utils/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardProps {
  initialGames?: GameType[];
}

export function Dashboard({ initialGames = [] }: DashboardProps) {
  const [games, setGames] = useState<GameType[]>(initialGames);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("games");

  // Load saved data on component mount
  useEffect(() => {
    const savedGames = loadFromLocalStorage();
    if (savedGames.length > 0) {
      setGames(savedGames);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setGames((games) => {
        const oldIndex = games.findIndex((g) => g.id.toString() === active.id);
        const newIndex = games.findIndex((g) => g.id.toString() === over.id);

        const newGames = arrayMove(games, oldIndex, newIndex);
        setSortConfig(null);
        saveToLocalStorage(newGames);
        return newGames;
      });
    }
  };

  const toggleExpand = (id: number) => {
    setGames(
      games.map((game) =>
        game.id === id ? { ...game, expanded: !game.expanded } : game
      )
    );
  };

  const deleteGame = (id: number) => {
    const newGames = games.filter((game) => game.id !== id);
    setGames(newGames);
    saveToLocalStorage(newGames);
  };

  const updateGames = (newGames: GameType[]) => {
    setGames(newGames);
    saveToLocalStorage(newGames);
  };

  const addGame = () => {
    const newGame: GameType = {
      id: Date.now(),
      name: "New Game",
      provider: "Unknown",
      profit: 0,
      wagered: 0,
      loss: 0,
      count: 0,
      expanded: false,
      history: [],
      sessions: [],
    };
    updateGames([newGame, ...games]);
  };

  const handleSort = (key: keyof GameType) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });

    const sortedGames = [...games].sort((a, b) => {
      if (key === "balanceChange") {
        const aBalance = a.profit - a.wagered;
        const bBalance = b.profit - b.wagered;
        return direction === "asc" ? aBalance - bBalance : bBalance - aBalance;
      }

      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    updateGames(sortedGames);
  };

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await importData(file);
    if (success) {
      // Reload the page to refresh the data
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <StatCards games={games} />
        </div>
        {/* <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={exportData}>
            <Download size={16} className="mr-2" /> Export Data
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload size={16} className="mr-2" /> Import Data
            </Button>
          </div>
        </div> */}
      </div>

      <div className="mt-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="bg-background"
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="games"
                className="data-[state=active]:bg-background"
              >
                Games
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-background"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              {activeTab === "games" && (
                <>
                  {/* <Input
                    type="search"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-background"
                  /> */}
                  <Button onClick={addGame}>
                    <Plus size={16} className="mr-2" /> Add Game
                  </Button>
                </>
              )}
            </div>
          </div>

          <TabsContent value="games" className="mt-0">
            <div className="bg-card rounded-lg shadow-sm">
              <div className="grid grid-cols-6 items-center p-4 border-b border-border text-sm font-medium text-muted-foreground">
                <div
                  className="col-span-2 cursor-pointer hover:text-foreground pl-6"
                  onClick={() => handleSort("name")}
                >
                  Game
                </div>
                <div
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("profit")}
                >
                  Win Amount
                </div>
                <div
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("wagered")}
                >
                  Wagered
                </div>
                <div
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("balanceChange")}
                >
                  Balance Change
                </div>
                <div
                  className="text-right cursor-pointer hover:text-foreground pr-6"
                  onClick={() => handleSort("count")}
                >
                  Count
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredGames.map((g) => g.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-border">
                    {filteredGames.map((game, index) => (
                      <SortableGameItem
                        key={game.id}
                        game={game}
                        index={index}
                        deleteGame={deleteGame}
                        toggleExpand={toggleExpand}
                        setGames={setGames}
                        games={games}
                        updateGames={updateGames}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsCharts games={games} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
