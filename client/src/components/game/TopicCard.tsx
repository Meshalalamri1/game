
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  points: number;
  question: string;
  answer: string;
}

interface TopicCardProps {
  topicId: number;
  name: string;
  icon: string;
  questions: Question[];
}

export default function TopicCard({ topicId, name, icon, questions }: TopicCardProps) {
  const navigate = useNavigate();

  const handleQuestionClick = (questionId: number) => {
    navigate(`/question/${questionId}`);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">{icon}</div>
          <h2 className="text-xl font-semibold">{name}</h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {questions.map((question) => (
            <Button
              key={question.id}
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleQuestionClick(question.id)}
            >
              <span>{question.points} نقطة</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
