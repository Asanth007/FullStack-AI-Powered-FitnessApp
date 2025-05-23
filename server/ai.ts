import { Request, Response } from "express";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key - using the provided key directly
const GEMINI_API_KEY = "AIzaSyBHltdYWW_aJ7Rs5BfAQJ2Ni6ajf_0CnS4";

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
    
    console.log("Sending request to Gemini API with key:", GEMINI_API_KEY.substring(0, 10) + "...");
    
    // Call Gemini API with proper error handling
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error("Empty response from Gemini API");
      }
      
      const response = result.response.text();
      
      if (!response || response.trim() === "") {
        throw new Error("Empty text response from Gemini API");
      }
      
      // Save to chat history if user is authenticated
      if (user) {
        await storage.createChatHistory({
          userId: user.id,
          query: message,
          response
        });
      }
      
      return res.status(200).json({ response });
    } catch (apiError) {
      console.error("Gemini API specific error:", apiError);
      
      // Provide a fallback response in case of API failure
      const fallbackResponse = "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking your fitness question again in a moment.";
      
      return res.status(200).json({ 
        response: fallbackResponse,
        apiError: true
      });
    }
  } catch (error) {
    console.error("General error in AI response generation:", error);
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
