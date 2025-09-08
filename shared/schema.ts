import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------- Table Definitions (for Zod Schemas only) ----------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutVideos = pgTable("workout_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoId: text("video_id").notNull(),
  category: text("category").notNull(),
  duration: text("duration"),
});

export const userCalculations = pgTable("user_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // e.g. "bmi", "calories", "bodyfat"
  value: text("value").notNull(),
  date: timestamp("date").defaultNow(),
  details: text("details"), // JSON stringified
});

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ---------- Zod Insert Schemas ----------

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutVideoSchema = createInsertSchema(workoutVideos).omit({
  id: true,
});

export const insertUserCalculationSchema = createInsertSchema(userCalculations).omit({
  id: true,
  date: true,
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  timestamp: true,
});

// ---------- Auth Schemas ----------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ---------- Calculator Schemas ----------

export const bmiCalculatorSchema = z.object({
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
});

export const calorieCalculatorSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(15).max(100),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  activityLevel: z.number().min(1.2).max(1.9),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export const bodyFatCalculatorSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(15).max(100),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  neck: z.number().min(20).max(80),
  waist: z.number().min(40).max(200),
  hip: z.number().optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(500),
});

// ---------- ✅ MongoDB-Compatible Types ----------

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name?: string | null;
  createdAt: Date;
}

export interface WorkoutVideo {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoId: string;
  category: string;
  duration?: string | null;
}

export interface UserCalculation {
  id: string;
  userId: string;
  type: string;
  value: string;
  date: Date;
  details?: string | null;
}

export interface ChatHistory {
  id: string;
  userId: string;
  query: string;
  response: string;
  timestamp: Date;
}

// ---------- Insert Types ----------

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWorkoutVideo = z.infer<typeof insertWorkoutVideoSchema>;
export type InsertUserCalculation = z.infer<typeof insertUserCalculationSchema>;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;

// ---------- Form Data Types ----------

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type BmiCalculatorData = z.infer<typeof bmiCalculatorSchema>;
export type CalorieCalculatorData = z.infer<typeof calorieCalculatorSchema>;
export type BodyFatCalculatorData = z.infer<typeof bodyFatCalculatorSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
