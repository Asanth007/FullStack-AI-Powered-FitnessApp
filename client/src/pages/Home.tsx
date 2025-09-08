import { Element } from "react-scroll";
import HeroSection from "@/components/home/HeroSection";
import FeaturesOverview from "@/components/home/FeaturesOverview";
import BmiCalculator from "@/components/calculators/BmiCalculator";
import CalorieCalculator from "@/components/calculators/CalorieCalculator";
import BodyFatCalculator from "@/components/calculators/BodyFatCalculator";
import WorkoutVideos from "@/components/workouts/WorkoutVideos";
import AiChat from "@/components/ai-coach/AiChat";

interface HomeProps {
  isAuthenticated: boolean;
}

export default function Home({ isAuthenticated }: HomeProps) {
  return (
    <div>
      <HeroSection />
      <FeaturesOverview />
      
      {/* Calculators Section */}
      {/* <Element name="calculators">
        <section id="calculators" className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold heading text-center text-gray-900 dark:text-gray-100 mb-4">Fitness Calculators</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Use our accurate calculators to track your fitness metrics and set realistic goals for your journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BmiCalculator />
              <CalorieCalculator />
              <BodyFatCalculator />
            </div>
          </div>
        </section>
      </Element> */}
      
      {/* Workout Videos Section */}
      <Element name="workouts">
        <section id="workouts" className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold heading text-center text-gray-900 dark:text-gray-100 mb-4">Workout Videos</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-8">
              Follow along with our curated collection of effective workout videos targeting different muscle groups.
            </p>
            
            <WorkoutVideos limit={8} />
          </div>
        </section>
      </Element>
      
      {/* AI Coach Section */}
      {/* <Element name="chat">
        <section id="chat" className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold heading text-center text-gray-900 dark:text-gray-100 mb-4">AI Fitness Coach</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Get instant answers to your fitness questions from our AI coach powered by Gemini AI.
            </p>
            
            <AiChat isAuthenticated={isAuthenticated} />
          </div>
        </section>
      </Element> */}
    </div>
  );
}
