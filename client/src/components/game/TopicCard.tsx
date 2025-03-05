import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuestionDialog from "./QuestionDialog";
import type { Topic, Team, Question } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TopicCardProps {
  topic: Topic;
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  teams: Team[];
}

export default function TopicCard({ topic, selectedTeam, onTeamSelect, teams }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Fetch questions for this topic
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topic.id}/questions`],
    enabled: true
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, score }: { teamId: number; score: number }) => {
      await apiRequest("PATCH", `/api/teams/${teamId}/score`, { score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    }
  });

  const markQuestionUsedMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await apiRequest("POST", `/api/questions/${questionId}/used`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topic.id}/questions`] });
    }
  });

  // Group questions by points.  This handles cases where there are fewer than 2 questions for a point value.
  const questionsByPoints = {
    200: questions.filter(q => q.points === 200 && !q.used),
    400: questions.filter(q => q.points === 400 && !q.used),
    600: questions.filter(q => q.points === 600 && !q.used)
  };

  const handleQuestionClick = (question: Question) => {
    if (!selectedTeam) return;
    setSelectedQuestion(question);
  };

  const handleQuestionAnswer = async (correct: boolean) => {
    if (!selectedTeam || !selectedQuestion) return;

    const pointChange = correct ? selectedQuestion.points : 0;
    const newScore = selectedTeam.score + pointChange;

    await updateScoreMutation.mutateAsync({
      teamId: selectedTeam.id,
      score: newScore
    });

    await markQuestionUsedMutation.mutateAsync(selectedQuestion.id);

    setSelectedQuestion(null);
    onTeamSelect(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{topic.icon}</span>
            <span>{topic.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {[200, 400, 600].map((points) => {
            const availableQuestions = questionsByPoints[points as keyof typeof questionsByPoints];
            //Improved to handle less than two questions per point value.
            return (
              <>
                {availableQuestions.map((question, index) => (
                  <Button
                    key={`${points}-${index + 1}`}
                    className="h-16"
                    variant={selectedTeam ? "default" : "outline"}
                    disabled={!selectedTeam || index >= availableQuestions.length}
                    onClick={() => handleQuestionClick(question)}
                  >
                    {points}
                  </Button>
                ))}
              </>
            );
          })}
        </CardContent>
      </Card>

      {selectedQuestion && (
        <QuestionDialog
          open={!!selectedQuestion}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedQuestion(null);
              onTeamSelect(null);
            }
          }}
          question={selectedQuestion}
          team={selectedTeam}
          onAnswer={handleQuestionAnswer}
          teams={teams}
        />
      )}
    </>
  );
}