import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertQuestionSchema, insertTeamSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"]
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/topics", selectedTopic, "questions"],
    enabled: !!selectedTopic
  });

  const addTeamForm = useForm({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: { name: "" }
  });

  const addQuestionForm = useForm({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      topicId: 0,
      points: 200,
      question: "",
      answer: ""
    }
  });

  const addTeamMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      await apiRequest("POST", "/api/teams", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      addTeamForm.reset();
      toast({ title: "Team added successfully" });
    }
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: typeof addQuestionForm.values) => {
      await apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics", selectedTopic, "questions"] });
      addQuestionForm.reset();
      toast({ title: "Question added successfully" });
    }
  });

  const resetGameMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/game/reset", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Game reset successfully" });
    }
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Link href="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </div>

        <Tabs defaultValue="teams">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Add Team</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...addTeamForm}>
                  <form onSubmit={addTeamForm.handleSubmit(data => addTeamMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={addTeamForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" loading={addTeamMutation.isPending}>Add Team</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Add Question</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...addQuestionForm}>
                  <form onSubmit={addQuestionForm.handleSubmit(data => addQuestionMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={addQuestionForm.control}
                      name="topicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(Number(value));
                            setSelectedTopic(value);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {topics.map((topic) => (
                                <SelectItem key={topic.id} value={String(topic.id)}>
                                  {topic.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addQuestionForm.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select points" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="200">200</SelectItem>
                              <SelectItem value="400">400</SelectItem>
                              <SelectItem value="600">600</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addQuestionForm.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addQuestionForm.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-4">
                      <Button type="submit" loading={addQuestionMutation.isPending}>
                        Add Question
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => resetGameMutation.mutate()}
                        loading={resetGameMutation.isPending}
                      >
                        Reset Game
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Topic, InsertTopic, InsertQuestion, InsertTeam } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch topics
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: () => fetch('/api/topics').then(res => res.json()),
  });

  // Add topic form
  const addTopicForm = useForm<InsertTopic>({
    resolver: zodResolver(z.object({
      name: z.string().min(1),
      icon: z.string().min(1),
    })),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  // Add topic mutation
  const addTopic = useMutation({
    mutationFn: (data: InsertTopic) => 
      fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      addTopicForm.reset();
      toast({ title: 'تمت إضافة الموضوع بنجاح' });
    },
  });

  // Add question form
  const addQuestionForm = useForm<InsertQuestion>({
    resolver: zodResolver(z.object({
      topicId: z.number().min(1),
      points: z.number().min(1),
      question: z.string().min(1),
      answer: z.string().min(1),
    })),
    defaultValues: {
      topicId: 0,
      points: 200,
      question: '',
      answer: '',
    },
  });

  // Add question mutation
  const addQuestion = useMutation({
    mutationFn: (data: InsertQuestion) => 
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-questions'] });
      addQuestionForm.reset({ 
        topicId: addQuestionForm.getValues('topicId'),
        points: 200,
        question: '',
        answer: '',
      });
      toast({ title: 'تمت إضافة السؤال بنجاح' });
    },
  });

  // Add team form
  const addTeamForm = useForm<InsertTeam>({
    resolver: zodResolver(z.object({
      name: z.string().min(1),
    })),
    defaultValues: {
      name: '',
    },
  });

  // Add team mutation
  const addTeam = useMutation({
    mutationFn: (data: InsertTeam) => 
      fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      addTeamForm.reset();
      toast({ title: 'تمت إضافة الفريق بنجاح' });
    },
  });

  return (
    <div className="container mx-auto p-4 rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة اللعبة</h1>
        <Link href="/">
          <Button variant="outline">العودة إلى اللعبة</Button>
        </Link>
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">المواضيع</TabsTrigger>
          <TabsTrigger value="questions">الأسئلة</TabsTrigger>
          <TabsTrigger value="teams">الفرق</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة موضوع جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...addTopicForm}>
                <form onSubmit={addTopicForm.handleSubmit((data) => addTopic.mutate(data))} className="space-y-4">
                  <FormField
                    control={addTopicForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الموضوع</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addTopicForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرمز</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addTopic.isPending}>إضافة</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">{topic.icon}</span>
                    {topic.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة سؤال جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...addQuestionForm}>
                <form onSubmit={addQuestionForm.handleSubmit((data) => addQuestion.mutate(data))} className="space-y-4">
                  <FormField
                    control={addQuestionForm.control}
                    name="topicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموضوع</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر موضوعاً" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.map(topic => (
                              <SelectItem key={topic.id} value={String(topic.id)}>
                                {topic.icon} {topic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addQuestionForm.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>النقاط</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النقاط" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="200">200</SelectItem>
                            <SelectItem value="400">400</SelectItem>
                            <SelectItem value="600">600</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addQuestionForm.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السؤال</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addQuestionForm.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الإجابة</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addQuestion.isPending}>إضافة</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة فريق جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...addTeamForm}>
                <form onSubmit={addTeamForm.handleSubmit((data) => addTeam.mutate(data))} className="space-y-4">
                  <FormField
                    control={addTeamForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الفريق</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addTeam.isPending}>إضافة</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
