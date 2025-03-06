import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TopicCard from "./TopicCard";
import TeamsScoreboard from "./TeamsScoreboard";

export default function GameBoard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // توفير سياق بديل للتنقل بدون استخدام useNavigate
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const [topicsRes, questionsRes, teamsRes] = await Promise.all([
        axios.get("/api/topics"),
        axios.get("/api/questions"),
        axios.get("/api/teams"),
      ]);

      setTopics(topicsRes.data);
      setQuestions(questionsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };

  const handleQuestionClick = (question: Question) => {
    setCurrentQuestion(question);
  };

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };

  const handleTeamScoreUpdate = async (teamId: number, newScore: number) => {
    try {
      await axios.patch(`/api/teams/${teamId}`, { score: newScore });
      setTeams(
        teams.map((team) =>
          team.id === teamId ? { ...team, score: newScore } : team
        )
      );
    } catch (error) {
      console.error("Error updating team score:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">لعبة المسابقة</h1>
        <Button
          variant="outline"
          onClick={() => handleNavigate("/admin")}
          className="ml-2"
        >
          لوحة الإدارة
        </Button>
      </div>

      <div className="mb-6">
        <TeamsScoreboard
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            questions={questions}
            selectedTeam={selectedTeam}
            onQuestionClick={handleQuestionClick}
            onTeamScoreUpdate={handleTeamScoreUpdate}
          />
        ))}
      </div>
    </div>
  );
}