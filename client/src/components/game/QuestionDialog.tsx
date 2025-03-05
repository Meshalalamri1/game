import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function QuestionDialog({ question, isOpen, onClose, onAnswer }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{question?.points} نقاط</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg">{question?.question}</p>
          {showAnswer ? (
            <div>
              <h3 className="font-semibold mb-2">الإجابة:</h3>
              <p>{question?.answer}</p>
            </div>
          ) : (
            <Button onClick={handleShowAnswer} className="w-full">
              عرض الإجابة
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}