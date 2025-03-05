
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";

interface Team {
  id: number;
  name: string;
  score: number;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  points: number;
}

interface QuestionDialogProps {
  question: Question;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionDialog({ question, open, onOpenChange }: QuestionDialogProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiRequest("/api/teams"),
  });

  const updateScoreMutation = useMutation({
    mutationFn: (data: { teamId: number; score: number }) =>
      apiRequest(`/api/teams/${data.teamId}/score`, {
        method: "PATCH",
        body: JSON.stringify({ score: data.score }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onOpenChange(false);
    },
  });

  const markQuestionUsedMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/questions/${question.id}/used`, {
        method: "POST"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    }
  });

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleAwardPoints = () => {
    if (selectedTeam) {
      updateScoreMutation.mutate({
        teamId: selectedTeam.id,
        score: selectedTeam.score + question.points,
      });
      markQuestionUsedMutation.mutate();
    }
  };

  const handleClose = () => {
    markQuestionUsedMutation.mutate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">سؤال بقيمة {question.points} نقطة</DialogTitle>
        </DialogHeader>
        <div className="mt-6 text-xl">{question.question}</div>
        
        {!showAnswer ? (
          <Button onClick={() => setShowAnswer(true)} className="mt-4">
            عرض الإجابة
          </Button>
        ) : (
          <div className="mt-4 p-4 bg-muted rounded-md text-xl">
            <strong>الإجابة:</strong> {question.answer}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">اختر الفريق:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {teams.map((team: Team) => (
              <Card
                key={team.id}
                className={`p-4 cursor-pointer text-center hover:bg-accent ${
                  selectedTeam?.id === team.id ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => handleTeamSelect(team)}
              >
                {team.name} ({team.score})
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          {selectedTeam && (
            <Button onClick={handleAwardPoints} className="mr-2">
              منح {selectedTeam.name} {question.points} نقطة
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
