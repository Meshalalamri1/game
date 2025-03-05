import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { Team } from "@shared/schema";
import GameBoard from "@/components/game/GameBoard";
import ScoreBoard from "@/components/game/ScoreBoard";

export default function Game() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"]
  });

  if (teamsLoading) {
    return <div>Loading...</div>;
  }

  if (teams.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setup Teams First</h1>
          <Link href="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <ScoreBoard teams={teams} selectedTeam={selectedTeam} />
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <GameBoard 
          selectedTeam={selectedTeam} 
          onTeamSelect={setSelectedTeam}
          teams={teams}
        />
      </div>
    </div>
  );
}