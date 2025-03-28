
// This is a browser-compatible mock of the MySQL service
// In a real application, you would use an API to communicate with the server

import { Category, Transaction, TransactionType } from '../context/FinanceContext';

// In-memory storage for mock database
const mockDb: {
  categories: Category[];
  transactions: Transaction[];
} = {
  categories: [
    { id: 1, name: "Salary" },
    { id: 2, name: "Rent" },
    { id: 3, name: "Utilities" },
    { id: 4, name: "Office Supplies" },
    { id: 5, name: "Travel" },
  ],
  transactions: []
};

// Initialize with some data
const initializeWithMockData = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  mockDb.transactions = [
    {
      id: 1,
      type: "deposit" as TransactionType,
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
      type: "withdrawal" as TransactionType,
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
      type: "petty-cash" as TransactionType,
      amount: 200,
      date: yesterday.toISOString().split('T')[0],
      categoryId: 4,
      description: "Office stationery",
      voucherNumber: "PET001",
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ];
};

// Test database connection - always returns true in mock
export const testConnection = async () => {
  console.log('Mock database connection successful');
  return true;
};

// Initialize database - just sets up our mock data
export const initializeDatabase = async () => {
  try {
    // Initialize with mock data if not already populated
    if (mockDb.transactions.length === 0) {
      initializeWithMockData();
    }
    console.log('Mock database initialized successfully');
    return true;
  } catch (error) {
    console.error('Mock database initialization failed:', error);
    return false;
  }
};

// Generate a new ID
const generateId = () => {
  return Math.max(0, ...mockDb.transactions.map(t => t.id), ...mockDb.categories.map(c => c.id)) + 1;
};

// Execute a query with parameters - simulated in memory
export const query = async <T>(sql: string, params?: any[]): Promise<T> => {
  console.log('Mock query:', sql, params);
  
  try {
    // Categories CRUD operations
    if (sql.includes('SELECT') && sql.includes('FROM categories')) {
      if (sql.includes('WHERE id =')) {
        const id = params?.[0];
        const result = mockDb.categories.filter(c => c.id === id);
        return result as unknown as T;
      } else {
        return [...mockDb.categories] as unknown as T;
      }
    }
    
    else if (sql.includes('INSERT INTO categories')) {
      const name = params?.[0];
      const newId = generateId();
      const newCategory = { id: newId, name };
      mockDb.categories.push(newCategory);
      return { insertId: newId } as unknown as T;
    }
    
    else if (sql.includes('UPDATE categories')) {
      const [name, id] = params || [];
      const index = mockDb.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockDb.categories[index].name = name;
        return { affectedRows: 1 } as unknown as T;
      }
      return { affectedRows: 0 } as unknown as T;
    }
    
    else if (sql.includes('DELETE FROM categories')) {
      const id = params?.[0];
      const initialLength = mockDb.categories.length;
      mockDb.categories = mockDb.categories.filter(c => c.id !== id);
      return { affectedRows: initialLength - mockDb.categories.length } as unknown as T;
    }
    
    // Transactions CRUD operations
    else if (sql.includes('SELECT') && sql.includes('FROM transactions')) {
      if (sql.includes('WHERE id =')) {
        const id = params?.[0];
        const result = mockDb.transactions.filter(t => t.id === id);
        return result as unknown as T;
      } 
      else if (sql.includes('WHERE type =')) {
        const type = params?.[0];
        return mockDb.transactions.filter(t => t.type === type).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) as unknown as T;
      }
      else if (sql.includes('WHERE date BETWEEN')) {
        const [startDate, endDate] = params || [];
        return mockDb.transactions.filter(t => {
          const date = new Date(t.date);
          return date >= new Date(startDate) && date <= new Date(endDate);
        }).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) as unknown as T;
      }
      else {
        return mockDb.transactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ) as unknown as T;
      }
    }
    
    else if (sql.includes('INSERT INTO transactions')) {
      const [type, amount, date, categoryId, description, refNumber, chequeNumber, voucherNumber] = params || [];
      const newId = generateId();
      const now = new Date().toISOString();
      
      const newTransaction = {
        id: newId,
        type,
        amount,
        date,
        categoryId,
        description,
        refNumber,
        chequeNumber,
        voucherNumber,
        createdAt: now,
        updatedAt: now
      };
      
      mockDb.transactions.push(newTransaction);
      return { insertId: newId } as unknown as T;
    }
    
    else if (sql.includes('UPDATE transactions')) {
      // For update we'll parse the SQL to find which fields to update
      // This is a simplification - in a real app we'd use a proper SQL parser
      const id = params?.[params.length - 1]; // Last param is always the ID in our case
      const index = mockDb.transactions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        const fields = sql.split('SET ')[1].split(' WHERE')[0].split(', ');
        const updates: Record<string, any> = {};
        
        fields.forEach((field, i) => {
          const key = field.split(' = ')[0].trim();
          const value = params?.[i];
          
          // Map DB field names to object properties
          const keyMap: Record<string, keyof Transaction> = {
            'type': 'type',
            'amount': 'amount',
            'date': 'date',
            'category_id': 'categoryId',
            'description': 'description',
            'ref_number': 'refNumber',
            'cheque_number': 'chequeNumber',
            'voucher_number': 'voucherNumber'
          };
          
          if (keyMap[key]) {
            updates[keyMap[key]] = value;
          }
        });
        
        mockDb.transactions[index] = {
          ...mockDb.transactions[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        return { affectedRows: 1 } as unknown as T;
      }
      
      return { affectedRows: 0 } as unknown as T;
    }
    
    else if (sql.includes('DELETE FROM transactions')) {
      const id = params?.[0];
      const initialLength = mockDb.transactions.length;
      mockDb.transactions = mockDb.transactions.filter(t => t.id !== id);
      return { affectedRows: initialLength - mockDb.transactions.length } as unknown as T;
    }
    
    // Handle CREATE TABLE statements (no-op in mock)
    else if (sql.includes('CREATE TABLE')) {
      return {} as unknown as T;
    }
    
    // Handle INSERT with multiple values (like for default categories)
    else if (sql.includes('INSERT INTO categories') && sql.includes('VALUES')) {
      // This is a batch insert, like for default categories
      // We assume the format is fixed as in our initializeDatabase function
      if (!mockDb.categories.length) {
        const categoryNames = ["Salary", "Rent", "Utilities", "Office Supplies", "Travel"];
        const startId = generateId();
        
        categoryNames.forEach((name, index) => {
          mockDb.categories.push({
            id: startId + index,
            name
          });
        });
      }
      
      return {} as unknown as T;
    }
    
    console.warn('Unhandled query in mock database:', sql);
    return {} as unknown as T;
  } catch (error) {
    console.error('Mock database query error:', error);
    throw error;
  }
};

// Get a raw connection (for transactions) - not implemented in mock
export const getConnection = async () => {
  console.log('Mock getConnection called');
  return { release: () => {} };
};

export default {
  query,
  testConnection,
  getConnection,
  initializeDatabase
};
