
// Import only what's needed for browser compatibility
import { MongoClient, Db, Collection } from 'mongodb';
import { Category, Transaction } from '../context/FinanceContext';

// MongoDB connection configuration
// Replace this with your actual MongoDB connection string in your environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'finance_app';

// Collections
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  CREDENTIALS: 'credentials'
};

// Check if running in browser - more reliable detection
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// MongoDB client instance (will remain null in browser environment)
let client: MongoClient | null = null;
let db: Db | null = null;

// Test connection
export const testConnection = async (): Promise<boolean> => {
  if (isBrowser) {
    console.log('MongoDB connection test not available in browser environment');
    return false;
  }

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
  if (isBrowser) {
    console.log('Using localStorage for data persistence in browser environment');
    return false;
  }
  
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

// Get collection with proper typing (mocked in browser)
export const getCollection = <T>(collectionName: string): Collection<T> => {
  if (isBrowser) {
    // Return a mock Collection for browser environments
    return createMockCollection<T>(collectionName);
  }
  
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db.collection<T>(collectionName);
};

// Close connection
export const closeConnection = async (): Promise<void> => {
  if (isBrowser) {
    return;
  }
  
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

// Mock Collection implementation for browser environments
const createMockCollection = <T>(collectionName: string): Collection<T> => {
  const storageKey = `mongo_${collectionName}`;
  
  const getStoredData = (): T[] => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${collectionName} from localStorage:`, error);
      return [];
    }
  };
  
  const saveData = (data: T[]): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${collectionName} to localStorage:`, error);
    }
  };
  
  // Return a simplified mock of the MongoDB Collection interface
  return {
    find: (query = {}) => ({
      toArray: async () => {
        const data = getStoredData();
        // Basic query filtering (very simplified)
        if (Object.keys(query).length === 0) {
          return data;
        }
        
        return data.filter(item => {
          // Very basic query matching
          return Object.entries(query).every(([key, value]) => {
            if (key === '$regex' && typeof value === 'object') {
              // Handle regex for username search
              const regex = value as RegExp;
              return regex.test((item as any).username);
            }
            
            if (typeof value === 'object' && value !== null) {
              // Handle range queries like $gte, $lte
              const conditions = value as Record<string, any>;
              if (conditions.$gte && conditions.$lte) {
                return (item as any)[key] >= conditions.$gte && (item as any)[key] <= conditions.$lte;
              }
            }
            
            return (item as any)[key] === value;
          });
        });
      },
      sort: () => ({
        limit: () => ({
          toArray: async () => {
            const data = getStoredData();
            return data.length > 0 ? [data[data.length - 1]] : [];
          }
        })
      })
    }),
    findOne: async (query = {}) => {
      const data = getStoredData();
      return data.find(item => {
        return Object.entries(query).every(([key, value]) => {
          if (key === '$regex' && typeof value === 'object') {
            // Handle regex for username search
            const regex = value as RegExp;
            return regex.test((item as any).username);
          }
          return (item as any)[key] === value;
        });
      }) || null;
    },
    insertOne: async (doc) => {
      const data = getStoredData();
      data.push(doc);
      saveData(data);
      return { acknowledged: true, insertedId: Math.random().toString() };
    },
    updateOne: async (query, update) => {
      const data = getStoredData();
      let modifiedCount = 0;
      
      const updatedData = data.map(item => {
        if (Object.entries(query).every(([key, value]) => (item as any)[key] === value)) {
          modifiedCount++;
          return { ...item, ...update.$set };
        }
        return item;
      });
      
      saveData(updatedData);
      return { modifiedCount, matchedCount: modifiedCount };
    },
    deleteOne: async (query) => {
      const data = getStoredData();
      const initialLength = data.length;
      
      const filteredData = data.filter(item => {
        return !Object.entries(query).every(([key, value]) => (item as any)[key] === value);
      });
      
      saveData(filteredData);
      return { deletedCount: initialLength - filteredData.length };
    }
  } as unknown as Collection<T>;
};

// Now update the MongoDBSetupGuide component to correctly display browser environment info
export default {
  testConnection,
  initializeDatabase,
  getCollection,
  closeConnection,
  checkMongoDBSetup,
  COLLECTIONS
};
