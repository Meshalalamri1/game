import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Question, Team } from "@shared/schema";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  team: Team | null;
  onAnswer: (correct: boolean) => void;
}

export default function QuestionDialog({
  open,
  onOpenChange,
  question,
  team,
  onAnswer,
}: QuestionDialogProps) {
  if (!question || !team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Question for {team.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-lg mb-4">{question.question}</p>
          <p className="text-sm text-muted-foreground">Points: {question.points}</p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="destructive" onClick={() => onAnswer(false)}>
            Incorrect
          </Button>
          <Button onClick={() => onAnswer(true)}>
            Correct
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
