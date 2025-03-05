import { type Topic, type Question, type Team, type InsertTopic, type InsertQuestion, type InsertTeam } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { topics, questions, teams } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Topics
  getTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  deleteTopic(id: number): Promise<void>;

  // Questions
  getQuestions(topicId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  markQuestionUsed(id: number): Promise<void>;
  deleteQuestion(id: number): Promise<void>;

  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeamScore(id: number, score: number): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
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

  async deleteTopic(id: number): Promise<void> {
    if (!this.topics.has(id)) {
      throw new Error(`Topic with id ${id} not found`);
    }
    // Delete associated questions first
    const associatedQuestions = Array.from(this.questions.values())
      .filter(q => q.topicId === id);

    for (const question of associatedQuestions) {
      this.questions.delete(question.id);
    }

    this.topics.delete(id);
  }

  async getQuestions(topicId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.topicId === topicId);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentIds.question++;
    const newQuestion = { id, ...question, used: false };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async markQuestionUsed(id: number): Promise<void> {
    const question = this.questions.get(id);
    if (question) {
      this.questions.set(id, { ...question, used: true });
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    if (!this.questions.has(id)) {
      throw new Error(`Question with id ${id} not found`);
    }
    this.questions.delete(id);
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

  async deleteTeam(id: number): Promise<void> {
    if (!this.teams.has(id)) {
      throw new Error(`Team with id ${id} not found`);
    }
    this.teams.delete(id);
  }

  async resetGame(): Promise<void> {
    for (const [id, question] of this.questions.entries()) {
      this.questions.set(id, { ...question, used: false });
    }

    for (const [id, team] of this.teams.entries()) {
      this.teams.set(id, { ...team, score: 0 });
    }
  }
}

// Initialize storage
export const storage = new MemStorage();