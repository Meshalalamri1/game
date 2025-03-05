
import express from "express";
import { Server } from "http";
import { getTopics, getQuestions, getTeams, updateTeamScore, createTopic, createQuestion, createTeam } from "./storage";

export async function registerRoutes(app: express.Express): Promise<Server> {
  const server = new Server(app);

  // API Routes
  app.get("/api/topics", async (_req, res) => {
    const topics = await getTopics();
    res.json(topics);
  });

  app.get("/api/topics/:topicId/questions", async (req, res) => {
    const topicId = parseInt(req.params.topicId);
    const questions = await getQuestions(topicId);
    res.json(questions);
  });

  app.get("/api/teams", async (_req, res) => {
    const teams = await getTeams();
    res.json(teams);
  });

  app.post("/api/topics", async (req, res) => {
    const { name, icon } = req.body;
    const topic = await createTopic({ name, icon });
    res.json(topic);
  });

  app.post("/api/questions", async (req, res) => {
    const { topicId, points, question, answer } = req.body;
    const newQuestion = await createQuestion({ topicId, points, question, answer });
    res.json(newQuestion);
  });

  app.post("/api/teams", async (req, res) => {
    const { name } = req.body;
    const team = await createTeam({ name });
    res.json(team);
  });

  app.put("/api/teams/:teamId/score", async (req, res) => {
    const teamId = parseInt(req.params.teamId);
    const { score } = req.body;
    const team = await updateTeamScore(teamId, score);
    res.json(team);
  });

  // Create an API endpoint for individual questions
  app.get("/api/questions/:questionId", async (req, res) => {
    const questionId = parseInt(req.params.questionId);
    const questions = await getQuestions(null);
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json(question);
  });

  return server;
}
