
import { Transaction, TransactionType } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.TRANSACTIONS;

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    return await collection.find({}).toArray();
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return [];
  }
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    return await collection.find({ type }).toArray();
  } catch (error) {
    console.error(`Error fetching transactions by type ${type}:`, error);
    return [];
  }
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    return await collection.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();
  } catch (error) {
    console.error(`Error fetching transactions by date range:`, error);
    return [];
  }
};

export const createTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    
    // Generate an ID (would normally be done by MongoDB)
    const result = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = result.length > 0 ? (result[0].id || 0) + 1 : 1;
    
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: nextId,
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(newTransaction);
    return newTransaction;
  } catch (error) {
    console.error(`Error creating transaction:`, error);
    throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateTransaction = async (id: number | string, updates: Partial<Transaction>): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    let query: any = {};
    
    if (typeof id === 'string') {
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { id: parseInt(id) };
      }
    } else {
      query = { id };
    }
    
    const result = await collection.updateOne(
      query, 
      { 
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return false;
  }
};

export const deleteTransaction = async (id: number | string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    let query: any = {};
    
    if (typeof id === 'string') {
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { id: parseInt(id) };
      }
    } else {
      query = { id };
    }
    
    const result = await collection.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    return false;
  }
};

export default {
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
