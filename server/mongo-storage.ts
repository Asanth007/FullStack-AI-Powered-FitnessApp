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
import bcrypt from 'bcryptjs';
import {
  UserModel,
  WorkoutVideoModel,
  UserCalculationModel,
  ChatHistoryModel
} from './db';

import { ObjectId } from 'mongodb';

export class MongoStorage implements IStorage {
  private normalizeId(id: string | ObjectId): ObjectId {
    return typeof id === 'string' ? new ObjectId(id) : id;
  }

  // User operations
  async getUser(id: string | ObjectId): Promise<User | undefined> {
    const user = await UserModel.findById(this.normalizeId(id));
    return user && {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name || null,
      createdAt: user.createdAt
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username: new RegExp(`^${username}$`, 'i') });
    return user && {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name || null,
      createdAt: user.createdAt
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
    return user && {
      id: user._id.toString(),
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
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      name: newUser.name || null,
      createdAt: newUser.createdAt
    };
  }
  // Save reset token
async savePasswordResetToken(userId: string | ObjectId, token: string): Promise<void> {
  await UserModel.updateOne(
    { _id: this.normalizeId(userId) },
    {
      $set: {
        resetToken: token,
        resetTokenExpires: new Date(Date.now() + 3600000) // 1 hour expiry
      }
    }
  );
}

// Find user by reset token
async findUserByResetToken(token: string): Promise<User | undefined> {
  const user = await UserModel.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() } // Token still valid
  });

  return user && {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    password: user.password,
    name: user.name || null,
    createdAt: user.createdAt
  };
}

// Update password
async updateUserPassword(userId: string | ObjectId, newPassword: string): Promise<void> {
  const hashed = await bcrypt.hash(newPassword, 10);
  await UserModel.updateOne(
    { _id: this.normalizeId(userId) },
    { $set: { password: hashed } }
  );
}

// Clear reset token
async clearResetToken(userId: string | ObjectId): Promise<void> {
  await UserModel.updateOne(
    { _id: this.normalizeId(userId) },
    {
      $unset: { resetToken: "", resetTokenExpires: "" }
    }
  );
}
  // Workout Video operations
  async getWorkoutVideos(): Promise<WorkoutVideo[]> {
    const videos = await WorkoutVideoModel.find();
    return videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoId: video.videoId,
      category: video.category,
      duration: video.duration || null
    }));
  }

  async getWorkoutVideosByCategory(category: string): Promise<WorkoutVideo[]> {
    const query: Record<string, any> = category === 'all' ? {} : { category };
    const videos = await WorkoutVideoModel.find(query);
    return videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      description: video.description || null,
      thumbnailUrl: video.thumbnailUrl || null,
      videoId: video.videoId,
      category: video.category,
      duration: video.duration || null
    }));
  }

  async getWorkoutVideo(id: string | ObjectId): Promise<WorkoutVideo | undefined> {
    const video = await WorkoutVideoModel.findById(this.normalizeId(id));
    return video && {
      id: video._id.toString(),
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
      id: newVideo._id.toString(),
      title: newVideo.title,
      description: newVideo.description || null,
      thumbnailUrl: newVideo.thumbnailUrl || null,
      videoId: newVideo.videoId,
      category: newVideo.category,
      duration: newVideo.duration || null
    };
  }

  // Calculation operations
  async getUserCalculations(userId: string | ObjectId, type?: string): Promise<UserCalculation[]> {
    const query: Record<string, any> = { userId: this.normalizeId(userId) };
    if (type) query.type = type;

    const calculations = await UserCalculationModel.find(query).sort({ date: -1 });

    return calculations.map(calc => ({
      id: calc._id.toString(),
      userId: calc.userId.toString(),
      type: calc.type,
      value: calc.value,
      date: calc.date,
      details: calc.details || null
    }));
  }

  async createUserCalculation(insertCalculation: InsertUserCalculation): Promise<UserCalculation> {
    const newCalc = await UserCalculationModel.create({
      ...insertCalculation,
      userId: this.normalizeId(insertCalculation.userId)
    });

    return {
      id: newCalc._id.toString(),
      userId: newCalc.userId.toString(),
      type: newCalc.type,
      value: newCalc.value,
      date: newCalc.date,
      details: newCalc.details || null
    };
  }

  // Chat operations
  async getChatHistory(userId: string | ObjectId): Promise<ChatHistory[]> {
    const history = await ChatHistoryModel.find({ userId: this.normalizeId(userId) }).sort({ timestamp: -1 });

    return history.map(chat => ({
      id: chat._id.toString(),
      userId: chat.userId.toString(),
      query: chat.query,
      response: chat.response,
      timestamp: chat.timestamp
    }));
  }

  async createChatHistory(insertChat: InsertChatHistory): Promise<ChatHistory> {
    const newChat = await ChatHistoryModel.create({
      ...insertChat,
      userId: this.normalizeId(insertChat.userId)
    });

    return {
      id: newChat._id.toString(),
      userId: newChat.userId.toString(),
      query: newChat.query,
      response: newChat.response,
      timestamp: newChat.timestamp
    };
  }

  // Seeder
  async seedWorkoutVideos() {
    const count = await WorkoutVideoModel.countDocuments();
    if (count > 0) return;

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
      }
    ];

    await WorkoutVideoModel.insertMany(initialVideos);
    console.log("✅ Seeded workout videos.");
  }
}
