import { Request, Response } from "express";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBHltdYWW_aJ7Rs5BfAQJ2Ni6ajf_0CnS4";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Generate response from Gemini AI model
export const generateAiResponse = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Validate request
    const parsedData = chatRequestSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parsedData.error.errors 
      });
    }
    
    const { message } = parsedData.data;
    
    // Add fitness context to the user prompt
    const prompt = `
      As an AI fitness coach, I want to provide helpful, accurate fitness advice.
      
      User question: ${message}
      
      Provide a detailed, helpful response about fitness, nutrition, or exercise. If the question is not related to fitness, politely redirect to fitness topics.
    `;
    
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Save to chat history if user is authenticated
    if (user) {
      await storage.createChatHistory({
        userId: user.id,
        query: message,
        response
      });
    }
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ 
      message: "Failed to generate response", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get chat history for authenticated user
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const history = await storage.getChatHistory(user.id);
    
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get chat history error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
