import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymDB';

// MongoDB connection
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas and models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
   resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null }
});

const WorkoutVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  videoId: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String }
});

const UserCalculationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // "bmi", "calories", "bodyfat"
  value: { type: String, required: true },
  date: { type: Date, default: Date.now },
  details: { type: String } // JSON stringified additional data
});

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create models
export const UserModel = mongoose.model('User', UserSchema);
export const WorkoutVideoModel = mongoose.model('WorkoutVideo', WorkoutVideoSchema);
export const UserCalculationModel = mongoose.model('UserCalculation', UserCalculationSchema);
export const ChatHistoryModel = mongoose.model('ChatHistory', ChatHistorySchema);