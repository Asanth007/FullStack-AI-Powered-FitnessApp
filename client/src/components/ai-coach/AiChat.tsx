import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, User } from "lucide-react";

interface ChatMessage {
  type: "user" | "bot";
  content: string;
}

interface AiChatProps {
  isAuthenticated: boolean;
}

export default function AiChat({ isAuthenticated }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "bot",
      content: "Welcome to AI-Fit! I'm your AI fitness coach. You can ask me questions about workouts, nutrition, fitness goals, or anything related to your health journey."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch chat history if user is authenticated
  const { data: historyData } = useQuery({
    queryKey: ["/api/chat/history"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // If history is available, add it to messages
    if (historyData?.history && historyData.history.length > 0) {
      const historyMessages = historyData.history.slice(0, 5).map((item: any) => [
        { type: "user", content: item.query },
        { type: "bot", content: item.response }
      ]).flat();
      
      setMessages([messages[0], ...historyMessages]);
    }
  }, [historyData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { type: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("ai-fit-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await apiRequest("POST", "/api/chat", { message: input });
      const data = await response.json();

      // Add bot response after a small delay to simulate typing
      setTimeout(() => {
        setMessages(prev => [...prev, { type: "bot", content: data.response }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI coach",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <CardHeader className="bg-primary text-white p-4 flex flex-row items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl">AI Fitness Coach</CardTitle>
          <p className="text-white/80 text-sm">Powered by Gemini AI</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="chat-container h-[500px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4" id="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div className={`rounded-lg p-3 chat-message ${
                  message.type === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="whitespace-pre-line">{message.content}</div>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0 ml-3">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 chat-message">
                  <p className="text-gray-900 dark:text-gray-100 flex items-center">
                    <span className="mr-2">Thinking</span>
                    <span className="flex">
                      <span className="animate-bounce mx-0.5 delay-75">.</span>
                      <span className="animate-bounce mx-0.5 delay-150">.</span>
                      <span className="animate-bounce mx-0.5 delay-300">.</span>
                    </span>
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex">
              <Input
                type="text"
                placeholder="Ask me anything about fitness..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-r-none"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                className="rounded-l-none"
                disabled={isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Powered by Gemini AI. Responses are AI-generated and may require verification with healthcare professionals.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
