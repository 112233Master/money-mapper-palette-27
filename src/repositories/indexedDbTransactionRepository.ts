
import { Transaction, TransactionType } from '../context/FinanceContext';
import * as indexedDb from '../services/indexedDb';

const STORE_NAME = 'transactions';

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const transactions = await indexedDb.getAllRecords<Transaction>(STORE_NAME);
  // Sort by date in descending order
  return transactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  return await indexedDb.getRecordsByIndex<Transaction>(STORE_NAME, 'type', type);
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  return await indexedDb.getRecordsByRange<Transaction>(STORE_NAME, 'date', startDate, endDate);
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const now = new Date().toISOString();
  const transactionWithTimestamps = {
    ...transaction,
    createdAt: now,
    updatedAt: now
  };
  
  const id = await indexedDb.addRecord<Transaction>(STORE_NAME, transactionWithTimestamps);
  
  // Return the complete transaction with id
  return {
    id,
    ...transactionWithTimestamps
  };
};

export const updateTransaction = async (id: number, updates: Partial<Transaction>): Promise<boolean> => {
  return await indexedDb.updateRecord<Transaction>(STORE_NAME, id, updates);
};

export const deleteTransaction = async (id: number): Promise<boolean> => {
  return await indexedDb.deleteRecord(STORE_NAME, id);
};

export default {
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
