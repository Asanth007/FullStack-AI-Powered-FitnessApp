import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Workouts from "./pages/WorkoutPage";
import Chatbot from "./pages/AiCoachPage";
import { useState, useEffect } from "react";
import ForgotPassword from "./components/auth/ForgotPassword";
//import { Routes, Route } from "react-router-dom";
import Calculators from "@/pages/Calculators";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("ai-fit-token");
    
    if (token) {
      // Fetch user data
      fetch("/api/auth/user", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Authentication failed");
      })
      .then(data => {
        setUser(data.user);
        setIsAuthenticated(true);
      })
      .catch(err => {
        console.error("Auth error:", err);
        localStorage.removeItem("ai-fit-token");
        setIsAuthenticated(false);
        setUser(null);
      });
    }
  }, []);

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem("ai-fit-token", token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("ai-fit-token");
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  };

  return (
    <TooltipProvider>
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main>
        <Switch>
          <Route path="/" component={() => <Home isAuthenticated={isAuthenticated} />} />
          <Route path="/profile" component={() => (
            isAuthenticated ? <Profile user={user} /> : <NotFound />
          )} />
           <Route path="/calculators" component={Calculators} />
           <Route path="/workouts" component={Workouts} />
           <Route path="/chatbot" component={() => <Chatbot isAuthenticated={isAuthenticated} />}  />
           <Route path="/forgot-password" component={ForgotPassword} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
