import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  points: integer("points").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  used: boolean("used").notNull().default(false),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull().default(0),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  name: true,
  icon: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  topicId: true,
  points: true,
  question: true,
  answer: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
