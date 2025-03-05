import { useState, useEffect } from "react";
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
  teams: Team[];
}

export default function QuestionDialog({
  open,
  onOpenChange,
  question,
  team,
  onAnswer,
  teams,
}: QuestionDialogProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timer);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (open) {
      setTimeLeft(15);
      setShowAnswer(false);
      setIsPlaying(false);
    }
  }, [open]);

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rtl">
        {/* Timer */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant={isPlaying ? "destructive" : "default"}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "إيقاف" : "تشغيل"}
          </Button>
          <div className="text-3xl font-bold">
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="text-xl font-bold">
            {question.points} نقطة
          </div>
        </div>

        {/* Question */}
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
          {showAnswer && (
            <p className="text-xl mt-4 p-4 bg-muted rounded-lg">
              {question.answer}
            </p>
          )}
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {teams.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <span className="font-bold">{t.name}</span>
              <div className="flex gap-2 items-center">
                <span>{t.score}</span>
                {!showAnswer && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAnswer(true);
                      setShowAnswer(true);
                    }}
                  >
                    +{question.points}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAnswer(true)}
            disabled={showAnswer}
          >
            إظهار الإجابة
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onAnswer(false);
              onOpenChange(false);
            }}
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}