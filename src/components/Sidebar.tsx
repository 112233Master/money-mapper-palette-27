
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  PiggyBank,
  Plus,
  Settings,
  Tags,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  collapsed: boolean;
  adminOnly?: boolean;
  isAdmin: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  title,
  path,
  collapsed,
  adminOnly = false,
  isAdmin,
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  if (adminOnly && !isAdmin) return null;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center py-2.5 px-3 rounded-md transition-all-200 group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        collapsed ? "justify-center" : ""
      )}
    >
      <div className="flex items-center justify-center w-6">
        {icon}
      </div>
      {!collapsed && <span className="ml-3 text-sm">{title}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, isAdmin } = useAuth();

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Finance App
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col space-y-1">
          <SidebarItem
            icon={<Home size={18} />}
            title="Dashboard"
            path="/"
            collapsed={collapsed}
            isAdmin={isAdmin}
          />
          <Separator className="my-2 bg-sidebar-border" />
          <p className={cn("text-xs text-sidebar-foreground/70 mb-1 mt-1", collapsed ? "sr-only" : "px-3")}>
            Transactions
          </p>
          <SidebarItem
            icon={<TrendingUp size={18} />}
            title="Add Deposit"
            path="/deposit"
            collapsed={collapsed}
            isAdmin={isAdmin}
          />
          <SidebarItem
            icon={<TrendingDown size={18} />}
            title="Add Withdrawal"
            path="/withdrawal"
            collapsed={collapsed}
            isAdmin={isAdmin}
          />
          <SidebarItem
            icon={<PiggyBank size={18} />}
            title="Add Petty Cash"
            path="/petty-cash"
            collapsed={collapsed}
            isAdmin={isAdmin}
          />
          <SidebarItem
            icon={<Tags size={18} />}
            title="Categories"
            path="/category"
            collapsed={collapsed}
            adminOnly={true}
            isAdmin={isAdmin}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            title="Reports"
            path="/reports"
            collapsed={collapsed}
            isAdmin={isAdmin}
          />
          <Separator className="my-2 bg-sidebar-border" />
          <SidebarItem
            icon={<Settings size={18} />}
            title="Settings"
            path="/settings"
            collapsed={collapsed}
            adminOnly={true}
            isAdmin={isAdmin}
          />
        </nav>
      </div>

      <div className="px-3 py-3">
        <button
          onClick={logout}
          className={cn(
            "flex items-center py-2.5 px-3 rounded-md w-full transition-all-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
