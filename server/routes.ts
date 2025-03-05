
import express from "express";
import { Server } from "http";
import { getTopics, getQuestions, getQuestionById, getTeams, updateTeamScore, createTopic, createQuestion, createTeam } from "./storage.js";

export async function registerRoutes(app: express.Express): Promise<Server> {
  const server = new Server(app);

  // مسارات API
  app.get("/api/topics", async (_req, res) => {
    try {
      const topics = await getTopics();
      res.json(topics);
    } catch (error) {
      console.error("خطأ في الحصول على المواضيع:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.get("/api/topics/:topicId/questions", async (req, res) => {
    try {
      const topicId = req.params.topicId === "null" ? null : parseInt(req.params.topicId);
      const questions = await getQuestions(topicId);
      res.json(questions);
    } catch (error) {
      console.error("خطأ في الحصول على الأسئلة:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.get("/api/questions/:questionId", async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const question = await getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ error: "السؤال غير موجود" });
      }
      res.json(question);
    } catch (error) {
      console.error("خطأ في الحصول على السؤال:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.get("/api/teams", async (_req, res) => {
    try {
      const teams = await getTeams();
      res.json(teams);
    } catch (error) {
      console.error("خطأ في الحصول على الفرق:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.post("/api/topics", async (req, res) => {
    try {
      const { name, icon } = req.body;
      const topic = await createTopic({ name, icon });
      res.json(topic);
    } catch (error) {
      console.error("خطأ في إنشاء موضوع:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const { topicId, points, question, answer } = req.body;
      const newQuestion = await createQuestion({ topicId, points, question, answer });
      res.json(newQuestion);
    } catch (error) {
      console.error("خطأ في إنشاء سؤال:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const { name } = req.body;
      const team = await createTeam({ name });
      res.json(team);
    } catch (error) {
      console.error("خطأ في إنشاء فريق:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  app.put("/api/teams/:teamId/score", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const { score } = req.body;
      const team = await updateTeamScore(teamId, score);
      res.json(team);
    } catch (error) {
      console.error("خطأ في تحديث نقاط الفريق:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  return server;
}
