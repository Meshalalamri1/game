
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TopicCard from "./TopicCard";
import type { Team, Topic, Question } from "@shared/schema";
import axios from "axios";

interface GameBoardProps {
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  teams: Team[];
}

export default function GameBoard({ selectedTeam, onTeamSelect, teams }: GameBoardProps) {
  const queryClient = useQueryClient();
  
  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    queryFn: async () => {
      const response = await axios.get("/api/topics");
      return response.data;
    }
  });

  // جلب الأسئلة لكل موضوع
  const topicsWithQuestions = useQuery({
    queryKey: ["topicsWithQuestions"],
    queryFn: async () => {
      const topicsWithQuestionsData = await Promise.all(
        topics.map(async (topic) => {
          const response = await axios.get(`/api/topics/${topic.id}/questions`);
          return {
            ...topic,
            questions: response.data
          };
        })
      );
      return topicsWithQuestionsData;
    },
    enabled: topics.length > 0,
  });

  if (topicsLoading || topicsWithQuestions.isLoading) {
    return <div className="text-center p-10">جارٍ التحميل...</div>;
  }

  if (topicsWithQuestions.isError) {
    return <div className="text-center p-10 text-red-500">حدث خطأ في تحميل البيانات</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topicsWithQuestions.data?.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          questions={topic.questions || []}
          selectedTeam={selectedTeam ? selectedTeam.id : null}
          onQuestionClick={(question) => {
            console.log("Question clicked:", question);
          }}
          onTeamScoreUpdate={async (teamId, newScore) => {
            try {
              await axios.put(`/api/teams/${teamId}`, { score: newScore });
              queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
              queryClient.invalidateQueries({ queryKey: ["topicsWithQuestions"] });
              return Promise.resolve();
            } catch (error) {
              console.error("Error updating team score:", error);
              return Promise.reject(error);
            }
          }}
        />
      ))}
    </div>
  );
}
