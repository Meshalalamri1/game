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

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add topic form
  const addTopicForm = useForm({
    resolver: zodResolver(insertTopicSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  // Add question form
  const addQuestionForm = useForm({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      topicId: 0,
      points: 200,
      question: "",
      answer: "",
    },
  });

  // Add team form
  const addTeamForm = useForm({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch data
  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"]
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
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
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

        <TabsContent value="topics">
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
        </TabsContent>

        <TabsContent value="questions">
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
                            {topics.map((topic) => (
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

        <TabsContent value="teams">
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