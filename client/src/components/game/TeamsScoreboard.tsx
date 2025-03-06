
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Team } from "@shared/schema";

interface TeamsScoreboardProps {
  teams: Team[];
  selectedTeam: number | null;
  onTeamSelect: (teamId: number) => void;
}

export default function TeamsScoreboard({ 
  teams, 
  selectedTeam, 
  onTeamSelect 
}: TeamsScoreboardProps) {
  return (
    <div className="flex gap-4">
      {teams.map((team) => (
        <Card
          key={team.id}
          className={`cursor-pointer ${selectedTeam === team.id ? "border-primary" : ""}`}
          onClick={() => onTeamSelect(team.id)}
        >
          <CardContent className="p-4">
            <div className="text-lg font-bold">{team.name}</div>
            <div className="text-2xl">{team.score}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
