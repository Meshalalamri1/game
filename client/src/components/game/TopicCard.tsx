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
  used: boolean;
}

interface TopicCardProps {
  id: number;
  name: string;
  icon: string;
}

export function TopicCard({ id, name, icon }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [open, setOpen] = useState(false);

  const { data: questions = [] } = useQuery({
    queryKey: ["questions", id],
    queryFn: () => apiRequest(`/api/topics/${id}/questions`),
  });

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setOpen(true);
  };

  const points = [200, 400, 600, 800, 1000];

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex justify-center items-center gap-2">
          {icon} {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {points.map((point) => {
          const question = questions.find((q: Question) => q.points === point);
          return (
            <button
              key={point}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded text-xl ${
                question?.used ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!question || question.used}
              onClick={() => question && handleQuestionClick(question)}
            >
              {point}
            </button>
          );
        })}
      </CardContent>

      {selectedQuestion && (
        <QuestionDialog
          open={open}
          onOpenChange={setOpen}
          question={selectedQuestion}
        />
      )}
    </Card>
  );
}