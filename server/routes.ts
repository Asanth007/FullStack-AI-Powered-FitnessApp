import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  bmiCalculatorSchema, 
  calorieCalculatorSchema, 
  bodyFatCalculatorSchema 
} from "@shared/schema";
import { login, register, getCurrentUser, authenticate } from "./auth";
import { getWorkoutVideos, getWorkoutVideo } from "./youtube";
import { generateAiResponse, getChatHistory } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize workout videos in MongoDB
  if ('seedWorkoutVideos' in storage) {
    await (storage as any).seedWorkoutVideos();
  }
  // Authentication routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.get("/api/auth/user", authenticate, getCurrentUser);
  
  // Calculator routes
  app.post("/api/calculators/bmi", async (req, res) => {
    try {
      const parseResult = bmiCalculatorSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.errors 
        });
      }
      
      const { height, weight } = parseResult.data;
      
      // Calculate BMI: weight (kg) / height² (m²)
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      const roundedBmi = parseFloat(bmi.toFixed(1));
      
      // Determine BMI category
      let category = "";
      if (bmi < 18.5) {
        category = "underweight";
      } else if (bmi < 25) {
        category = "normal";
      } else if (bmi < 30) {
        category = "overweight";
      } else {
        category = "obese";
      }
      
      // Save calculation if user is authenticated
      const user = (req as any).user;
      if (user) {
        await storage.createUserCalculation({
          userId: user.id,
          type: "bmi",
          value: roundedBmi.toString(),
          details: JSON.stringify({ height, weight, category })
        });
      }
      
      return res.status(200).json({ 
        bmi: roundedBmi, 
        category,
        message: getBmiMessage(category)
      });
    } catch (error) {
      console.error("BMI calculation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/calculators/calories", async (req, res) => {
    try {
      const parseResult = calorieCalculatorSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.errors 
        });
      }
      
      const { gender, age, height, weight, activityLevel, goal } = parseResult.data;
      
      // Calculate BMR (Mifflin-St Jeor equation)
      let bmr = 0;
      if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = bmr * activityLevel;
      
      // Adjust based on goal
      let calories = tdee;
      if (goal === "lose") {
        calories = tdee - 500; // Deficit for weight loss
      } else if (goal === "gain") {
        calories = tdee + 500; // Surplus for weight gain
      }
      
      // Calculate macros (approximate)
      // Protein: 2g per kg of bodyweight
      const protein = weight * 2;
      // Fat: 25% of calories (9 cal/g)
      const fats = (calories * 0.25) / 9;
      // Carbs: remaining calories (4 cal/g)
      const carbs = (calories - (protein * 4) - (fats * 9)) / 4;
      
      const result = {
        calories: Math.round(calories),
        macros: {
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fats: Math.round(fats)
        }
      };
      
      // Save calculation if user is authenticated
      const user = (req as any).user;
      if (user) {
        await storage.createUserCalculation({
          userId: user.id,
          type: "calories",
          value: result.calories.toString(),
          details: JSON.stringify(result)
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Calorie calculation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/calculators/bodyfat", async (req, res) => {
    try {
      const parseResult = bodyFatCalculatorSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.errors 
        });
      }
      
      const { gender, height, weight, neck, waist, hip } = parseResult.data;
      
      // U.S. Navy Method for body fat calculation
      let bodyFat = 0;
      
      if (gender === "male") {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        if (!hip) {
          return res.status(400).json({ message: "Hip measurement is required for females" });
        }
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      
      // Ensure result is within reasonable range
      bodyFat = Math.max(3, Math.min(45, bodyFat));
      
      // Determine category
      let category = "";
      const roundedBodyFat = parseFloat(bodyFat.toFixed(1));
      
      if (gender === "male") {
        if (bodyFat < 6) category = "essential";
        else if (bodyFat < 14) category = "athletic";
        else if (bodyFat < 25) category = "fitness";
        else category = "average";
      } else {
        if (bodyFat < 16) category = "essential";
        else if (bodyFat < 24) category = "athletic";
        else if (bodyFat < 32) category = "fitness";
        else category = "average";
      }
      
      // Save calculation if user is authenticated
      const user = (req as any).user;
      if (user) {
        await storage.createUserCalculation({
          userId: user.id,
          type: "bodyfat",
          value: roundedBodyFat.toString(),
          details: JSON.stringify({ gender, height, weight, neck, waist, hip, category })
        });
      }
      
      return res.status(200).json({
        bodyFat: roundedBodyFat,
        category,
        message: getBodyFatMessage(category)
      });
    } catch (error) {
      console.error("Body fat calculation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Workout video routes
  app.get("/api/videos", getWorkoutVideos);
  app.get("/api/videos/:id", getWorkoutVideo);
  
  // AI chatbot routes
  app.post("/api/chat", generateAiResponse);
  app.get("/api/chat/history", authenticate, getChatHistory);
  
  // User calculation history (requires authentication)
  app.get("/api/user/calculations", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { type } = req.query;
      
      const calculations = await storage.getUserCalculations(
        user.id, 
        typeof type === 'string' ? type : undefined
      );
      
      return res.status(200).json({ calculations });
    } catch (error) {
      console.error("Get user calculations error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for response messages
function getBmiMessage(category: string): string {
  switch (category) {
    case "underweight":
      return "Your BMI indicates that you are underweight. Consider consulting with a nutritionist.";
    case "normal":
      return "Your BMI indicates that you have a normal weight. Maintain your healthy lifestyle!";
    case "overweight":
      return "Your BMI indicates that you are overweight. Consider increasing physical activity.";
    case "obese":
      return "Your BMI indicates obesity. It is recommended to consult with a healthcare professional.";
    default:
      return "Invalid BMI category.";
  }
}

function getBodyFatMessage(category: string): string {
  switch (category) {
    case "essential":
      return "You are in the essential fat range. This is the minimum needed for basic health.";
    case "athletic":
      return "You're in the athletic range, which is ideal for athletes and fitness models.";
    case "fitness":
      return "You're in the fitness range, which is associated with good health.";
    case "average":
      return "You're in the average range. Reducing body fat may improve health markers.";
    default:
      return "Invalid body fat category.";
  }
}
