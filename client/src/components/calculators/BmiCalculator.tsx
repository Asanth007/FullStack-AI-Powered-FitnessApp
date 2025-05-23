import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bmiCalculatorSchema } from "@shared/schema";
import type { BmiCalculatorData } from "@shared/schema";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function BmiCalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  
  const form = useForm<BmiCalculatorData>({
    resolver: zodResolver(bmiCalculatorSchema),
    defaultValues: {
      height: undefined,
      weight: undefined
    }
  });
  
  async function onSubmit(data: BmiCalculatorData) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ai-fit-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/calculators/bmi", {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "BMI calculation failed");
      }
      
      setResult(result);
    } catch (error) {
      console.error("BMI calculation error:", error);
      toast({
        title: "Calculation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  function getProgressPercentage() {
    if (!result) return 0;
    
    // Set indicator position (0-100%)
    if (result.category === "underweight") {
      return Math.max(5, Math.min(25, ((result.bmi - 16) / (18.5 - 16)) * 25));
    } else if (result.category === "normal") {
      return 25 + ((result.bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (result.category === "overweight") {
      return 50 + ((result.bmi - 25) / (30 - 25)) * 25;
    } else {
      return 75 + Math.min(((result.bmi - 30) / 10) * 25, 25);
    }
  }
  
  return (
    <Card className="calculator-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <CardHeader className="bg-primary text-white p-4">
        <CardTitle className="text-xl">BMI Calculator</CardTitle>
        <p className="text-white/80 text-sm">Measure your Body Mass Index</p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate BMI"}
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Your BMI:</span>
              <span className="text-xl font-semibold">{result.bmi}</span>
            </div>
            
            <Progress value={getProgressPercentage()} className="h-3 mb-3" />
            
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            
            <p className="mt-4 text-gray-800 dark:text-gray-300 text-sm">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
