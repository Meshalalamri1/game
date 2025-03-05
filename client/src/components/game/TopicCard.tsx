
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { QuestionDialog } from "./QuestionDialog";

interface Question {
  id: number;
  question: string;
  answer: string;
  points: number;
  used: boolean;
}

interface TopicCardProps {
  id: number;
  name: string;
  points: number;
}

export function TopicCard({ id, name, points }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: questions = [] } = useQuery({
    queryKey: ["questions", id],
    queryFn: () => apiRequest(`/api/topics/${id}/questions`),
  });

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedQuestion(null);
    }
  };

  const getQuestionForPoints = (points: number) => {
    return questions.find((q: Question) => q.points === points && !q.used);
  };

  const question = getQuestionForPoints(points);

  return (
    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => question && handleQuestionClick(question)}>
      <CardHeader className="p-3">
        <CardTitle className="text-center text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-center text-2xl font-bold">{points}</div>
        {!question && <div className="text-center text-sm text-muted-foreground mt-1">تم استخدامه</div>}
      </CardContent>
      {selectedQuestion && (
        <QuestionDialog
          question={selectedQuestion}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </Card>
  );
}
