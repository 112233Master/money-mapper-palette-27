
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import * as mongoDbService from '../services/mongoDb';
import * as categoryRepository from '../repositories/mongoDbCategoryRepository';
import * as transactionRepository from '../repositories/mongoDbTransactionRepository';

// Transaction types
export type TransactionType = "deposit" | "withdrawal" | "petty-cash";
export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string; // ISO format
  categoryId: number;
  description: string;
  refNumber?: string; // For deposits
  chequeNumber?: string; // For withdrawals
  voucherNumber?: string; // For petty cash
  createdAt: string;
  updatedAt: string;
}

interface FinanceSummary {
  totalDeposit: number;
  totalWithdrawal: number;
  bankBalance: number;
  totalPettyCash: number;
  cashInHand: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  summary: FinanceSummary;
  recentTransactions: Transaction[];
  // CRUD operations for transactions
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  // Category operations
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  // Filter transactions
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // Browser detection 
  const isBrowser = typeof window !== 'undefined' && 
                   typeof window.document !== 'undefined';

  // Calculate financial summary
  const calculateSummary = (transactions: Transaction[]): FinanceSummary => {
    const totalDeposit = transactions
      .filter(t => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawal = transactions
      .filter(t => t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPettyCash = transactions
      .filter(t => t.type === "petty-cash")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalDeposit,
      totalWithdrawal,
      bankBalance: totalDeposit - totalWithdrawal,
      totalPettyCash,
      cashInHand: totalWithdrawal - totalPettyCash
    };
  };

  const [summary, setSummary] = useState<FinanceSummary>({
    totalDeposit: 0,
    totalWithdrawal: 0,
    bankBalance: 0,
    totalPettyCash: 0,
    cashInHand: 0
  });

  // Get recent transactions
  const getRecentTransactions = (allTransactions: Transaction[], count: number = 5) => {
    return [...allTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  };

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // Initialize database and load data
  useEffect(() => {
    const init = async () => {
      try {
        if (isBrowser) {
          console.log("Running in browser environment, using localStorage for data");
          // Load from localStorage in browser environment
          try {
            // Load categories
            const storedCategories = localStorage.getItem("mongo_categories");
            if (storedCategories) {
              setCategories(JSON.parse(storedCategories));
            }
            
            // Load transactions
            const storedTransactions = localStorage.getItem("mongo_transactions");
            if (storedTransactions) {
              const parsedTransactions = JSON.parse(storedTransactions);
              setTransactions(parsedTransactions);
              setSummary(calculateSummary(parsedTransactions));
              setRecentTransactions(getRecentTransactions(parsedTransactions));
            }
          } catch (error) {
            console.error("Error loading data from localStorage:", error);
          }
          return;
        }
        
        // Initialize MongoDB - only in Node.js environment
        const initialized = await mongoDbService.initializeDatabase();
        if (initialized) {
          setDbInitialized(true);
          
          // Load categories
          const loadedCategories = await categoryRepository.getAllCategories();
          setCategories(loadedCategories);
          
          // Load transactions
          const loadedTransactions = await transactionRepository.getAllTransactions();
          setTransactions(loadedTransactions);
          
          // Calculate summary and recent transactions
          setSummary(calculateSummary(loadedTransactions));
          setRecentTransactions(getRecentTransactions(loadedTransactions));
        } else {
          console.error("Failed to initialize MongoDB");
          toast.error("Failed to connect to database");
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        toast.error("Error initializing database");
      }
    };

    init();

    // Clean up on unmount
    return () => {
      if (!isBrowser) {
        mongoDbService.closeConnection();
      }
    };
  }, [isBrowser]);

  // Update summary and recent transactions when data changes
  useEffect(() => {
    setSummary(calculateSummary(transactions));
    setRecentTransactions(getRecentTransactions(transactions));
  }, [transactions]);

  // Transaction CRUD operations
  const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newTransaction = await transactionRepository.createTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction]);
      toast.success(`${capitalizeFirstLetter(transaction.type)} added successfully`);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    try {
      const success = await transactionRepository.updateTransaction(id, updates);
      if (success) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === id 
              ? { ...transaction, ...updates, updatedAt: new Date().toISOString() } 
              : transaction
          )
        );
        toast.success("Transaction updated successfully");
      } else {
        toast.error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      const success = await transactionRepository.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
        toast.success("Transaction deleted successfully");
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  // Category operations
  const addCategory = async (name: string) => {
    try {
      const newCategory = await categoryRepository.createCategory(name);
      setCategories(prev => [...prev, newCategory]);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      const success = await categoryRepository.updateCategory(id, name);
      if (success) {
        setCategories(prev => 
          prev.map(category => 
            category.id === id ? { ...category, name } : category
          )
        );
        toast.success("Category updated successfully");
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: number) => {
    // Check if category is in use
    const inUse = transactions.some(t => t.categoryId === id);
    if (inUse) {
      toast.error("Cannot delete category that is in use");
      return;
    }
    
    try {
      const success = await categoryRepository.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        toast.success("Category deleted successfully");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  // Filter transactions
  const getTransactionsByType = (type: TransactionType) => {
    return transactions.filter(t => t.type === type);
  };

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      summary,
      recentTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      getTransactionsByType,
      getTransactionsByDateRange,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

// Helper function
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.replace(/-/g, ' ').slice(1);
}
