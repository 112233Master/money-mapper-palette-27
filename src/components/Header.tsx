
import React, { useEffect, useState } from "react";
import { Bell, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  title?: string;
}

interface AppSettings {
  appName: string;
  logo: string | null;
}

const Header: React.FC<HeaderProps> = ({ title = "Dashboard" }) => {
  const { user, logout, isAdmin } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem("appSettings");
    return stored 
      ? JSON.parse(stored) 
      : { appName: "Financial Dashboard", logo: null };
  });

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("appSettings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check for settings on component mount
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center">
        {settings.logo ? (
          <img 
            src={settings.logo} 
            alt="Logo" 
            className="h-7 w-7 mr-2 object-contain" 
          />
        ) : (
          <LayoutDashboard className="h-5 w-5 text-primary mr-2" />
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell size={18} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Administrator" : "Regular User"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
