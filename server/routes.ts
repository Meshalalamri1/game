import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertTeamSchema, insertTopicSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Topics
  app.get("/api/topics", async (req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.post("/api/topics", async (req, res) => {
    const parsed = insertTopicSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const topic = await storage.createTopic(parsed.data);
    res.json(topic);
  });

  app.delete("/api/topics/:id", async (req, res) => {
    try {
      await storage.deleteTopic(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  });

  // Questions
  app.get("/api/topics/:topicId/questions", async (req, res) => {
    const questions = await storage.getQuestions(Number(req.params.topicId));
    res.json(questions);
  });

  app.post("/api/questions", async (req, res) => {
    const parsed = insertQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const question = await storage.createQuestion(parsed.data);
    res.json(question);
  });

  app.post("/api/questions/:id/used", async (req, res) => {
    await storage.markQuestionUsed(Number(req.params.id));
    res.json({ success: true });
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      await storage.deleteQuestion(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  });

  // Clear all questions
  app.post("/api/questions/clear", async (req, res) => {
    try {
      await storage.clearAllQuestions();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Teams
  app.get("/api/teams", async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.post("/api/teams", async (req, res) => {
    const parsed = insertTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const team = await storage.createTeam(parsed.data);
    res.json(team);
  });

  app.patch("/api/teams/:id/score", async (req, res) => {
    const { score } = req.body;
    if (typeof score !== "number") {
      return res.status(400).json({ error: "Score must be a number" });
    }
    const team = await storage.updateTeamScore(Number(req.params.id), score);
    res.json(team);
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      await storage.deleteTeam(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  });

  app.post("/api/game/reset", async (req, res) => {
    await storage.resetGame();
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}