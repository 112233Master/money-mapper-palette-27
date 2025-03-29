
import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeToggle from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  LogOut,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Tag,
  FileBarChart,
  Settings,
  Users,
  Database
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const { isMobile, setIsSidebarOpen } = useIsMobile();

  // Define navigation items
  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/deposit", label: "Deposit", icon: <ArrowUpCircle className="h-5 w-5" /> },
    { path: "/withdrawal", label: "Withdrawal", icon: <ArrowDownCircle className="h-5 w-5" /> },
    { path: "/petty-cash", label: "Petty Cash", icon: <Wallet className="h-5 w-5" /> },
    { path: "/category", label: "Categories", icon: <Tag className="h-5 w-5" /> },
    { path: "/reports", label: "Reports", icon: <FileBarChart className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { path: "/mongodb-setup", label: "MongoDB Setup", icon: <Database className="h-5 w-5" /> },
  ];

  // Admin-only pages
  if (isAdmin) {
    navItems.push({ path: "/users", label: "Users", icon: <Users className="h-5 w-5" /> });
  }

  const handleClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col border-r bg-card">
      <div className="p-4">
        <h2 className="text-xl font-bold">Money Mapper</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              onClick={handleClick}
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 mt-auto border-t">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={logout} 
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
