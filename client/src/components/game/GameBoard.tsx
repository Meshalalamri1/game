import { useQuery } from "@tanstack/react-query";
import TopicCard from "./TopicCard";
import type { Team, Topic } from "@shared/schema";

interface GameBoardProps {
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  teams: Team[];
}

export default function GameBoard({ selectedTeam, onTeamSelect, teams }: GameBoardProps) {
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"]
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic: Topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          selectedTeam={selectedTeam}
          onTeamSelect={onTeamSelect}
          teams={teams}
        />
      ))}
    </div>
  );
}