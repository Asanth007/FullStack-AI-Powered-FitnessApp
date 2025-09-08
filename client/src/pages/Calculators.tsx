import BmiCalculator from "@/components/calculators/BmiCalculator";
import CalorieCalculator from "@/components/calculators/CalorieCalculator";
import BodyFatCalculator from "@/components/calculators/BodyFatCalculator";

export default function Calculators() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
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
  );
}
