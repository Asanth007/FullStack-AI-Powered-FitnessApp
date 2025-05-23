import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT Secret should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "ai-fit-secret-key";

// Generate JWT token
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    const parsedData = loginSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parsedData.error.errors 
      });
    }
    
    const { email, password } = parsedData.data;
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Return user data and token
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Register handler
export const register = async (req: Request, res: Response) => {
  try {
    const parsedData = registerSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parsedData.error.errors 
      });
    }
    
    const { username, email, password, name } = parsedData.data;
    
    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      name
    });
    
    // Generate token
    const token = generateToken(newUser.id);
    
    // Return user data and token
    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get current user handler
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
