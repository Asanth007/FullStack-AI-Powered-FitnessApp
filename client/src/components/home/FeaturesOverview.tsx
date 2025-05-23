import { Calculator, Video, Bot } from "lucide-react";

export default function FeaturesOverview() {
  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-primary" />,
      title: "Smart Calculators",
      description: "Calculate your BMI, calorie needs, and body fat percentage with our advanced tools."
    },
    {
      icon: <Video className="h-8 w-8 text-secondary" />,
      title: "Workout Videos",
      description: "Access a curated collection of workout videos targeting different muscle groups."
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI Coach",
      description: "Get personalized advice and answers to your fitness questions from our AI assistant."
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold heading text-center text-gray-900 dark:text-gray-100 mb-12">Your Complete Fitness Solution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 heading text-gray-900 dark:text-gray-100">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
