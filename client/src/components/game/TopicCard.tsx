
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface TopicCardProps {
  topic: Topic;
  questions: Question[];
  selectedTeam: number | null;
  onQuestionClick: (question: Question) => void;
  onTeamScoreUpdate: (teamId: number, newScore: number) => Promise<void>;
}

export default function TopicCard({
  topic,
  questions,
  selectedTeam,
  onQuestionClick,
  onTeamScoreUpdate,
}: TopicCardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    onQuestionClick(question);
  };

  const handleMarkUsed = async () => {
    if (selectedQuestion && selectedTeam !== null) {
      try {
        await axios.post(`/api/questions/${selectedQuestion.id}/used`);
        
        // Find the team
        const teamsResponse = await axios.get("/api/teams");
        const teams = teamsResponse.data;
        const team = teams.find((t: Team) => t.id === selectedTeam);
        
        if (team) {
          // Update team score
          const newScore = team.score + selectedQuestion.points;
          await onTeamScoreUpdate(selectedTeam, newScore);
          
          toast({
            title: "تم احتساب النقاط",
            description: `تم إضافة ${selectedQuestion.points} نقطة إلى الفريق ${team.name}`,
          });
          
          // Reset for the next question
          setSelectedQuestion(null);
          setShowAnswer(false);
        }
      } catch (error) {
        console.error("Error marking question as used:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث النقاط",
          variant: "destructive",
        });
      }
    }
  };

  // Group questions by points
  const questionsByPoints = questions.reduce((acc, question) => {
    if (!acc[question.points]) {
      acc[question.points] = [];
    }
    acc[question.points].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <span className="mr-2">{topic.icon}</span>
          {topic.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {[200, 400, 600].map((points) => {
          const questionsForPoints = questionsByPoints[points] || [];
          const unusedQuestions = questionsForPoints.filter(q => !q.used);

          return (
            <div key={points} className="my-2">
              {unusedQuestions.length > 0 ? (
                <Button
                  className="w-full py-6"
                  variant={selectedTeam ? "default" : "outline"}
                  disabled={!selectedTeam}
                  onClick={() => {
                    if (unusedQuestions.length > 0) {
                      handleQuestionClick(unusedQuestions[0]);
                    }
                  }}
                >
                  {points}
                </Button>
              ) : (
                <Button className="w-full py-6" variant="outline" disabled={true}>
                  {points}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
      {selectedQuestion && (
        <div className="p-4 border-t">
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
          {showAnswer && (
            <Button className="mt-4 ml-2" onClick={handleMarkUsed}>
              احتساب النقاط
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
