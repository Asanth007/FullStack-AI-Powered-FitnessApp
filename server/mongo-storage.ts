import { IStorage } from './storage';
import { 
  User, 
  InsertUser, 
  WorkoutVideo, 
  InsertWorkoutVideo, 
  UserCalculation, 
  InsertUserCalculation,
  ChatHistory,
  InsertChatHistory
} from "@shared/schema";
import { 
  UserModel, 
  WorkoutVideoModel, 
  UserCalculationModel, 
  ChatHistoryModel 
} from './db';

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ _id: id });
    if (!user) return undefined;
    
    return {
      id: Number(user._id),
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name || null,
      createdAt: user.createdAt
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return undefined;
    
    return {
      id: Number(user._id),
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name || null,
      createdAt: user.createdAt
    };
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return undefined;
    
    return {
      id: Number(user._id),
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name || null,
      createdAt: user.createdAt
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser = await UserModel.create(insertUser);
    
    return {
      id: Number(newUser._id),
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      name: newUser.name || null,
      createdAt: newUser.createdAt
    };
  }
  
  // Video operations
  async getWorkoutVideos(): Promise<WorkoutVideo[]> {
    const videos = await WorkoutVideoModel.find();
    
    return videos.map(video => ({
      id: Number(video._id),
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoId: video.videoId,
      category: video.category,
      duration: video.duration || null
    }));
  }
  
  async getWorkoutVideosByCategory(category: string): Promise<WorkoutVideo[]> {
    if (category === "all") {
      return this.getWorkoutVideos();
    }
    
    const videos = await WorkoutVideoModel.find({ category });
    
    return videos.map(video => ({
      id: Number(video._id),
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoId: video.videoId,
      category: video.category,
      duration: video.duration || null
    }));
  }
  
  async getWorkoutVideo(id: number): Promise<WorkoutVideo | undefined> {
    const video = await WorkoutVideoModel.findOne({ _id: id });
    if (!video) return undefined;
    
    return {
      id: Number(video._id),
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoId: video.videoId,
      category: video.category,
      duration: video.duration || null
    };
  }
  
  async createWorkoutVideo(insertVideo: InsertWorkoutVideo): Promise<WorkoutVideo> {
    const newVideo = await WorkoutVideoModel.create(insertVideo);
    
    return {
      id: Number(newVideo._id),
      title: newVideo.title,
      description: newVideo.description || null,
      thumbnailUrl: newVideo.thumbnailUrl || null,
      videoId: newVideo.videoId,
      category: newVideo.category,
      duration: newVideo.duration || null
    };
  }
  
  // Calculation operations
  async getUserCalculations(userId: number, type?: string): Promise<UserCalculation[]> {
    const query: any = { userId };
    if (type) {
      query.type = type;
    }
    
    const calculations = await UserCalculationModel.find(query).sort({ date: -1 });
    
    return calculations.map(calc => ({
      id: Number(calc._id),
      userId: Number(calc.userId),
      type: calc.type,
      value: calc.value,
      date: calc.date,
      details: calc.details || null
    }));
  }
  
  async createUserCalculation(insertCalculation: InsertUserCalculation): Promise<UserCalculation> {
    const newCalculation = await UserCalculationModel.create(insertCalculation);
    
    return {
      id: Number(newCalculation._id),
      userId: Number(newCalculation.userId),
      type: newCalculation.type,
      value: newCalculation.value,
      date: newCalculation.date,
      details: newCalculation.details || null
    };
  }
  
  // Chat operations
  async getChatHistory(userId: number): Promise<ChatHistory[]> {
    const history = await ChatHistoryModel.find({ userId }).sort({ timestamp: -1 });
    
    return history.map(chat => ({
      id: Number(chat._id),
      userId: Number(chat.userId),
      query: chat.query,
      response: chat.response,
      timestamp: chat.timestamp
    }));
  }
  
  async createChatHistory(insertChat: InsertChatHistory): Promise<ChatHistory> {
    const newChat = await ChatHistoryModel.create(insertChat);
    
    return {
      id: Number(newChat._id),
      userId: Number(newChat.userId),
      query: newChat.query,
      response: newChat.response,
      timestamp: newChat.timestamp
    };
  }

  // Initialize with seed data if needed
  async seedWorkoutVideos() {
    const count = await WorkoutVideoModel.countDocuments();
    if (count > 0) return; // Don't seed if videos already exist
    
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
    
    await WorkoutVideoModel.insertMany(initialVideos);
    console.log('Workout videos seeded successfully');
  }
}