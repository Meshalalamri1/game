
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuestionPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(`/api/questions/${questionId}`);
        if (!response.ok) {
          throw new Error("فشل في جلب السؤال");
        }
        const data = await response.json();
        setQuestion(data);
        setLoading(false);
      } catch (err) {
        setError("حدث خطأ أثناء جلب السؤال");
        setLoading(false);
      }
    }

    fetchQuestion();
  }, [questionId]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error || "لم يتم العثور على السؤال"}</p>
          <Button onClick={handleBack}>العودة للصفحة الرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{question.points} نقاط</h1>
            <Button variant="outline" onClick={handleBack}>
              العودة
            </Button>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">السؤال:</h2>
              <p className="text-lg">{question.question}</p>
            </div>

            {showAnswer ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">الإجابة:</h2>
                <p className="text-lg">{question.answer}</p>
              </div>
            ) : (
              <Button onClick={handleShowAnswer} className="w-full py-6 text-lg">
                عرض الإجابة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
