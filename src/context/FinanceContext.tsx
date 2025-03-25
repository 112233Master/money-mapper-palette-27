
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  // Category operations
  addCategory: (name: string) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
  // Filter transactions
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper to generate a random ID
const generateId = () => Math.floor(Math.random() * 10000);

// Mock data for demo purposes
const initialCategories: Category[] = [
  { id: 1, name: "Salary" },
  { id: 2, name: "Rent" },
  { id: 3, name: "Utilities" },
  { id: 4, name: "Office Supplies" },
  { id: 5, name: "Travel" },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: "deposit",
    amount: 5000,
    date: today.toISOString().split('T')[0],
    categoryId: 1,
    description: "Monthly salary",
    refNumber: "DEP001",
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 2,
    type: "withdrawal",
    amount: 1500,
    date: today.toISOString().split('T')[0],
    categoryId: 2,
    description: "Office rent payment",
    chequeNumber: "CHQ101",
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 3,
    type: "petty-cash",
    amount: 200,
    date: yesterday.toISOString().split('T')[0],
    categoryId: 4,
    description: "Office stationery",
    voucherNumber: "PET001",
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load data from localStorage
  const loadInitialData = <T,>(key: string, defaultData: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  };

  const [transactions, setTransactions] = useState<Transaction[]>(
    loadInitialData("transactions", initialTransactions)
  );
  
  const [categories, setCategories] = useState<Category[]>(
    loadInitialData("categories", initialCategories)
  );

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

  const [summary, setSummary] = useState<FinanceSummary>(calculateSummary(transactions));

  // Get recent transactions
  const getRecentTransactions = (count: number = 5) => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  };

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    getRecentTransactions()
  );

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("categories", JSON.stringify(categories));
    setSummary(calculateSummary(transactions));
    setRecentTransactions(getRecentTransactions());
  }, [transactions, categories]);

  // Transaction CRUD operations
  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    toast.success(`${capitalizeFirstLetter(transaction.type)} added successfully`);
  };

  const updateTransaction = (id: number, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updates, updatedAt: new Date().toISOString() } 
          : transaction
      )
    );
    toast.success("Transaction updated successfully");
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    toast.success("Transaction deleted successfully");
  };

  // Category operations
  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
    };
    setCategories(prev => [...prev, newCategory]);
    toast.success("Category added successfully");
  };

  const updateCategory = (id: number, name: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id ? { ...category, name } : category
      )
    );
    toast.success("Category updated successfully");
  };

  const deleteCategory = (id: number) => {
    // Check if category is in use
    const inUse = transactions.some(t => t.categoryId === id);
    if (inUse) {
      toast.error("Cannot delete category that is in use");
      return;
    }
    setCategories(prev => prev.filter(category => category.id !== id));
    toast.success("Category deleted successfully");
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
