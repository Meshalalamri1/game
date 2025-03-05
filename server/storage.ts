
import { type Topic, type Question, type Team, type InsertTopic, type InsertQuestion, type InsertTeam } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { topics, questions, teams } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Topics
  getTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Questions
  getQuestions(topicId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  markQuestionUsed(id: number): Promise<void>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeamScore(id: number, score: number): Promise<Team>;
  resetGame(): Promise<void>;
}

export class MemStorage implements IStorage {
  private topics: Map<number, Topic>;
  private questions: Map<number, Question>;
  private teams: Map<number, Team>;
  private currentIds: { topic: number; question: number; team: number };

  constructor() {
    this.topics = new Map();
    this.questions = new Map();
    this.teams = new Map();
    this.currentIds = { topic: 1, question: 1, team: 1 };
    
    // Initialize with default topics
    const defaultTopics = [
      { name: "علم الساعات", icon: "⌚" },
      { name: "أهل البر", icon: "🐪" },
      { name: "أهل البحر", icon: "🎣" },
      { name: "منتجات الحديد", icon: "⚒️" },
      { name: "عواصم", icon: "🏛️" },
      { name: "خرائط", icon: "🗺️" },
    ];
    
    defaultTopics.forEach(topic => this.createTopic(topic));
  }

  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const id = this.currentIds.topic++;
    const newTopic = { id, ...topic };
    this.topics.set(id, newTopic);
    return newTopic;
  }

  async getQuestions(topicId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.topicId === topicId);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentIds.question++;
    const newQuestion = { id, ...question };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async markQuestionUsed(id: number): Promise<void> {
    const question = this.questions.get(id);
    if (question) {
      this.questions.set(id, { ...question, used: true });
    }
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.currentIds.team++;
    const newTeam = { id, ...team, score: 0 };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeamScore(id: number, score: number): Promise<Team> {
    const team = this.teams.get(id);
    if (!team) {
      throw new Error(`Team with id ${id} not found`);
    }
    const updatedTeam = { ...team, score };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async resetGame(): Promise<void> {
    // Reset all questions to unused
    for (const [id, question] of this.questions.entries()) {
      this.questions.set(id, { ...question, used: false });
    }
    
    // Reset all team scores to 0
    for (const [id, team] of this.teams.entries()) {
      this.teams.set(id, { ...team, score: 0 });
    }
  }
}

export class DbStorage implements IStorage {
  private db;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }
  
  async getTopics(): Promise<Topic[]> {
    return await this.db.select().from(topics);
  }
  
  async createTopic(topic: InsertTopic): Promise<Topic> {
    const result = await this.db.insert(topics).values(topic).returning();
    return result[0];
  }
  
  async getQuestions(topicId: number): Promise<Question[]> {
    return await this.db.select().from(questions).where(eq(questions.topicId, topicId));
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await this.db.insert(questions).values(question).returning();
    return result[0];
  }
  
  async markQuestionUsed(id: number): Promise<void> {
    await this.db.update(questions).set({ used: true }).where(eq(questions.id, id));
  }
  
  async getTeams(): Promise<Team[]> {
    return await this.db.select().from(teams);
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await this.db.insert(teams).values(team).returning();
    return result[0];
  }
  
  async updateTeamScore(id: number, score: number): Promise<Team> {
    const result = await this.db.update(teams)
      .set({ score })
      .where(eq(teams.id, id))
      .returning();
    return result[0];
  }
  
  async resetGame(): Promise<void> {
    await this.db.update(questions).set({ used: false });
    await this.db.update(teams).set({ score: 0 });
  }
}

// Initialize storage
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
