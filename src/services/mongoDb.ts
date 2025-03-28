
import { MongoClient, Collection, Db } from 'mongodb';
import { Category, Transaction } from '../context/FinanceContext';

// MongoDB connection URI (should be set in environment variable in production)
const MONGODB_URI = 'mongodb://localhost:27017';
// Database name
const DB_NAME = 'finance_tracker';

let client: MongoClient | null = null;
let db: Db | null = null;

// Collections
const COLLECTIONS = {
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions'
};

// Connect to MongoDB
export const connectToMongo = async (): Promise<boolean> => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    db = client.db(DB_NAME);
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    return false;
  }
};

// Test the database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (!client) {
      return await connectToMongo();
    }
    
    // Ping the database to check connection
    await db?.command({ ping: 1 });
    console.log("MongoDB connection test successful");
    return true;
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    return false;
  }
};

// Initialize database schema
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    if (!db) {
      const connected = await connectToMongo();
      if (!connected) return false;
    }
    
    // Create collections if they don't exist
    const collections = await db?.listCollections().toArray();
    const collectionNames = collections?.map(c => c.name) || [];
    
    if (!collectionNames.includes(COLLECTIONS.CATEGORIES)) {
      await db?.createCollection(COLLECTIONS.CATEGORIES);
      console.log(`Created ${COLLECTIONS.CATEGORIES} collection`);
      
      // Create indexes
      await db?.collection(COLLECTIONS.CATEGORIES).createIndex({ name: 1 }, { unique: true });
    }
    
    if (!collectionNames.includes(COLLECTIONS.TRANSACTIONS)) {
      await db?.createCollection(COLLECTIONS.TRANSACTIONS);
      console.log(`Created ${COLLECTIONS.TRANSACTIONS} collection`);
      
      // Create indexes
      await db?.collection(COLLECTIONS.TRANSACTIONS).createIndex({ type: 1 });
      await db?.collection(COLLECTIONS.TRANSACTIONS).createIndex({ date: 1 });
      await db?.collection(COLLECTIONS.TRANSACTIONS).createIndex({ categoryId: 1 });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB database:', error);
    return false;
  }
};

// Get collection with proper typing
export const getCollection = <T>(collectionName: string): Collection<T> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.collection<T>(collectionName);
};

// Close connection
export const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
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
