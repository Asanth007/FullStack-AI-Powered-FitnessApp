import { Button } from "@/components/ui/button";
import { Link as ScrollLink } from "react-scroll";

export default function HeroSection() {
  return (
    <section className="relative bg-primary text-white">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div 
        className="relative bg-cover bg-center h-[500px]" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')" 
        }}
      ></div>
      
      <div className="container mx-auto px-4 absolute inset-0 flex items-center z-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold heading mb-4">Transform Your Fitness Journey with AI</h1>
          <p className="text-lg md:text-xl mb-8">Track your progress, calculate your needs, and get personalized advice from our AI coach.</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <ScrollLink to="workouts" smooth={true} duration={500} offset={-100}>
              
              <Button variant="secondary" size="lg" className="px-6 py-6 h-auto text-base">
                Get Started
              </Button>
              
            </ScrollLink>
            {/* <ScrollLink to="calculators" smooth={true} duration={500} offset={-100}>
              <Button variant="outline" size="lg" className="px-6 py-6 h-auto text-base bg-white text-primary hover:bg-gray-100">
                Try Calculators
              </Button>
            </ScrollLink> */}
          </div>
        </div>
      </div>
    </section>
  );
}
