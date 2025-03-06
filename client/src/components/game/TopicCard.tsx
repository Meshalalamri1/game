
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
  teams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
}

export default function TopicCard({ topic, teams, selectedTeam, onTeamSelect }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // جلب الأسئلة للموضوع
  const { data: questions = [], isLoading } = useQuery({
    queryKey: [`/api/topics/${topic.id}/questions`],
    queryFn: () => apiRequest("GET", `/api/topics/${topic.id}/questions`),
  });

  // طريقة تنظيم الأسئلة حسب النقاط
  const questionsByPoints = questions.reduce(
    (acc: Record<number, Question[]>, question: Question) => {
      const pointsKey = question.points;
      if (!acc[pointsKey]) {
        acc[pointsKey] = [];
      }
      acc[pointsKey].push(question);
      return acc;
    },
    {}
  );

  // التأكد من وجود جميع فئات النقاط
  [200, 400, 600].forEach(points => {
    if (!questionsByPoints[points]) {
      questionsByPoints[points] = [];
    }
  });

  // تعديل الدرجات للفريق
  const updateScoreMutation = useMutation({
    mutationFn: (data: { teamId: number; score: number }) =>
      apiRequest("PATCH", `/api/teams/${data.teamId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });

  // تعليم السؤال كمستخدم
  const markQuestionUsedMutation = useMutation({
    mutationFn: (questionId: number) =>
      apiRequest("PATCH", `/api/questions/${questionId}/used`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topic.id}/questions`] });
    },
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
    // نحن لا نريد تعليم السؤال كمستخدم هنا، بل فقط عند الإجابة عليه
  };

  const handleQuestionAnswer = async (correct: boolean) => {
    if (!selectedTeam || !selectedQuestion) return;

    const pointChange = correct ? selectedQuestion.points : 0;
    const newScore = selectedTeam.score + pointChange;

    await updateScoreMutation.mutateAsync({
      teamId: selectedTeam.id,
      score: newScore
    });

    // نقوم بتعليم السؤال كمستخدم بعد الإجابة عليه
    await markQuestionUsedMutation.mutateAsync(selectedQuestion.id);

    setSelectedQuestion(null);
    onTeamSelect(null);
  };

  if (isLoading) {
    return <div>جار التحميل...</div>;
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
            const questionsForThisPoints = questionsByPoints[points] || [];
            const unusedQuestions = questionsForThisPoints.filter(q => !q.used);
            
            return (
              <div key={points} className="my-2">
                <Button
                  className="w-full py-8"
                  onClick={() => {
                    if (unusedQuestions.length > 0) {
                      handleQuestionClick(unusedQuestions[0]);
                    }
                  }}
                  disabled={unusedQuestions.length === 0 || !selectedTeam}
                  variant={unusedQuestions.length === 0 ? "outline" : "default"}
                >
                  {points}
                </Button>
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
        />
      )}
    </>
  );
}
