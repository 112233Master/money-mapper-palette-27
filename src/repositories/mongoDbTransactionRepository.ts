
import { Transaction, TransactionType } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.TRANSACTIONS;

// In browser environment, these functions will always fail
// They're included for API compatibility with other repository implementations

export const getAllTransactions = async (): Promise<Transaction[]> => {
  console.warn('MongoDB getAllTransactions called in browser environment');
  return [];
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  console.warn(`MongoDB getTransactionsByType(${type}) called in browser environment`);
  return [];
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  console.warn(`MongoDB getTransactionsByDateRange(${startDate}, ${endDate}) called in browser environment`);
  return [];
};

export const createTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> => {
  console.warn(`MongoDB createTransaction called in browser environment`);
  throw new Error('Cannot create transaction: MongoDB operations not supported in browser');
};

export const updateTransaction = async (id: number | string, updates: Partial<Transaction>): Promise<boolean> => {
  console.warn(`MongoDB updateTransaction(${id}) called in browser environment`);
  return false;
};

export const deleteTransaction = async (id: number | string): Promise<boolean> => {
  console.warn(`MongoDB deleteTransaction(${id}) called in browser environment`);
  return false;
};

export default {
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
