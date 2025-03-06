
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Question, Team, Topic } from "@shared/schema";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface TopicCardProps {
  topic: Topic;
  selectedTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  teams: Team[];
}

export default function TopicCard({ topic, selectedTeam, onTeamSelect, teams }: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  const { data: questions = [], refetch } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topic.id}/questions`],
  });

  // جمع الأسئلة حسب فئات النقاط
  const pointCategories = [200, 400, 600];
  const questionsByPoints: Record<number, Question[]> = {};
  
  // تهيئة مصفوفات فارغة لكل فئة نقاط
  pointCategories.forEach(points => {
    questionsByPoints[points] = [];
  });
  
  // تصنيف الأسئلة حسب النقاط
  questions.forEach(question => {
    if (pointCategories.includes(question.points)) {
      questionsByPoints[question.points].push(question);
    }
  });

  const handleQuestionClick = async (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
  };

  const handleMarkUsed = async () => {
    if (!selectedQuestion) return;

    try {
      await axios.post(`/api/questions/${selectedQuestion.id}/used`);
      await refetch();
      
      if (selectedTeam) {
        const newScore = selectedTeam.score + selectedQuestion.points;
        await axios.patch(`/api/teams/${selectedTeam.id}/score`, { score: newScore });
        onTeamSelect(null); // إعادة تعيين الفريق المحدد
      }
      
      setSelectedQuestion(null);
      toast({
        title: "تم تحديث النقاط",
        description: "تم تحديث حالة السؤال ونقاط الفريق بنجاح",
      });
    } catch (error) {
      console.error("Error marking question as used:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة السؤال",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {topic.icon} {topic.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {pointCategories.map((points) => {
            const questionsForPoints = questionsByPoints[points] || [];
            const unusedQuestions = questionsForPoints.filter(q => !q.used);
            
            return (
              <div key={points} className="my-2">
                <Button
                  className="w-full py-6 text-xl"
                  variant={unusedQuestions.length > 0 ? "default" : "outline"}
                  disabled={unusedQuestions.length === 0 || !selectedTeam}
                  onClick={() => {
                    if (unusedQuestions.length > 0) {
                      handleQuestionClick(unusedQuestions[0]);
                    }
                  }}
                >
                  {points}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>سؤال ({selectedQuestion.points} نقطة)</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-xl font-semibold">{selectedQuestion.question}</div>
            
            {showAnswer ? (
              <div className="mt-4 bg-secondary p-4 rounded-md">
                <h3 className="font-bold mb-2">الإجابة:</h3>
                <p>{selectedQuestion.answer}</p>
              </div>
            ) : (
              <Button className="mt-4" onClick={() => setShowAnswer(true)}>
                عرض الإجابة
              </Button>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
                إغلاق
              </Button>
              {showAnswer && (
                <Button onClick={handleMarkUsed}>
                  احتساب النقاط للفريق {selectedTeam?.name}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
