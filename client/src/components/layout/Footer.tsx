import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would send the email to a server
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter.",
      variant: "default"
    });
    
    setEmail("");
  };
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 heading">
              <span className="text-primary">AI-</span>
              <span className="text-secondary">Fit</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Your personal fitness companion powered by artificial intelligence. Calculate, track, and achieve your fitness goals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#calculators">
                  <a className="text-gray-400 hover:text-white transition">Calculators</a>
                </Link>
              </li>
              <li>
                <Link href="/#workouts">
                  <a className="text-gray-400 hover:text-white transition">Workout Videos</a>
                </Link>
              </li>
              <li>
                <Link href="/#chat">
                  <a className="text-gray-400 hover:text-white transition">AI Coach</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-gray-400 hover:text-white transition">Blog</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help">
                  <a className="text-gray-400 hover:text-white transition">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white transition">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white transition">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white transition">Terms of Service</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact US</h4>
            <p className="text-gray-400 mb-4">
              Through Our Phone Number
            </p>
            {/* <form onSubmit={handleSubscribe} className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-r-none text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" className="rounded-l-none">
                <Send className="h-4 w-4" />
              </Button>
            </form> */}
            <h4>+91 9740189139</h4>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AI-Fit. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
            </Link>
            <Link href="/cookies">
              <a className="text-gray-400 hover:text-white text-sm transition">Cookies</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
