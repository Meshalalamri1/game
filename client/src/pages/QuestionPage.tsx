
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  topicId: number;
  points: number;
  question: string;
  answer: string;
}

export default function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: question, isLoading, error } = useQuery<Question>({
    queryKey: [`/api/questions/${questionId}`],
    enabled: !!questionId,
  });

  const handleGoBack = () => {
    navigate("/");
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">جار تحميل السؤال...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-xl text-red-500">خطأ في تحميل السؤال</p>
        <Button onClick={handleGoBack}>العودة</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">سؤال للنقاط: {question.points}</h1>
          <Button variant="outline" onClick={handleGoBack}>
            العودة للعبة
          </Button>
        </div>
        
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">السؤال:</h2>
          <p className="text-xl">{question.question}</p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Button 
            className="w-full py-3 text-lg" 
            onClick={toggleAnswer}
          >
            {showAnswer ? "إخفاء الإجابة" : "عرض الإجابة"}
          </Button>
          
          {showAnswer && (
            <div className="mt-4 p-6 bg-green-50 rounded-lg w-full">
              <h2 className="text-2xl font-semibold mb-2 text-green-800">الإجابة:</h2>
              <p className="text-xl">{question.answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
