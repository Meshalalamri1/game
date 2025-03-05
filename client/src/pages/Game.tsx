import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import GameBoard from "@/components/game/GameBoard";
import ScoreBoard from "@/components/game/ScoreBoard";
import type { Team } from "@shared/schema";

export default function Game() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"]
  });

  if (teamsLoading) {
    return <div>Loading...</div>;
  }

  if (teams.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setup Teams First</h1>
          <Link href="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <ScoreBoard teams={teams} selectedTeam={selectedTeam} />
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <GameBoard 
          selectedTeam={selectedTeam} 
          onTeamSelect={setSelectedTeam}
          teams={teams}
        />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Topic, Question, Team } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Game() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Fetch topics
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: () => fetch('/api/topics').then(res => res.json()),
  });

  // Fetch teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => fetch('/api/teams').then(res => res.json()),
  });

  // Fetch questions for all topics
  const { data: allQuestions = {} } = useQuery<Record<number, Question[]>>({
    queryKey: ['all-questions'],
    queryFn: async () => {
      const questionsMap: Record<number, Question[]> = {};
      for (const topic of topics) {
        const questions = await fetch(`/api/topics/${topic.id}/questions`).then(res => res.json());
        questionsMap[topic.id] = questions;
      }
      return questionsMap;
    },
    enabled: topics.length > 0,
  });

  // Mark question as used
  const markQuestionUsed = useMutation({
    mutationFn: (questionId: number) => 
      fetch(`/api/questions/${questionId}/used`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-questions'] });
    },
  });

  // Update team score
  const updateTeamScore = useMutation({
    mutationFn: ({ teamId, score }: { teamId: number, score: number }) => 
      fetch(`/api/teams/${teamId}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  // Reset game
  const resetGame = useMutation({
    mutationFn: () => 
      fetch('/api/game/reset', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: 'تم إعادة تعيين اللعبة',
        description: 'تم إعادة تعيين جميع الأسئلة ونقاط الفرق',
      });
    },
  });

  // Handle question click
  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    if (!selectedQuestion || !selectedTeam) return;
    
    // Update team score
    const newScore = selectedTeam.score + selectedQuestion.points;
    updateTeamScore.mutate({ teamId: selectedTeam.id, score: newScore });
    
    // Mark question as used
    markQuestionUsed.mutate(selectedQuestion.id);
    
    // Close dialog
    setSelectedQuestion(null);
    setSelectedTeam(null);
    setShowAnswer(false);
  };

  // Handle incorrect answer
  const handleIncorrectAnswer = () => {
    if (!selectedQuestion) return;
    
    // Mark question as used
    markQuestionUsed.mutate(selectedQuestion.id);
    
    // Close dialog
    setSelectedQuestion(null);
    setSelectedTeam(null);
    setShowAnswer(false);
  };

  return (
    <div className="container mx-auto p-4 rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">لعبة Jeopardy</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => resetGame.mutate()}>إعادة تعيين اللعبة</Button>
          <Link href="/admin">
            <Button variant="outline">الإدارة</Button>
          </Link>
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {teams.map(team => (
          <Card key={team.id} className={`${selectedTeam?.id === team.id ? 'border-primary' : ''}`}>
            <CardHeader className="p-4">
              <CardTitle className="text-xl text-center">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-center pb-4">{team.score}</CardContent>
          </Card>
        ))}
      </div>

      {/* Game board */}
      <div className="grid grid-cols-6 gap-4">
        {topics.map(topic => (
          <div key={topic.id} className="flex flex-col">
            <div className="bg-primary text-primary-foreground p-2 rounded-t-md text-center flex items-center justify-center h-20">
              <div>
                <span className="text-2xl mr-2">{topic.icon}</span>
                <span className="font-bold">{topic.name}</span>
              </div>
            </div>
            {[200, 400, 600].map(points => {
              const question = allQuestions[topic.id]?.find(q => q.points === points);
              return (
                <Button
                  key={points}
                  variant={question?.used ? "ghost" : "outline"}
                  className="h-16 text-xl font-bold m-1"
                  disabled={!question || question.used}
                  onClick={() => question && handleQuestionClick(question)}
                >
                  {question?.used ? "" : points}
                </Button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Question Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {selectedQuestion?.question}
            </DialogTitle>
          </DialogHeader>
          
          <div className="my-8">
            {showAnswer ? (
              <div className="text-3xl text-center font-bold bg-muted p-4 rounded-md">
                {selectedQuestion?.answer}
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full text-lg py-8" 
                onClick={() => setShowAnswer(true)}
              >
                إظهار الإجابة
              </Button>
            )}
          </div>

          {showAnswer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    variant={selectedTeam?.id === team.id ? "default" : "outline"}
                    className="p-4 h-auto"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="destructive"
                  onClick={handleIncorrectAnswer}
                  disabled={!showAnswer}
                >
                  إجابة خاطئة
                </Button>
                
                <Button 
                  variant="default"
                  onClick={handleCorrectAnswer}
                  disabled={!showAnswer || !selectedTeam}
                >
                  إجابة صحيحة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
