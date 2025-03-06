import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, Topic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import axios from "axios";


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
  };

  // Group questions by points
  const questionsByPoints = questions.reduce(
    (acc, question) => {
      const pointsKey = question.points;
      if (!acc[pointsKey]) {
        acc[pointsKey] = [];
      }
      acc[pointsKey].push(question);
      return acc;
    },
    {} as Record<number, Question[]>
  );

  const handleMarkUsed = async () => {
    if (!selectedQuestion || !selectedTeam) return;

    try {
      await axios.post(`/api/questions/${selectedQuestion.id}/used`);
      // Assuming refetch is handled externally now.
      const newScore = selectedTeam + selectedQuestion.points;
      await onTeamScoreUpdate(selectedTeam, newScore);
      setSelectedQuestion(null);
      toast({
        title: "تم تحديث النقاط",
        description: "تم تحديث حالة السؤال ونقاط الفريق بنجاح",
      });
    } catch (error) {
      console.error("Error marking question as used:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة السؤال",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-3">
        <CardTitle className="text-center">{topic.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 p-3">
        {[200, 400, 600].map((points) => {
          const questionsForPoints = questionsByPoints[points] || [];
          const unusedQuestions = questionsForPoints.filter(q => !q.used);
          
          return (
            <div key={points} className="my-2">
              {unusedQuestions.length > 0 ? (
                <Button
                  className="w-full py-8"
                  onClick={() => {
                    if (unusedQuestions.length > 0) {
                      handleQuestionClick(unusedQuestions[0]);
                    }
                  }}
                  disabled={!selectedTeam}
                >
                  {points}
                </Button>
              ) : (
                <Button
                  className="w-full py-8 bg-gray-300 text-gray-500"
                  disabled
                >
                  {points}
                </Button>
              )}
            </div>
          );
          const unusedQuestions = questionsForPoints.filter(q => !q.used);
          const unusedQuestions = questionsForPoints.filter((q) => !q.used);

          return (
            <div key={points} className="my-2">
              {unusedQuestions.length > 0 ? (
                <Button
                  className="w-full py-6"
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
                <Button className="w-full py-6" variant="outline" disabled={true}>
                  {points}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
      {selectedQuestion && (
        <div>
          <div className="py-4 text-xl font-semibold">{selectedQuestion.question}</div>
            {showAnswer ? (
              <div className="mt-4 bg-secondary p-4 rounded-md">
                <h3 className="font-bold mb-2">الإجابة:</h3>
                <p>{selectedQuestion.answer}</p>
              </div>
            ) : (
              <Button className="mt-4" onClick={() => setShowAnswer(true)}>
                عرض الإجابة
              </Button>
            )}
            {showAnswer && (
              <Button onClick={handleMarkUsed}>
                احتساب النقاط للفريق
              </Button>
            )}
          </div>
      )}

    </Card>
  );
}