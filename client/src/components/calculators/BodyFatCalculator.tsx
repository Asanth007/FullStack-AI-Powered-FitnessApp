import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bodyFatCalculatorSchema } from "@shared/schema";
import type { BodyFatCalculatorData } from "@shared/schema";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function BodyFatCalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [showHip, setShowHip] = useState(false);
  const [result, setResult] = useState<{
    bodyFat: number;
    category: string;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  
  const form = useForm<BodyFatCalculatorData>({
    resolver: zodResolver(bodyFatCalculatorSchema),
    defaultValues: {
      gender: "male",
      age: undefined,
      height: undefined,
      weight: undefined,
      neck: undefined,
      waist: undefined,
      hip: undefined
    }
  });
  
  const gender = form.watch("gender");
  
  useEffect(() => {
    setShowHip(gender === "female");
  }, [gender]);
  
  async function onSubmit(data: BodyFatCalculatorData) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ai-fit-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/calculators/bodyfat", {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Body fat calculation failed");
      }
      
      setResult(result);
    } catch (error) {
      console.error("Body fat calculation error:", error);
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
    
    // Set indicator position based on gender and category
    if (gender === "male") {
      if (result.category === "essential") {
        return Math.max(5, Math.min(25, (result.bodyFat / 6) * 25));
      } else if (result.category === "athletic") {
        return 25 + ((result.bodyFat - 6) / 8) * 25;
      } else if (result.category === "fitness") {
        return 50 + ((result.bodyFat - 14) / 11) * 25;
      } else {
        return 75 + Math.min(((result.bodyFat - 25) / 15) * 25, 25);
      }
    } else {
      if (result.category === "essential") {
        return Math.max(5, Math.min(25, (result.bodyFat / 16) * 25));
      } else if (result.category === "athletic") {
        return 25 + ((result.bodyFat - 16) / 8) * 25;
      } else if (result.category === "fitness") {
        return 50 + ((result.bodyFat - 24) / 8) * 25;
      } else {
        return 75 + Math.min(((result.bodyFat - 32) / 13) * 25, 25);
      }
    }
  }
  
  return (
    <Card className="calculator-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <CardHeader className="bg-primary text-white p-4">
        <CardTitle className="text-xl">Body Fat Calculator</CardTitle>
        <p className="text-white/80 text-sm">Estimate your body fat percentage</p>
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
                        <RadioGroupItem value="male" id="bf-male" />
                        <label htmlFor="bf-male">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="bf-female" />
                        <label htmlFor="bf-female">Female</label>
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
              name="neck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neck (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Neck circumference" 
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
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Waist circumference" 
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
            
            {showHip && (
              <FormField
                control={form.control}
                name="hip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hip (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Hip circumference" 
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
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate Body Fat"}
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Body Fat Percentage:</span>
              <span className="text-xl font-semibold">{result.bodyFat}%</span>
            </div>
            
            <Progress value={getProgressPercentage()} className="h-3 mb-3" />
            
            <div className="grid grid-cols-4 text-xs text-gray-600 dark:text-gray-400 text-center gap-1 mb-3">
              <div>Essential</div>
              <div>Athletic</div>
              <div>Fitness</div>
              <div>Average</div>
            </div>
            
            <p className="text-gray-800 dark:text-gray-300 text-sm">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
