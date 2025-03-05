
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Team } from "@/types";
import { Card } from "@/components/ui/card";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    id: number;
    topicId: number;
    points: number;
    question: string;
    answer: string;
  } | null;
  onClose: () => void;
}

export function QuestionDialog({ open, onOpenChange, question, onClose }: QuestionDialogProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds timer
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  // Get teams data
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    queryFn: () => apiRequest("GET", "/api/teams"),
    enabled: open,
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (open && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      // Auto show answer when timer ends
      setShowAnswer(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, timer, isPaused]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTimer(30);
      setShowAnswer(false);
      setIsPaused(false);
      setSelectedTeam(null);
    }
  }, [open]);

  const handleUpdateScore = async (teamId: number) => {
    if (!question) return;
    
    try {
      await apiRequest("PATCH", `/api/teams/${teamId}`, {
        addScore: question.points
      });
      
      // Close dialog after updating score
      onClose();
    } catch (error) {
      console.error("Error updating team score:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setTimer(30);
    setIsPaused(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rtl max-w-3xl" onInteractOutside={(e) => e.preventDefault()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 bg-black/10 p-2 rounded-md">
            <Button 
              onClick={togglePause} 
              variant="ghost" 
              className="w-8 h-8 p-0 rounded-full"
            >
              {isPaused ? "▶" : "⏸"}
            </Button>
            <div className="text-xl font-bold">{formatTime(timer)}</div>
            <Button 
              onClick={resetTimer} 
              variant="ghost" 
              className="w-8 h-8 p-0 rounded-full"
            >
              ↻
            </Button>
          </div>
          <div className="text-xl font-bold bg-black text-white px-4 py-1 rounded-md">
            {question.points} نقطة
          </div>
        </div>

        <div className="flex mb-4">
          {/* عرض الفرق ونقاطهم */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {teams.map((team) => (
              <Card key={team.id} className="p-2">
                <div className={`flex flex-col items-center justify-center p-2 rounded-md ${selectedTeam === team.id ? 'bg-primary/20' : ''}`}>
                  <div className="text-xl font-bold">{team.name}</div>
                  <div className="text-3xl font-bold">{team.score}</div>
                  <div className="text-sm">وسائل المساعدة</div>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">50</Button>
                    <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">📞</Button>
                    <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">👥</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{question.question}</DialogTitle>
        </DialogHeader>

        {question.answer && question.answer.includes('http') ? (
          <div className="flex justify-center my-4">
            <img src={question.answer} alt="إجابة السؤال" className="max-h-[300px] object-contain" />
          </div>
        ) : null}

        <div className="flex justify-between mt-6">
          <Button 
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-2 text-lg"
            onClick={() => setShowAnswer(true)}
          >
            الإجابة
          </Button>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 text-lg"
            onClick={() => setShowAnswer(true)}
          >
            تجاهل الزر
          </Button>
        </div>

        {showAnswer && (
          <div className="mt-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-bold text-lg mb-2">الإجابة:</h3>
              <p className="text-xl">{question.answer}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">اختر الفريق الفائز:</h3>
              <div className="grid grid-cols-2 gap-4">
                {teams.map((team) => (
                  <Button
                    key={team.id}
                    className={`p-4 text-lg ${selectedTeam === team.id ? 'bg-primary' : 'bg-primary/60'}`}
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 text-lg ml-2"
                  onClick={onClose}
                >
                  إغلاق
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg"
                  onClick={() => selectedTeam && handleUpdateScore(selectedTeam)}
                  disabled={selectedTeam === null}
                >
                  إضافة النقاط للفريق
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
