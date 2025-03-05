import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import QuestionDialog from "./QuestionDialog";
import type { Topic, Team, Question } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface TopicCardProps {
  topic: Topic;
  teams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
}

export default function TopicCard({ topic, teams, selectedTeam, onTeamSelect }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const { data: questions = [] } = useQuery({
    queryKey: [`/api/topics/${topic.id}/questions`],
    queryFn: () => apiRequest("GET", `/api/topics/${topic.id}/questions`),
  });

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleQuestionAnswer = (correct: boolean) => {
    // This function is called after a question has been answered
    console.log(`Question answered ${correct ? 'correctly' : 'incorrectly'}`);
  };

  // Group questions by points
  const questionsByPoints: Record<number, Question[]> = {};
  questions.forEach((q: Question) => {
    if (!questionsByPoints[q.points]) {
      questionsByPoints[q.points] = [];
    }
    questionsByPoints[q.points].push(q);
  });

  // Sort points in ascending order
  const pointsCategories = Object.keys(questionsByPoints)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">{topic.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {pointsCategories.map((points) => {
            const questionsInCategory = questionsByPoints[points].filter(
              (q: Question) => !q.used
            );
            return questionsInCategory.length > 0 ? (
              <Button
                key={`${topic.id}-${points}`}
                variant="outline"
                className="h-16 text-lg font-bold"
                onClick={() => handleQuestionClick(questionsInCategory[0])}
                disabled={!selectedTeam}
              >
                {points}
              </Button>
            ) : (
              <Button
                key={`${topic.id}-${points}`}
                variant="outline"
                className="h-16 text-lg font-bold opacity-50"
                disabled
              >
                {points}
              </Button>
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