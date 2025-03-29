
import { MongoClient, Db, Collection } from 'mongodb';
import { Category, Transaction } from '../context/FinanceContext';

// MongoDB connection configuration
// Replace this with your actual MongoDB connection string in your environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'finance_app';

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
    console.log('MongoDB connection test successful to:', MONGODB_URI);
    await testClient.close();
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<boolean> => {
  if (client && db) {
    console.log('MongoDB already connected');
    return true;
  }
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDB connected successfully to database:', DB_NAME);
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

// Check MongoDB setup
export const checkMongoDBSetup = (): { isConfigured: boolean, connectionString: string } => {
  const hasCustomURI = process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017';
  return {
    isConfigured: hasCustomURI,
    connectionString: MONGODB_URI
  };
};

export default {
  testConnection,
  initializeDatabase,
  getCollection,
  closeConnection,
  checkMongoDBSetup,
  COLLECTIONS
};
