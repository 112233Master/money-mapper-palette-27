
import { MongoClient, Db, Collection } from 'mongodb';
import { Category, Transaction } from '../context/FinanceContext';

// MongoDB connection string - will be provided by the environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'finance_app';

// Collections
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions'
};

// MongoDB client instance
let client: MongoClient | null = null;
let db: Db | null = null;

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const testClient = new MongoClient(MONGODB_URI);
    await testClient.connect();
    await testClient.close();
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDB connected successfully to', DB_NAME);
    return true;
  } catch (error) {
    console.error('MongoDB initialization failed:', error);
    return false;
  }
};

// Get collection with proper typing
export const getCollection = <T>(collectionName: string): Collection<T> => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db.collection<T>(collectionName);
};

// Close connection
export const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
};

export default {
  testConnection,
  initializeDatabase,
  getCollection,
  closeConnection,
  COLLECTIONS
};
