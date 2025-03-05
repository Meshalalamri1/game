
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Team } from "@/types";
import { Card } from "@/components/ui/card";

interface Question {
  id: number;
  topicId: number;
  points: number;
  question: string;
  answer: string;
  used: boolean;
}

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
}

export function QuestionDialog({ open, onOpenChange, question }: QuestionDialogProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiRequest("/api/teams"),
  });

  const markQuestionUsedMutation = useMutation({
    mutationFn: () => apiRequest(`/api/questions/${question.id}/use`, { method: "POST" }),
    onSuccess: () => {
      onOpenChange(false);
      window.location.reload();
    }
  });

  const updateTeamScoreMutation = useMutation({
    mutationFn: ({ teamId, points }: { teamId: number; points: number }) => 
      apiRequest(`/api/teams/${teamId}/score`, { 
        method: "POST", 
        body: JSON.stringify({ points }) 
      }),
    onSuccess: () => {
      markQuestionUsedMutation.mutate();
    }
  });

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCorrect = () => {
    if (selectedTeam) {
      updateTeamScoreMutation.mutate({ 
        teamId: selectedTeam.id, 
        points: question.points 
      });
    }
  };

  const handleIncorrect = () => {
    if (selectedTeam) {
      updateTeamScoreMutation.mutate({ 
        teamId: selectedTeam.id, 
        points: -question.points 
      });
    }
  };

  const handleClose = () => {
    markQuestionUsedMutation.mutate();
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

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleCorrect}
            className="bg-green-600 hover:bg-green-700"
            disabled={!selectedTeam}
          >
            إجابة صحيحة
          </Button>
          <Button
            onClick={handleIncorrect}
            variant="destructive"
            disabled={!selectedTeam}
          >
            إجابة خاطئة
          </Button>
          <Button onClick={handleClose} variant="outline" className="mr-auto">
            تخطي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
