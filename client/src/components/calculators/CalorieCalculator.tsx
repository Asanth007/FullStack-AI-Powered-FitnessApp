import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calorieCalculatorSchema } from "@shared/schema";
import type { CalorieCalculatorData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CalorieCalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  } | null>(null);
  const { toast } = useToast();
  
  const form = useForm<CalorieCalculatorData>({
    resolver: zodResolver(calorieCalculatorSchema),
    defaultValues: {
      gender: "male",
      age: undefined,
      height: undefined,
      weight: undefined,
      activityLevel: 1.55,
      goal: "maintain"
    }
  });
  
  async function onSubmit(data: CalorieCalculatorData) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ai-fit-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/calculators/calories", {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Calorie calculation failed");
      }
      
      setResult(result);
    } catch (error) {
      console.error("Calorie calculation error:", error);
      toast({
        title: "Calculation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className="calculator-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <CardHeader className="bg-primary text-white p-4">
        <CardTitle className="text-xl">Calorie Calculator</CardTitle>
        <p className="text-white/80 text-sm">Estimate your daily calorie needs</p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female">Female</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter age" 
                      type="number" 
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter height" 
                      type="number" 
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter weight" 
                      type="number" 
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseFloat(value))}
                    defaultValue={field.value.toString()}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1.2">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="1.375">Lightly active (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="1.55">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="1.725">Very active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="1.9">Extra active (very hard exercise & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain weight</SelectItem>
                      <SelectItem value="gain">Gain weight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate Calories"}
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center mb-3">
              <span className="text-gray-600 dark:text-gray-400">Daily Calorie Needs:</span>
              <div className="text-2xl font-bold text-primary">{result.calories.toLocaleString()}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="font-medium text-primary">Protein</div>
                <div>{result.macros.protein}g</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="font-medium text-primary">Carbs</div>
                <div>{result.macros.carbs}g</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="font-medium text-primary">Fats</div>
                <div>{result.macros.fats}g</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
