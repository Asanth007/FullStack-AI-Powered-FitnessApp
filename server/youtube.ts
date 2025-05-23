import { Request, Response } from "express";
import { storage } from "./storage";

// This file handles the workout videos
// In a real implementation, this would connect to the YouTube API
// For this example, we'll use the pre-seeded videos

// Get all workout videos or filter by category
export const getWorkoutVideos = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let videos;
    if (category && typeof category === 'string') {
      videos = await storage.getWorkoutVideosByCategory(category);
    } else {
      videos = await storage.getWorkoutVideos();
    }
    
    return res.status(200).json({ videos });
  } catch (error) {
    console.error("Get workout videos error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single workout video by ID
export const getWorkoutVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getWorkoutVideo(parseInt(id));
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    return res.status(200).json({ video });
  } catch (error) {
    console.error("Get workout video error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// The following would be implemented with a real YouTube API integration
// But for now, we'll use our pre-seeded data

// Example of how YouTube API integration would be structured
// using the saved video IDs to fetch details from YouTube

/*
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export const searchYouTubeVideos = async (req: Request, res: Response) => {
  try {
    const { query, maxResults = 10 } = req.query;
    
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query as string,
      maxResults: maxResults as number,
      type: ['video'],
      videoEmbeddable: 'true',
      videoDuration: 'medium'
    });
    
    return res.status(200).json({ videos: response.data.items });
  } catch (error) {
    console.error("YouTube search error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
*/
