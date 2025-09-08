import dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from "express";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Generate response from Gemini AI model
export const generateAiResponse = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Validate incoming request
    const parsedData = chatRequestSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parsedData.error.errors 
      });
    }

    const { message } = parsedData.data;

    // Add fitness context to the user's prompt
    const prompt = `
      You are a helpful and knowledgeable AI fitness coach.
      Respond to the following question with useful advice related to fitness, diet, or exercise.
      If the question is unrelated, politely guide the user back to fitness topics.

      Question: ${message}
    `;

    console.log("Calling Gemini API...");

    try {
      // Updated model name to a valid one
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      if (!response || response.trim() === "") {
        throw new Error("Empty text response from Gemini API");
      }
let chatRecord ;
      
if (user) {
  chatRecord = await storage.createChatHistory({
    userId: user.id,
    query: message,
    response
  });
}

return res.status(200).json({ response, chatRecord });
    } catch (apiError: any) {
      console.error("Gemini API error:", apiError?.message || apiError);

      return res.status(200).json({
        response: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking your fitness question again in a moment.",
        apiError: true
      });
    }

  } catch (error: any) {
    console.error("Error in AI response:", error.message || error);
    return res.status(500).json({
      message: "Failed to generate response",
      error: error.message || "Unknown error"
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
    console.log("📄 Retrieved history:", history);
    return res.status(200).json({ history });
  } catch (error: any) {
    console.error("Get chat history error:", error.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};
