
import React, { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface TopicCardProps {
  topic: Topic;
  questions: Question[];
  selectedTeam: number | null;
  onQuestionClick: (question: Question) => void;
  onTeamScoreUpdate: (teamId: number, newScore: number) => Promise<void>;
}

export default function TopicCard({
  topic,
  questions,
  selectedTeam,
  onQuestionClick,
  onTeamScoreUpdate,
}: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    onQuestionClick(question);
  };

  const handleMarkUsed = async () => {
    if (!selectedQuestion || !selectedTeam) return;

    try {
      const team = await axios.get(`/api/teams/${selectedTeam}`);
      const newScore = team.data.score + selectedQuestion.points;
      await onTeamScoreUpdate(selectedTeam, newScore);

      await axios.patch(`/api/questions/${selectedQuestion.id}`, {
        used: true,
      });

      toast({
        title: "تم احتساب النقاط",
        description: `تم إضافة ${selectedQuestion.points} نقطة إلى الفريق`,
      });

      setSelectedQuestion(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث النقاط",
        variant: "destructive",
      });
    }
  };

  // تنظيم الأسئلة حسب النقاط
  const questionsByPoints = questions.reduce((acc, question) => {
    if (question.topicId === topic.id) {
      acc[question.points] = acc[question.points] || [];
      acc[question.points].push(question);
    }
    return acc;
  }, {} as Record<number, Question[]>);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-xl">{topic.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {[200, 400, 600].map((points) => {
          const questionsForPoints = questionsByPoints[points] || [];
          const unusedQuestions = questionsForPoints.filter(q => !q.used);

          return (
            <div key={points} className="my-2">
              {unusedQuestions.length > 0 ? (
                <Button
                  className="w-full py-6 text-xl font-bold"
                  variant={selectedTeam ? "default" : "outline"}
                  disabled={!selectedTeam}
                  onClick={() => {
                    if (unusedQuestions.length > 0) {
                      handleQuestionClick(unusedQuestions[0]);
                    }
                  }}
                >
                  {points}
                </Button>
              ) : (
                <Button className="w-full py-6 text-xl font-bold" variant="outline" disabled={true}>
                  {points}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
      {selectedQuestion && (
        <div className="p-4 border-t">
          <div className="py-4 text-xl font-bold text-center">{selectedQuestion.question}</div>
          {showAnswer ? (
            <div className="mt-4 bg-secondary p-4 rounded-md">
              <h3 className="font-bold mb-2 text-lg">الإجابة:</h3>
              <p className="text-lg">{selectedQuestion.answer}</p>
              
              <div className="mt-4 flex justify-center">
                <Button onClick={handleMarkUsed} size="lg" className="px-8">
                  احتساب النقاط
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Button onClick={() => setShowAnswer(true)} size="lg" className="px-8">
                عرض الإجابة
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
