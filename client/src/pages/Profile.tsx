import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, BarChart2, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ProfileProps {
  user: any;
}

interface Calculation {
  id: number;
  type: string;
  value: string;
  date: string;
  details: string;
}

interface ChatMessage {
  id: number;
  query: string;
  response: string;
  timestamp: string;
}

export default function Profile({ user }: ProfileProps) {
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const { data: calculationData, isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/user/calculations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/calculations");
      if (!res.ok) throw new Error("Failed to fetch calculation history");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ["/api/chat/history"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat/history");
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (calculationData?.calculations) {
      setCalculations(calculationData.calculations);
    }
  }, [calculationData]);

  useEffect(() => {
    if (chatData?.history) {
      setChatHistory(chatData.history);
    }
  }, [chatData]);

  const getUserInitials = () => {
    if (!user || !user.name) return user?.username?.substring(0, 2).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getCalculationIcon = (type: string) => {
    switch (type) {
      case "bmi":
        return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">B</div>;
      case "calories":
        return <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">C</div>;
      case "bodyfat":
        return <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">F</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-3">?</div>;
    }
  };

  const getCalculationLabel = (type: string) => {
    switch (type) {
      case "bmi":
        return "BMI Calculation";
      case "calories":
        return "Calorie Calculation";
      case "bodyfat":
        return "Body Fat Calculation";
      default:
        return "Calculation";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16 bg-primary text-primary-foreground">
            <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user?.name || user?.username}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Member since {user?.createdAt ? formatDate(user.createdAt) : "recently"}
            </p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="mb-6">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Calculations History</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat History</span>
          </TabsTrigger>
        </TabsList>

        {/* Calculation History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Calculation History</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              {calculationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading your calculation history...</p>
                </div>
              ) : calculations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>You haven't made any calculations yet.</p>
                  <p className="mt-2">Try our calculators to track your progress!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {calculations.map((calculation) => {
                    const details = calculation.details ? JSON.parse(calculation.details) : {};
                    return (
                      <div key={calculation.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center mb-3">
                          {getCalculationIcon(calculation.type)}
                          <div>
                            <h4 className="font-medium">{getCalculationLabel(calculation.type)}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(calculation.date)}
                            </div>
                          </div>
                        </div>

                        <div className="ml-11">
                          <div className="text-xl font-semibold mb-1">
                            {calculation.type === "bmi" && `${calculation.value} (${details.category || ""})`}
                            {calculation.type === "calories" && `${calculation.value} calories`}
                            {calculation.type === "bodyfat" && `${calculation.value}% (${details.category || ""})`}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2">
                            {calculation.type === "bmi" && (
                              <>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Height:</span>{" "}
                                  <span className="font-medium">{details.height}cm</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Weight:</span>{" "}
                                  <span className="font-medium">{details.weight}kg</span>
                                </div>
                              </>
                            )}

                            {calculation.type === "calories" && details.macros && (
                              <>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Protein:</span>{" "}
                                  <span className="font-medium">{details.macros.protein}g</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Carbs:</span>{" "}
                                  <span className="font-medium">{details.macros.carbs}g</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Fats:</span>{" "}
                                  <span className="font-medium">{details.macros.fats}g</span>
                                </div>
                              </>
                            )}

                            {calculation.type === "bodyfat" && (
                              <>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Gender:</span>{" "}
                                  <span className="font-medium capitalize">{details.gender}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Height:</span>{" "}
                                  <span className="font-medium">{details.height}cm</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Weight:</span>{" "}
                                  <span className="font-medium">{details.weight}kg</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat History */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Your Chat History</CardTitle>
              <CardDescription>Previous conversations with the AI Coach</CardDescription>
            </CardHeader>
            <CardContent>
              {chatLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading your chat history...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>You haven't chatted with the AI coach yet.</p>
                  <p className="mt-2">Ask questions about fitness, nutrition, or workout routines!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0 mr-3">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium mb-1">You asked:</div>
                          <div className="text-gray-800 dark:text-gray-200">{chat.query}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(chat.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start pl-11">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium mb-1">AI Coach responded:</div>
                          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                            {chat.response}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
