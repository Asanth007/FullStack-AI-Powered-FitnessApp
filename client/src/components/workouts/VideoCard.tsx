import { PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WorkoutVideo {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
  category: string;
  duration: string;
}

interface VideoCardProps {
  video: WorkoutVideo;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case "arms": return "Arms";
      case "legs": return "Legs";
      case "core": return "Core";
      case "cardio": return "Cardio";
      case "fullbody": return "Full Body";
      default: return category;
    }
  };
  
  return (
    <Card className="video-card rounded-lg overflow-hidden shadow-md cursor-pointer" onClick={onClick}>
      <div className="aspect-video relative">
        <img 
          src={`${video.thumbnailUrl}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity hover:bg-black/40">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
            <PlayCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1 text-gray-900 dark:text-gray-100">{video.title}</h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {video.duration}
          </span>
          <span className="mx-2">•</span>
          <span className="text-primary">{getCategoryLabel(video.category)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
