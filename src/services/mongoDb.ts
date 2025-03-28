
import { Category, Transaction } from '../context/FinanceContext';

// Collections
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions'
};

// In browser environment, we can't directly connect to MongoDB
// We're mocking the MongoDB interface for frontend compatibility

// Test connection (always returns false in browser)
export const testConnection = async (): Promise<boolean> => {
  console.log("MongoDB connection test - this is a browser environment, returning false");
  // In browser environment, this will always fail
  return false;
};

// Initialize database (mocked for browser)
export const initializeDatabase = async (): Promise<boolean> => {
  console.log("MongoDB initialization - this is a browser environment, returning false");
  return false;
};

// Get collection with proper typing (mocked)
export const getCollection = <T>(collectionName: string): any => {
  console.warn(`MongoDB getCollection(${collectionName}) called in browser environment`);
  throw new Error('Cannot access MongoDB directly from browser');
};

// Close connection (mocked)
export const closeConnection = async (): Promise<void> => {
  console.log('MongoDB connection close - browser environment, no action needed');
};

export default {
  testConnection,
  initializeDatabase,
  getCollection,
  closeConnection,
  COLLECTIONS
};
