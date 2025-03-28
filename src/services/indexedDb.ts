
import { Category, Transaction, TransactionType } from '../context/FinanceContext';

// Database configuration
const DB_NAME = 'finance_tracker_db';
const DB_VERSION = 1;
const STORES = {
  categories: 'categories',
  transactions: 'transactions'
};

// Open database connection
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    // Create object stores when database is first created or upgraded
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create categories store with 'id' as key path
      if (!db.objectStoreNames.contains(STORES.categories)) {
        const categoriesStore = db.createObjectStore(STORES.categories, { keyPath: 'id', autoIncrement: true });
        categoriesStore.createIndex('name', 'name', { unique: false });
      }
      
      // Create transactions store with 'id' as key path
      if (!db.objectStoreNames.contains(STORES.transactions)) {
        const transactionsStore = db.createObjectStore(STORES.transactions, { keyPath: 'id', autoIncrement: true });
        transactionsStore.createIndex('type', 'type', { unique: false });
        transactionsStore.createIndex('date', 'date', { unique: false });
        transactionsStore.createIndex('categoryId', 'categoryId', { unique: false });
      }
    };
  });
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await openDatabase();
    console.log('IndexedDB connection successful');
    return true;
  } catch (error) {
    console.error('IndexedDB connection failed:', error);
    return false;
  }
};

// Initialize database with default data if empty
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const db = await openDatabase();
    
    // Check if categories store is empty
    const categoriesCount = await countRecords(STORES.categories);
    
    if (categoriesCount === 0) {
      // Add default categories
      const defaultCategories = [
        { name: "Salary" },
        { name: "Rent" },
        { name: "Utilities" },
        { name: "Office Supplies" },
        { name: "Travel" }
      ];
      
      for (const category of defaultCategories) {
        await addRecord(STORES.categories, category);
      }
      
      console.log('Added default categories to IndexedDB');
    }
    
    // Check if we need to add sample transactions
    const transactionsCount = await countRecords(STORES.transactions);
    
    if (transactionsCount === 0) {
      // Get categories to use their IDs
      const categories = await getAllRecords<Category>(STORES.categories);
      
      if (categories.length > 0) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Sample transactions
        const sampleTransactions = [
          {
            type: "deposit" as TransactionType,
            amount: 5000,
            date: today.toISOString().split('T')[0],
            categoryId: categories[0].id, // Salary
            description: "Monthly salary",
            refNumber: "DEP001",
            createdAt: today.toISOString(),
            updatedAt: today.toISOString(),
          },
          {
            type: "withdrawal" as TransactionType,
            amount: 1500,
            date: today.toISOString().split('T')[0],
            categoryId: categories[1].id, // Rent
            description: "Office rent payment",
            chequeNumber: "CHQ101",
            createdAt: today.toISOString(),
            updatedAt: today.toISOString(),
          },
          {
            type: "petty-cash" as TransactionType,
            amount: 200,
            date: yesterday.toISOString().split('T')[0],
            categoryId: categories[3].id, // Office Supplies
            description: "Office stationery",
            voucherNumber: "PET001",
            createdAt: yesterday.toISOString(),
            updatedAt: yesterday.toISOString(),
          }
        ];
        
        for (const transaction of sampleTransactions) {
          await addRecord(STORES.transactions, transaction);
        }
        
        console.log('Added sample transactions to IndexedDB');
      }
    }
    
    return true;
  } catch (error) {
    console.error('IndexedDB initialization failed:', error);
    return false;
  }
};

// Generic function to count records in a store
const countRecords = async (storeName: string): Promise<number> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const countRequest = store.count();
    
    countRequest.onsuccess = () => {
      resolve(countRequest.result);
    };
    
    countRequest.onerror = () => {
      reject(countRequest.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to get all records from a store
export const getAllRecords = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to get a record by ID
export const getRecordById = async <T>(storeName: string, id: number): Promise<T | null> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to add a record to a store
export const addRecord = async <T>(storeName: string, record: any): Promise<number> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(record);
    
    request.onsuccess = () => {
      resolve(request.result as number);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to update a record
export const updateRecord = async (storeName: string, id: number, updates: any): Promise<boolean> => {
  const db = await openDatabase();
  return new Promise(async (resolve, reject) => {
    // First get the existing record
    const existingRecord = await getRecordById(storeName, id);
    
    if (!existingRecord) {
      resolve(false);
      return;
    }
    
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Merge existing record with updates
    const updatedRecord = { ...existingRecord, ...updates, updatedAt: new Date().toISOString() };
    const request = store.put(updatedRecord);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to delete a record
export const deleteRecord = async (storeName: string, id: number): Promise<boolean> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get records by index value
export const getRecordsByIndex = async <T>(
  storeName: string, 
  indexName: string, 
  value: any
): Promise<T[]> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get records within a date range
export const getRecordsByDateRange = async <T>(
  storeName: string,
  startDate: string,
  endDate: string
): Promise<T[]> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('date');
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export default {
  testConnection,
  initializeDatabase,
  getAllRecords,
  getRecordById,
  addRecord,
  updateRecord,
  deleteRecord,
  getRecordsByIndex,
  getRecordsByDateRange
};
