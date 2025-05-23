import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import { useToast } from "@/hooks/use-toast";

interface WorkoutVideo {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
  category: string;
  duration: string;
}

interface WorkoutVideoProps {
  limit?: number;
}

export default function WorkoutVideos({ limit }: WorkoutVideoProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<WorkoutVideo | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(limit || 8);
  const { toast } = useToast();
  
  const { data: videos, isLoading, error } = useQuery<{ videos: WorkoutVideo[] }>({
    queryKey: ["/api/videos"],
  });
  
  const filteredVideos = videos?.videos.filter(video => 
    selectedCategory === "all" || video.category === selectedCategory
  ) || [];
  
  const displayedVideos = filteredVideos.slice(0, displayLimit);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleVideoClick = (video: WorkoutVideo) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };
  
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 4);
  };
  
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load workout videos",
      variant: "destructive"
    });
  }
  
  const categories = [
    { id: "all", label: "All Workouts" },
    { id: "arms", label: "Arms" },
    { id: "legs", label: "Legs" },
    { id: "core", label: "Core" },
    { id: "cardio", label: "Cardio" },
    { id: "fullbody", label: "Full Body" },
  ];
  
  return (
    <div>
      {/* Workout Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>
      
      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
          
          {displayedVideos.length < filteredVideos.length && (
            <div className="text-center mt-10">
              <Button onClick={handleLoadMore}>
                Load More Videos
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Video Modal */}
      <VideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        video={selectedVideo}
      />
    </div>
  );
}
