
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as mongoDbService from '../services/mongoDb';

type UserRole = "admin" | "user";

interface UserPermission {
  viewTransactions: boolean;
  addTransactions: boolean;
  editTransactions: boolean;
  deleteTransactions: boolean;
  manageCategories: boolean;
  manageUsers: boolean;
}

interface User {
  id: number;
  username: string;
  role: UserRole;
  permissions: UserPermission;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof UserPermission) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_COLLECTION = 'users';
const CREDENTIALS_COLLECTION = 'credentials';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // If the stored user doesn't have permissions, add default ones
        if (!parsedUser.permissions) {
          parsedUser.permissions = parsedUser.role === "admin" 
            ? {
                viewTransactions: true,
                addTransactions: true,
                editTransactions: true,
                deleteTransactions: true,
                manageCategories: true,
                manageUsers: true,
              }
            : {
                viewTransactions: true,
                addTransactions: true,
                editTransactions: false,
                deleteTransactions: false,
                manageCategories: false,
                manageUsers: false,
              };
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Utility function to check user permissions
  const hasPermission = (permission: keyof UserPermission): boolean => {
    if (!user) return false;
    return user.permissions ? user.permissions[permission] : false;
  };

  // In a real application, this would communicate with your backend
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Try to initialize MongoDB connection
      let foundUser = null;
      let isPasswordValid = false;
      
      const isMongoConnected = await mongoDbService.initializeDatabase();
      
      if (isMongoConnected) {
        try {
          // Get user from MongoDB
          const userCollection = mongoDbService.getCollection<User>(USERS_COLLECTION);
          foundUser = await userCollection.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
          
          // Check password from MongoDB
          const credCollection = mongoDbService.getCollection<{username: string, password: string}>(CREDENTIALS_COLLECTION);
          const storedCredential = await credCollection.findOne({ username: username.toLowerCase() });
          
          if (storedCredential) {
            isPasswordValid = storedCredential.password === password;
          }
        } catch (error) {
          console.error("MongoDB login error:", error);
          // Fallback to localStorage
          foundUser = null;
        }
      }
      
      // If not found in MongoDB or MongoDB is not connected, try localStorage
      if (!foundUser) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get stored users from localStorage
        const usersString = localStorage.getItem("users");
        const users = usersString ? JSON.parse(usersString) : [
          { 
            id: 1, 
            username: "admin", 
            role: "admin",
            permissions: {
              viewTransactions: true,
              addTransactions: true,
              editTransactions: true,
              deleteTransactions: true,
              manageCategories: true,
              manageUsers: true,
            }
          },
          { 
            id: 2, 
            username: "user", 
            role: "user",
            permissions: {
              viewTransactions: true,
              addTransactions: true,
              editTransactions: false,
              deleteTransactions: false,
              manageCategories: false,
              manageUsers: false,
            }
          }
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
        
        // Check password from localStorage
        isPasswordValid = credentials[username.toLowerCase()] === password;
        
        // Find the user in our users array
        foundUser = users.find((u: User) => 
          u.username.toLowerCase() === username.toLowerCase()
        );
      }
      
      // Check login
      if (isPasswordValid && foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        toast.success(`Welcome back, ${foundUser.username}!`);
        navigate("/");
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
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      isAuthenticated, 
      hasPermission,
      login, 
      logout, 
      loading 
    }}>
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
