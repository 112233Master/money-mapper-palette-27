
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface AppSettings {
  appName: string;
  logo: string | null;
}

const Settings: React.FC = () => {
  const { isAdmin } = useAuth();
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem("appSettings");
    return stored 
      ? JSON.parse(stored) 
      : { appName: "Financial Dashboard", logo: null };
  });
  
  const [appName, setAppName] = useState(settings.appName);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newSettings = {
      appName,
      logo: logoPreview,
    };
    
    setSettings(newSettings);
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
    toast.success("Settings saved successfully");
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Settings" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-md mx-auto animate-fade-up">
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Customize your financial dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter application name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="border rounded-md p-2 w-16 h-16 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer border rounded-md flex items-center justify-center p-4 hover:bg-muted transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      <span>{logoPreview ? "Change Logo" : "Upload Logo"}</span>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="ml-auto">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Settings;
