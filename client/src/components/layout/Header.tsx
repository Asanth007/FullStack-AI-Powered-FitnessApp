import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthModal from "@/components/auth/AuthModal";

interface HeaderProps {
  isAuthenticated: boolean;
  user: any;
  onLogin: (userData: any, token: string) => void;
  onLogout: () => void;
}

export default function Header({ isAuthenticated, user, onLogin, onLogout }: HeaderProps) {
  const [location] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");

  const handleOpenLogin = () => {
    setAuthType("login");
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthType("register");
    setAuthModalOpen(true);
  };

  const handleAuthComplete = (userData: any, token: string) => {
    onLogin(userData, token);
    setAuthModalOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { href: "/calculators", label: "Calculators" },
    { href: "/workouts", label: "Workouts" },
    { href: "/chatbot", label: "AI Coach" },
    { href: "/profile", label: "Profile", authRequired: true },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-2xl font-bold heading">
              <span className="text-primary">AI-</span>
              <span className="text-secondary">Fit</span>
            </a>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            (!item.authRequired || isAuthenticated) && (
              <Link key={item.href} href={item.href}>
                <a className={`text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition ${location === item.href ? 'text-primary' : ''}`}>
                  {item.label}
                </a>
              </Link>
            )
          ))}
        </nav>

        {/* Auth buttons or user menu */}
        {isAuthenticated ? (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 bg-primary text-white">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-800 dark:text-gray-200 font-medium hidden sm:inline-block">
                    {user?.name || user?.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleOpenLogin}>
              Login
            </Button>
            <Button onClick={handleOpenRegister}>
              Sign Up
            </Button>
          </div>
        )}

        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="py-4">
              <Link href="/">
                <a className="text-2xl font-bold heading mb-6 block">
                  <span className="text-primary">AI-</span>
                  <span className="text-secondary">Fit</span>
                </a>
              </Link>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  (!item.authRequired || isAuthenticated) && (
                    <Link key={item.href} href={item.href}>
                      <a className={`text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition py-2 ${location === item.href ? 'text-primary' : ''}`}>
                        {item.label}
                      </a>
                    </Link>
                  )
                ))}
                
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-2">
                    <Button variant="outline" onClick={handleOpenLogin} className="w-full">
                      Login
                    </Button>
                    <Button onClick={handleOpenRegister} className="w-full">
                      Sign Up
                    </Button>
                  </div>
                ) : (
                  <Button onClick={onLogout} variant="destructive" className="mt-4">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        type={authType}
        onSwitchType={(type) => setAuthType(type)}
        onSuccess={handleAuthComplete}
      />
    </header>
  );
}
