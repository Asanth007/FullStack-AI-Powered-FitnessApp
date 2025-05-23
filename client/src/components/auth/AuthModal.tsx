import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useEffect, useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
  onSwitchType: (type: "login" | "register") => void;
  onSuccess: (userData: any, token: string) => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  type, 
  onSwitchType, 
  onSuccess 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>(type);
  
  useEffect(() => {
    setActiveTab(type);
  }, [type]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSwitchType(value as "login" | "register");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            {activeTab === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSuccess={onSuccess} />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
