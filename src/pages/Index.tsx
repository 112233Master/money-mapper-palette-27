
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

interface AppSettings {
  appName: string;
  logo: string | null;
}

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
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

  // Update page title when settings change
  useEffect(() => {
    document.title = settings.appName;
  }, [settings.appName]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={settings.appName} />
        <main className="flex-1 overflow-y-auto p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Index;
