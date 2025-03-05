
import { db } from "./config";
import { topics, questions, teams } from "../shared/schema";
import { eq } from "drizzle-orm";

// Topics
export async function getTopics() {
  return await db.select().from(topics);
}

export async function createTopic(data: { name: string; icon: string }) {
  const result = await db.insert(topics).values(data).returning();
  return result[0];
}

// Questions
export async function getQuestions(topicId: number) {
  return await db.select().from(questions).where(eq(questions.topicId, topicId));
}

export async function createQuestion(data: { topicId: number; points: number; question: string; answer: string }) {
  const result = await db.insert(questions).values(data).returning();
  return result[0];
}

// Teams
export async function getTeams() {
  return await db.select().from(teams);
}

export async function createTeam(data: { name: string }) {
  const result = await db.insert(teams).values({ ...data, score: 0 }).returning();
  return result[0];
}

export async function updateTeamScore(teamId: number, score: number) {
  const result = await db.update(teams)
    .set({ score })
    .where(eq(teams.id, teamId))
    .returning();
  return result[0];
}
