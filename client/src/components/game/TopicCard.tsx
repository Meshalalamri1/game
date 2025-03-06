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

  // Group questions by points and filter out used questions
  const questionsByPoints = questions.reduce(
    (acc, question) => {
      // تحديد فئة النقاط
      const pointsKey = question.points;

      // إضافة السؤال إلى الفئة المناسبة إذا لم يتم استخدامه بعد
      if (!question.used) {
        if (!acc[pointsKey]) {
          acc[pointsKey] = [];
        }
        acc[pointsKey].push(question);
      }

      return acc;
    },
    { 200: [], 400: [], 600: [] } as Record<number, Question[]>
  );

  // تأكد من أن كل فئة نقاط موجودة
  [200, 400, 600].forEach(points => {
    if (!questionsByPoints[points]) {
      questionsByPoints[points] = [];
    }
  });

  // تحديث الأسئلة عند تغيير الفريق المختار
  useEffect(() => {
    if (selectedTeam) {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topic.id}/questions`] });
    }
  }, [selectedTeam, topic.id, queryClient]);

  const handleQuestionClick = (question: Question) => {
    if (!selectedTeam) return;
    setSelectedQuestion(question);
    // عند اختيار سؤال، قم بتعليمه كمستخدم
    markQuestionUsedMutation.mutate(question.id);
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
            // تحسين لعرض كل الأسئلة المتاحة لكل فئة نقاط
            return (
              <div key={points} className="flex flex-col gap-2">
                {availableQuestions.length > 0 ? availableQuestions.map((question, index) => (
                  <Button
                    key={`${points}-${index}`}
                    className="h-16"
                    variant={selectedTeam ? "default" : "outline"}
                    disabled={!selectedTeam}
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question.points}
                  </Button>
                )) : (
                  <Button
                    className="h-16"
                    variant="outline"
                    disabled={true}
                  >
                    {points}
                  </Button>
                )}
              </div>
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