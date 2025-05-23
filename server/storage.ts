import { users, workoutVideos, userCalculations, chatHistory } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  WorkoutVideo, 
  InsertWorkoutVideo, 
  UserCalculation, 
  InsertUserCalculation,
  ChatHistory,
  InsertChatHistory
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video operations
  getWorkoutVideos(): Promise<WorkoutVideo[]>;
  getWorkoutVideosByCategory(category: string): Promise<WorkoutVideo[]>;
  getWorkoutVideo(id: number): Promise<WorkoutVideo | undefined>;
  createWorkoutVideo(video: InsertWorkoutVideo): Promise<WorkoutVideo>;
  
  // Calculation operations
  getUserCalculations(userId: number, type?: string): Promise<UserCalculation[]>;
  createUserCalculation(calculation: InsertUserCalculation): Promise<UserCalculation>;
  
  // Chat operations
  getChatHistory(userId: number): Promise<ChatHistory[]>;
  createChatHistory(chat: InsertChatHistory): Promise<ChatHistory>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workoutVideos: Map<number, WorkoutVideo>;
  private userCalculations: Map<number, UserCalculation>;
  private chatHistory: Map<number, ChatHistory>;
  private currentId: {
    users: number;
    workoutVideos: number;
    userCalculations: number;
    chatHistory: number;
  };

  constructor() {
    this.users = new Map();
    this.workoutVideos = new Map();
    this.userCalculations = new Map();
    this.chatHistory = new Map();
    this.currentId = {
      users: 1,
      workoutVideos: 1,
      userCalculations: 1,
      chatHistory: 1
    };
    
    // Add initial workout videos
    this.seedWorkoutVideos();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Video operations
  async getWorkoutVideos(): Promise<WorkoutVideo[]> {
    return Array.from(this.workoutVideos.values());
  }
  
  async getWorkoutVideosByCategory(category: string): Promise<WorkoutVideo[]> {
    if (category === "all") {
      return this.getWorkoutVideos();
    }
    
    return Array.from(this.workoutVideos.values()).filter(
      (video) => video.category === category
    );
  }
  
  async getWorkoutVideo(id: number): Promise<WorkoutVideo | undefined> {
    return this.workoutVideos.get(id);
  }
  
  async createWorkoutVideo(insertVideo: InsertWorkoutVideo): Promise<WorkoutVideo> {
    const id = this.currentId.workoutVideos++;
    const video: WorkoutVideo = { ...insertVideo, id };
    this.workoutVideos.set(id, video);
    return video;
  }
  
  // Calculation operations
  async getUserCalculations(userId: number, type?: string): Promise<UserCalculation[]> {
    const calculations = Array.from(this.userCalculations.values()).filter(
      (calc) => calc.userId === userId && (!type || calc.type === type)
    );
    
    // Sort by date, newest first
    return calculations.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return b.date.getTime() - a.date.getTime();
    });
  }
  
  async createUserCalculation(insertCalculation: InsertUserCalculation): Promise<UserCalculation> {
    const id = this.currentId.userCalculations++;
    const now = new Date();
    const calculation: UserCalculation = { ...insertCalculation, id, date: now };
    this.userCalculations.set(id, calculation);
    return calculation;
  }
  
  // Chat operations
  async getChatHistory(userId: number): Promise<ChatHistory[]> {
    const history = Array.from(this.chatHistory.values()).filter(
      (chat) => chat.userId === userId
    );
    
    // Sort by timestamp, newest first
    return history.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }
  
  async createChatHistory(insertChat: InsertChatHistory): Promise<ChatHistory> {
    const id = this.currentId.chatHistory++;
    const now = new Date();
    const chat: ChatHistory = { ...insertChat, id, timestamp: now };
    this.chatHistory.set(id, chat);
    return chat;
  }
  
  // Seed initial workout videos
  private seedWorkoutVideos() {
    const initialVideos: InsertWorkoutVideo[] = [
      {
        title: "15-Minute Arm Workout for Beginners",
        description: "A beginner-friendly arm workout targeting biceps, triceps, and shoulders.",
        thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e",
        videoId: "UyTR2EjTAXU",
        category: "arms",
        duration: "15:24"
      },
      {
        title: "30-Minute Leg Strength Training",
        description: "Complete leg workout focusing on quads, hamstrings, and glutes.",
        thumbnailUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d",
        videoId: "RjexvOAsVtI",
        category: "legs",
        duration: "30:12"
      },
      {
        title: "10-Minute Ab Workout",
        description: "Quick core workout you can do anywhere without equipment.",
        thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        videoId: "pMmU4z-edOw",
        category: "core",
        duration: "10:45"
      },
      {
        title: "20-Minute HIIT Cardio",
        description: "High-intensity interval training to burn calories and improve cardiovascular health.",
        thumbnailUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c",
        videoId: "ml6cT4AZdqI",
        category: "cardio",
        duration: "21:33"
      },
      {
        title: "45-Minute Full Body Workout",
        description: "Complete workout targeting all major muscle groups for total body conditioning.",
        thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        videoId: "5PoEVZH8OP4",
        category: "fullbody",
        duration: "45:17"
      },
      {
        title: "Dumbbell Arm Workout",
        description: "Strengthen and tone your arms with this dumbbell-focused routine.",
        thumbnailUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb",
        videoId: "jPbB-M9b1xE",
        category: "arms",
        duration: "18:05"
      },
      {
        title: "Bodyweight Leg Workout at Home",
        description: "No equipment needed for this effective leg strengthening routine.",
        thumbnailUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a",
        videoId: "kwkXyHjgoDM",
        category: "legs",
        duration: "25:40"
      },
      {
        title: "Advanced Core Workout",
        description: "Challenge your core with these advanced moves for a stronger midsection.",
        thumbnailUrl: "https://images.unsplash.com/photo-1616803689943-5601631c7fec",
        videoId: "DHD1-2P94DI",
        category: "core",
        duration: "15:20"
      }
    ];
    
    initialVideos.forEach(video => {
      this.createWorkoutVideo(video);
    });
  }
}

import { MongoStorage } from './mongo-storage';

// Switch between in-memory storage and MongoDB storage
const useMongoStorage = true;
export const storage = useMongoStorage ? new MongoStorage() : new MemStorage();
