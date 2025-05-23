import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  type: text("type").notNull(), // "bmi", "calories", "bodyfat"
  value: text("value").notNull(),
  date: timestamp("date").defaultNow(),
  details: text("details"), // JSON stringified additional data
});

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertWorkoutVideoSchema = createInsertSchema(workoutVideos)
  .omit({ id: true });

export const insertUserCalculationSchema = createInsertSchema(userCalculations)
  .omit({ id: true, date: true });

export const insertChatHistorySchema = createInsertSchema(chatHistory)
  .omit({ id: true, timestamp: true });

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Calculator Schemas
export const bmiCalculatorSchema = z.object({
  height: z.number().min(50, "Height must be at least 50cm").max(300, "Height cannot exceed 300cm"),
  weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight cannot exceed 500kg"),
});

export const calorieCalculatorSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(15, "Age must be at least 15").max(100, "Age cannot exceed 100"),
  height: z.number().min(50, "Height must be at least 50cm").max(300, "Height cannot exceed 300cm"),
  weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight cannot exceed 500kg"),
  activityLevel: z.number().min(1.2).max(1.9),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export const bodyFatCalculatorSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(15, "Age must be at least 15").max(100, "Age cannot exceed 100"),
  height: z.number().min(50, "Height must be at least 50cm").max(300, "Height cannot exceed 300cm"),
  weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight cannot exceed 500kg"),
  neck: z.number().min(20, "Neck must be at least 20cm").max(80, "Neck cannot exceed 80cm"),
  waist: z.number().min(40, "Waist must be at least 40cm").max(200, "Waist cannot exceed 200cm"),
  hip: z.number().optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WorkoutVideo = typeof workoutVideos.$inferSelect;
export type InsertWorkoutVideo = z.infer<typeof insertWorkoutVideoSchema>;
export type UserCalculation = typeof userCalculations.$inferSelect;
export type InsertUserCalculation = z.infer<typeof insertUserCalculationSchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type BmiCalculatorData = z.infer<typeof bmiCalculatorSchema>;
export type CalorieCalculatorData = z.infer<typeof calorieCalculatorSchema>;
export type BodyFatCalculatorData = z.infer<typeof bodyFatCalculatorSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
