import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { z } from "zod";
import { insertQuestionSchema, insertTeamSchema, insertTopicSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface Topic {
  id: number;
  name: string;
  icon: string;
}

interface Question {
  id: number;
  topicId: number;
  points: number;
  question: string;
  answer: string;
  used: boolean;
}

interface Team {
  id: number;
  name: string;
  score: number;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTopics, setShowTopics] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // Forms
  const addTopicForm = useForm({
    resolver: zodResolver(insertTopicSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  const addQuestionForm = useForm({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      topicId: 1, // تعيين قيمة أولية صالحة
      points: 200,
      question: "",
      answer: "",
    },
  });

  const addTeamForm = useForm({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  // Queries
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"]
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"]
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: [`/api/topics/${selectedTopicId}/questions`],
    enabled: !!selectedTopicId,
  });

  // Mutations
  const addTopic = useMutation({
    mutationFn: (data: z.infer<typeof insertTopicSchema>) =>
      apiRequest("POST", "/api/topics", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      addTopicForm.reset();
      toast({ title: "تم إضافة الموضوع بنجاح" });
    },
  });

  const addQuestion = useMutation({
    mutationFn: (data: z.infer<typeof insertQuestionSchema>) =>
      apiRequest("POST", "/api/questions", data),
    onSuccess: () => {
      if (selectedTopicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/topics/${selectedTopicId}/questions`] 
        });
      }
      addQuestionForm.reset();
      toast({ title: "تم إضافة السؤال بنجاح" });
    },
  });

  const addTeam = useMutation({
    mutationFn: (data: z.infer<typeof insertTeamSchema>) =>
      apiRequest("POST", "/api/teams", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      addTeamForm.reset();
      toast({ title: "تم إضافة الفريق بنجاح" });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (teamId: number) => 
      apiRequest("DELETE", `/api/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "تم حذف الفريق بنجاح" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "حدث خطأ أثناء حذف الفريق",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteQuestion = useMutation({
    mutationFn: (questionId: number) =>
      apiRequest("DELETE", `/api/questions/${questionId}`),
    onSuccess: () => {
      if (selectedTopicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/topics/${selectedTopicId}/questions`] 
        });
      }
      toast({ title: "تم حذف السؤال بنجاح" });
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ أثناء حذف السؤال",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTopic = useMutation({
    mutationFn: (topicId: number) => 
      apiRequest("DELETE", `/api/topics/${topicId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "تم حذف الموضوع بنجاح" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "حدث خطأ أثناء حذف الموضوع",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const clearAllQuestions = useMutation({
    mutationFn: () => apiRequest("POST", "/api/questions/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      if (selectedTopicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/topics/${selectedTopicId}/questions`] 
        });
      }
      toast({ title: "تم حذف جميع الأسئلة بنجاح" });
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ أثناء حذف الأسئلة",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // تقديم النموذج لإضافة سؤال جديد
  const onSubmitQuestion = (data) => {
    // تم إزالة التحقق من عدد الأسئلة لنفس فئة النقاط للسماح بإضافة أكثر من سؤالين
    addQuestion.mutate(data);
    addQuestionForm.reset();
  };

  return (
    <div className="container mx-auto p-4 rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة اللعبة</h1>
        <div className="flex gap-2">
          <Button 
            variant="destructive"
            onClick={() => clearAllQuestions.mutate()}
            disabled={clearAllQuestions.isPending}
          >
            حذف جميع الأسئلة
          </Button>
          <Link href="/">
            <Button variant="outline">العودة إلى اللعبة</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">المواضيع</TabsTrigger>
          <TabsTrigger value="questions">الأسئلة</TabsTrigger>
          <TabsTrigger value="teams">الفرق</TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المواضيع</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...addTopicForm}>
                <form onSubmit={addTopicForm.handleSubmit(data => addTopic.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>رمز الموضوع</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={addTopic.isPending}>
                    إضافة موضوع
                  </Button>
                </form>
              </Form>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTopics(!showTopics)}
                  className="mb-4"
                >
                  {showTopics ? "إخفاء المواضيع" : "عرض المواضيع"}
                </Button>

                {showTopics && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-bold mb-4">قائمة المواضيع</h3>
                    <div className="space-y-2">
                      {topics.map((topic: Topic) => (
                        <div key={topic.id} className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{topic.icon}</span>
                            <span>{topic.name}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTopic.mutate(topic.id)}
                            disabled={deleteTopic.isPending}
                          >
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الأسئلة</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...addQuestionForm}>
                <form onSubmit={addQuestionForm.handleSubmit(onSubmitQuestion)} className="space-y-4">
                  <FormField
                    control={addQuestionForm.control}
                    name="topicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموضوع</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            setSelectedTopicId(Number(value));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر موضوعاً" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.map((topic: Topic) => (
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

              {selectedTopicId && questions.length > 0 && (
                <div className="mt-6 border rounded-md p-4">
                  <h3 className="font-bold mb-4">الأسئلة الحالية</h3>
                  <div className="space-y-2">
                    {questions.map((question: Question) => (
                      <div key={question.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-semibold">{question.question}</div>
                          <div className="text-sm text-gray-500">النقاط: {question.points}</div>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => deleteQuestion.mutate(question.id)}
                          disabled={deleteQuestion.isPending}
                          size="sm"
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الفرق</CardTitle>
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

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTeams(!showTeams)}
                  className="mb-4"
                >
                  {showTeams ? "إخفاء الفرق" : "عرض الفرق"}
                </Button>

                {showTeams && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-bold mb-4">قائمة الفرق</h3>
                    <div className="space-y-2">
                      {teams.map((team: Team) => (
                        <div key={team.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <span>{team.name}</span>
                            <span className="text-sm text-gray-500 mr-2">({team.score} نقطة)</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTeam.mutate(team.id)}
                            disabled={deleteTeam.isPending}
                          >
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}