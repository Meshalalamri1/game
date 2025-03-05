import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Team } from "@shared/schema";

interface ScoreBoardProps {
  teams: Team[];
  selectedTeam: Team | null;
  onTeamSelect?: (team: Team | null) => void;
}

export default function ScoreBoard({ teams, selectedTeam }: ScoreBoardProps) {
  return (
    <div className="flex gap-4">
      {teams.map((team) => (
        <Card
          key={team.id}
          className={selectedTeam?.id === team.id ? "border-primary" : ""}
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
