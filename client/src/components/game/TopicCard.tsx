import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { QuestionDialog } from "./QuestionDialog";

interface Question {
  id: number;
  topicId: number;
  points: number;
  question: string;
  answer: string;
}

interface TopicCardProps {
  topic: {
    id: number;
    name: string;
    icon: string;
  };
}

export function TopicCard({ topic }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const { data: questions = [], refetch } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topic.id}/questions`],
    queryFn: () => apiRequest("GET", `/api/topics/${topic.id}/questions`),
  });

  // نقاط متاحة: 200, 400, 600, 800, 1000
  const pointsOptions = [200, 400, 600, 800, 1000];

  const handleQuestionClick = (points: number) => {
    const question = questions.find((q) => q.points === points);
    if (question) {
      setSelectedQuestion(question);
    }
  };

  const handleDialogClose = () => {
    if (selectedQuestion) {
      setAnsweredQuestions((prev) => [...prev, selectedQuestion.id]);
    }
    setSelectedQuestion(null);
    refetch();
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden shadow-lg border-2 hover:border-primary/50 transition-all">
        <CardHeader className="pb-2 pt-4 px-4 bg-primary/10">
          <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
            <span className="text-2xl">{topic.icon}</span>
            <span>{topic.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex-grow grid gap-2">
          {pointsOptions.map((points) => {
            const question = questions.find((q) => q.points === points);
            const isAnswered = question ? answeredQuestions.includes(question.id) : false;
            const isEmpty = !question;

            return (
              <button
                key={points}
                onClick={() => !isEmpty && !isAnswered && handleQuestionClick(points)}
                disabled={isEmpty || isAnswered}
                className={`w-full py-3 text-center font-bold rounded-md text-lg transition-all
                  ${
                    isAnswered
                      ? "bg-gray-300 text-gray-500 line-through"
                      : isEmpty
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer"
                  }
                `}
              >
                {points}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <QuestionDialog
        open={!!selectedQuestion}
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
        question={selectedQuestion}
        onClose={handleDialogClose}
      />
    </>
  );
}