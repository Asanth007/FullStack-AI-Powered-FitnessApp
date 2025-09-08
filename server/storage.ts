import type {
  User,
  InsertUser,
  WorkoutVideo,
  InsertWorkoutVideo,
  UserCalculation,
  InsertUserCalculation,
  ChatHistory,
  InsertChatHistory,
} from "@shared/schema";

import { MongoStorage } from "./mongo-storage";
import { ObjectId } from "mongodb";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: string | ObjectId): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  savePasswordResetToken(
    userId: string | ObjectId,
    token: string
  ): Promise<void>;
  findUserByResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(
    userId: string | ObjectId,
    newPassword: string
  ): Promise<void>;
  clearResetToken(userId: string | ObjectId): Promise<void>;

  // Video operations
  getWorkoutVideos(): Promise<WorkoutVideo[]>;
  getWorkoutVideosByCategory(category: string): Promise<WorkoutVideo[]>;
  getWorkoutVideo(id: string | ObjectId): Promise<WorkoutVideo | undefined>;
  createWorkoutVideo(video: InsertWorkoutVideo): Promise<WorkoutVideo>;

  // Calculation operations
  getUserCalculations(
    userId: string | ObjectId,
    type?: string
  ): Promise<UserCalculation[]>;
  createUserCalculation(
    calculation: InsertUserCalculation
  ): Promise<UserCalculation>;

  // Chat operations
  getChatHistory(userId: string | ObjectId): Promise<ChatHistory[]>;
  createChatHistory(chat: InsertChatHistory): Promise<ChatHistory>;
}

// Singleton storage instance — easily swappable for mocks
export const storage: IStorage = new MongoStorage();
