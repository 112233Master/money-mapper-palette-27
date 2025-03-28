
// Browser-based indexedDB implementation for persistent storage

// Database configuration
const DB_NAME = 'finance_tracker_db';
const DB_VERSION = 1;

// Store names
const STORES = {
  categories: 'categories',
  transactions: 'transactions'
};

// Open the database connection
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Could not open IndexedDB connection');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.categories)) {
        const categoryStore = db.createObjectStore(STORES.categories, { keyPath: 'id', autoIncrement: true });
        categoryStore.createIndex('name', 'name', { unique: false });
        
        // Add default categories
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if (transaction) {
          const store = transaction.objectStore(STORES.categories);
          const defaultCategories = [
            { name: "Salary" },
            { name: "Rent" },
            { name: "Utilities" },
            { name: "Office Supplies" },
            { name: "Travel" }
          ];
          
          defaultCategories.forEach(category => {
            store.add(category);
          });
        }
      }
      
      if (!db.objectStoreNames.contains(STORES.transactions)) {
        const transactionStore = db.createObjectStore(STORES.transactions, { keyPath: 'id', autoIncrement: true });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type_date', ['type', 'date'], { unique: false });
      }
    };
  });
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const db = await openDatabase();
    db.close();
    console.log('IndexedDB connection test successful');
    return true;
  } catch (error) {
    console.error('IndexedDB connection test failed:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    await openDatabase();
    console.log('IndexedDB initialized successfully');
    return true;
  } catch (error) {
    console.error('IndexedDB initialization failed:', error);
    return false;
  }
};

// Generic function to get all records from a store
export const getAllRecords = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = (event) => {
      reject(`Error getting records from ${storeName}: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result as T[]);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get a record by ID
export const getRecordById = async <T>(storeName: string, id: number): Promise<T | null> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onerror = (event) => {
      reject(`Error getting record from ${storeName}: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result as T || null);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get records by an index value
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
    
    request.onerror = (event) => {
      reject(`Error getting records from ${storeName} by ${indexName}: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result as T[]);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get records within a range using an index
export const getRecordsByRange = async <T>(
  storeName: string, 
  indexName: string, 
  lowerBound: any, 
  upperBound: any
): Promise<T[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const range = IDBKeyRange.bound(lowerBound, upperBound);
    const request = index.getAll(range);
    
    request.onerror = (event) => {
      reject(`Error getting records from ${storeName} by range: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result as T[]);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Add a new record
export const addRecord = async <T>(storeName: string, data: Omit<T, 'id'>): Promise<number> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Add timestamp fields if they don't exist
    const now = new Date().toISOString();
    const recordData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    const request = store.add(recordData);
    
    request.onerror = (event) => {
      reject(`Error adding record to ${storeName}: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result as number);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Update an existing record
export const updateRecord = async <T>(
  storeName: string, 
  id: number, 
  data: Partial<T>
): Promise<boolean> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // First, get the existing record
    const getRequest = store.get(id);
    
    getRequest.onerror = (event) => {
      reject(`Error getting record from ${storeName}: ${getRequest.error}`);
      db.close();
    };
    
    getRequest.onsuccess = (event) => {
      if (!getRequest.result) {
        reject(`Record with id ${id} not found in ${storeName}`);
        db.close();
        return;
      }
      
      // Merge existing record with updates
      const updatedRecord = {
        ...getRequest.result,
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const updateRequest = store.put(updatedRecord);
      
      updateRequest.onerror = (event) => {
        reject(`Error updating record in ${storeName}: ${updateRequest.error}`);
      };
      
      updateRequest.onsuccess = (event) => {
        resolve(true);
      };
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Delete a record
export const deleteRecord = async (storeName: string, id: number): Promise<boolean> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = (event) => {
      reject(`Error deleting record from ${storeName}: ${request.error}`);
    };
    
    request.onsuccess = (event) => {
      resolve(true);
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
  getRecordsByIndex,
  getRecordsByRange,
  addRecord,
  updateRecord,
  deleteRecord
};
