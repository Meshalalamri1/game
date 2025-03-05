import { useState } from "react";
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

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["/api/topics", topic.id, "questions"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/topics", topic.id, "questions"] });
    }
  });

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{topic.icon}</span>
            <span>{topic.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {[200, 400, 600].map((points) => (
            questionsByPoints[points as keyof typeof questionsByPoints].length > 0 ? (
              <Button
                key={points}
                className="h-16"
                variant={selectedTeam ? "default" : "outline"}
                disabled={!selectedTeam}
                onClick={() => handleQuestionClick(questionsByPoints[points as keyof typeof questionsByPoints][0])}
              >
                {points}
              </Button>
            ) : (
              <Button
                key={points}
                className="h-16"
                variant="outline"
                disabled
              >
                -
              </Button>
            )
          ))}
        </CardContent>
      </Card>

      <QuestionDialog
        open={!!selectedQuestion}
        onOpenChange={() => setSelectedQuestion(null)}
        question={selectedQuestion}
        team={selectedTeam}
        onAnswer={handleQuestionAnswer}
      />
    </>
  );
}