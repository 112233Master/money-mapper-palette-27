
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "user";

interface User {
  id: number;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // In a real application, this would communicate with your backend
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get stored users from localStorage
      const usersString = localStorage.getItem("users");
      const users = usersString ? JSON.parse(usersString) : [
        { id: 1, username: "admin", role: "admin" },
        { id: 2, username: "user", role: "user" }
      ];
      
      // If first login with no users stored yet, save the default users
      if (!usersString) {
        localStorage.setItem("users", JSON.stringify(users));
        
        // Also store default credentials
        if (!localStorage.getItem("userCredentials")) {
          const defaultCredentials = {
            "admin": "admin123",
            "user": "user123"
          };
          localStorage.setItem("userCredentials", JSON.stringify(defaultCredentials));
        }
      }

      // Get credentials
      const credentialsString = localStorage.getItem("userCredentials");
      const credentials = credentialsString 
        ? JSON.parse(credentialsString) 
        : { "admin": "admin123", "user": "user123" };
      
      // Check login
      if (credentials[username.toLowerCase()] === password) {
        // Find the user in our users array
        const foundUser = users.find((u: User) => 
          u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem("user", JSON.stringify(foundUser));
          toast.success(`Welcome back, ${foundUser.username}!`);
          navigate("/");
        } else {
          toast.error("User account issue. Please contact administrator.");
        }
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
