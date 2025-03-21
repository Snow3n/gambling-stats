"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Trophy } from "lucide-react";
import { formatDate, formatShortDate } from "@/utils/date";

interface Player {
  id: string;
  name: string;
  points: number;
}

interface Tournament {
  id: string;
  name: string;
  players: Player[];
  startDate: string;
  endDate: string;
  prizePool: number;
}

const defaultTournament: Tournament = {
  id: "1",
  name: "New Tournament",
  players: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  prizePool: 1000
};

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('tournaments');
    return saved ? JSON.parse(saved) : [defaultTournament];
  });

  useEffect(() => {
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  const addTournament = () => {
    const newTournament: Tournament = {
      ...defaultTournament,
      id: Date.now().toString(),
      name: `Tournament ${tournaments.length + 1}`
    };
    setTournaments([...tournaments, newTournament]);
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments(tournaments.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTournament = (id: string) => {
    setTournaments(tournaments.filter(t => t.id !== id));
  };

  const addPlayer = (tournamentId: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: "New Player",
      points: 0
    };

    setTournaments(tournaments.map(t =>
      t.id === tournamentId
        ? { ...t, players: [...t.players, newPlayer] }
        : t
    ));
  };

  const updatePlayer = (tournamentId: string, playerId: string, updates: Partial<Player>) => {
    setTournaments(tournaments.map(t =>
      t.id === tournamentId
        ? {
            ...t,
            players: t.players.map(p =>
              p.id === playerId ? { ...p, ...updates } : p
            )
          }
        : t
    ));
  };

  const deletePlayer = (tournamentId: string, playerId: string) => {
    setTournaments(tournaments.map(t =>
      t.id === tournamentId
        ? { ...t, players: t.players.filter(p => p.id !== playerId) }
        : t
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Tournaments</h2>
        <Button onClick={addTournament}>
          <Plus className="w-4 h-4 mr-2" />
          New Tournament
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Input
                    value={tournament.name}
                    onChange={(e) => updateTournament(tournament.id, { name: e.target.value })}
                    className="text-xl font-bold"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteTournament(tournament.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Start Date</label>
                    <Input
                      type="date"
                      value={tournament.startDate}
                      onChange={(e) => updateTournament(tournament.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm">End Date</label>
                    <Input
                      type="date"
                      value={tournament.endDate}
                      onChange={(e) => updateTournament(tournament.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm">Prize Pool</label>
                  <Input
                    type="number"
                    value={tournament.prizePool}
                    onChange={(e) => updateTournament(tournament.id, { prizePool: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Players</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPlayer(tournament.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </div>

                  {tournament.players
                    .sort((a, b) => b.points - a.points)
                    .map((player, index) => (
                      <div key={player.id} className="flex gap-2 items-center">
                        <div className="w-8 text-center">
                          {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                          {index === 1 && <Trophy className="w-4 h-4 text-gray-400" />}
                          {index === 2 && <Trophy className="w-4 h-4 text-amber-600" />}
                          {index > 2 && `${index + 1}`}
                        </div>
                        <Input
                          value={player.name}
                          onChange={(e) => updatePlayer(tournament.id, player.id, { name: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={player.points}
                          onChange={(e) => updatePlayer(tournament.id, player.id, { points: parseInt(e.target.value) })}
                          className="w-24"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deletePlayer(tournament.id, player.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 