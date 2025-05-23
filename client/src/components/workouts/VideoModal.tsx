import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface WorkoutVideo {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
  category: string;
  duration: string;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: WorkoutVideo | null;
}

export default function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      setVideoLoaded(false);
    }
  }, [isOpen]);
  
  if (!video) return null;
  
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden max-h-[95vh] flex flex-col">
        <DialogHeader className="p-4 flex items-center justify-between border-b">
          <DialogTitle className="text-xl">{video.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="aspect-video bg-black w-full relative">
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <span>Loading video...</span>
              </div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => setVideoLoaded(true)}
            style={{ display: videoLoaded ? 'block' : 'block' }}
          ></iframe>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
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
          <p className="text-gray-800 dark:text-gray-300 text-sm">{video.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
