
import { Category, Transaction, TransactionType } from '../context/FinanceContext';
import * as mockDb from './db';
import * as indexedDb from './indexedDb';
import * as mongoDb from './mongoDb';
import * as mockCategoryRepo from '../repositories/categoryRepository';
import * as mockTransactionRepo from '../repositories/transactionRepository';
import * as indexedDbCategoryRepo from '../repositories/indexedDbCategoryRepository';
import * as indexedDbTransactionRepo from '../repositories/indexedDbTransactionRepository';
import * as mongoDbCategoryRepo from '../repositories/mongoDbCategoryRepository';
import * as mongoDbTransactionRepo from '../repositories/mongoDbTransactionRepository';

// Available storage types
export type StorageType = 'mock' | 'indexeddb' | 'mongodb';

// Default to IndexedDB, fallback to mock
let currentStorage: StorageType = 'indexeddb';

// Interface for storage providers
export interface StorageProvider {
  // Connection methods
  testConnection: () => Promise<boolean>;
  initializeDatabase: () => Promise<boolean>;
  
  // Category operations
  getAllCategories: () => Promise<Category[]>;
  getCategoryById: (id: number | string) => Promise<Category | null>;
  createCategory: (name: string) => Promise<Category>;
  updateCategory: (id: number | string, name: string) => Promise<boolean>;
  deleteCategory: (id: number | string) => Promise<boolean>;
  
  // Transaction operations
  getAllTransactions: () => Promise<Transaction[]>;
  getTransactionsByType: (type: TransactionType) => Promise<Transaction[]>;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Promise<Transaction[]>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: number | string, updates: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: number | string) => Promise<boolean>;
}

// Get the current implementation based on storage type
export const getProvider = (): StorageProvider => {
  if (currentStorage === 'mongodb') {
    return {
      testConnection: mongoDb.testConnection,
      initializeDatabase: mongoDb.initializeDatabase,
      getAllCategories: mongoDbCategoryRepo.getAllCategories,
      getCategoryById: mongoDbCategoryRepo.getCategoryById,
      createCategory: mongoDbCategoryRepo.createCategory,
      updateCategory: mongoDbCategoryRepo.updateCategory,
      deleteCategory: mongoDbCategoryRepo.deleteCategory,
      getAllTransactions: mongoDbTransactionRepo.getAllTransactions,
      getTransactionsByType: mongoDbTransactionRepo.getTransactionsByType,
      getTransactionsByDateRange: mongoDbTransactionRepo.getTransactionsByDateRange,
      createTransaction: mongoDbTransactionRepo.createTransaction,
      updateTransaction: mongoDbTransactionRepo.updateTransaction,
      deleteTransaction: mongoDbTransactionRepo.deleteTransaction,
    };
  } else if (currentStorage === 'indexeddb') {
    return {
      testConnection: indexedDb.testConnection,
      initializeDatabase: indexedDb.initializeDatabase,
      getAllCategories: indexedDbCategoryRepo.getAllCategories,
      getCategoryById: indexedDbCategoryRepo.getCategoryById,
      createCategory: indexedDbCategoryRepo.createCategory,
      updateCategory: indexedDbCategoryRepo.updateCategory,
      deleteCategory: indexedDbCategoryRepo.deleteCategory,
      getAllTransactions: indexedDbTransactionRepo.getAllTransactions,
      getTransactionsByType: indexedDbTransactionRepo.getTransactionsByType,
      getTransactionsByDateRange: indexedDbTransactionRepo.getTransactionsByDateRange,
      createTransaction: indexedDbTransactionRepo.createTransaction,
      updateTransaction: indexedDbTransactionRepo.updateTransaction,
      deleteTransaction: indexedDbTransactionRepo.deleteTransaction,
    };
  } else {
    // Mock implementation
    return {
      testConnection: mockDb.testConnection,
      initializeDatabase: mockDb.initializeDatabase,
      getAllCategories: mockCategoryRepo.getAllCategories,
      getCategoryById: mockCategoryRepo.getCategoryById,
      createCategory: mockCategoryRepo.createCategory,
      updateCategory: mockCategoryRepo.updateCategory,
      deleteCategory: mockCategoryRepo.deleteCategory,
      getAllTransactions: mockTransactionRepo.getAllTransactions,
      getTransactionsByType: mockTransactionRepo.getTransactionsByType,
      getTransactionsByDateRange: mockTransactionRepo.getTransactionsByDateRange,
      createTransaction: mockTransactionRepo.createTransaction,
      updateTransaction: mockTransactionRepo.updateTransaction,
      deleteTransaction: mockTransactionRepo.deleteTransaction,
    };
  }
};

// Switch between storage implementations
export const setStorageType = (type: StorageType): void => {
  currentStorage = type;
  console.log(`Switched to ${type} storage`);
};

// Get current storage type
export const getStorageType = (): StorageType => currentStorage;

export default {
  getProvider,
  setStorageType,
  getStorageType
};
