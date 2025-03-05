
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-xl text-red-500">Error loading question</p>
        <Button onClick={handleGoBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center bg-primary text-primary-foreground p-6 rounded-t-lg">
          <CardTitle className="text-3xl">Question ({question.points} Points)</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Question:</h2>
            <div className="text-2xl p-6 bg-slate-50 rounded-lg border">
              {question.question}
            </div>
          </div>
          
          {showAnswer && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Answer:</h2>
              <div className="text-2xl p-6 bg-slate-50 rounded-lg border text-green-600">
                {question.answer}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-slate-50 rounded-b-lg">
          <Button variant="outline" onClick={handleGoBack}>
            Back to Game
          </Button>
          <Button 
            variant={showAnswer ? "secondary" : "default"}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
