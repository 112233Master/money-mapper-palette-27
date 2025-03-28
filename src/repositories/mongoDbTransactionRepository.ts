
import { ObjectId } from 'mongodb';
import { Transaction, TransactionType } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.TRANSACTIONS;

// Helper to convert MongoDB _id to numeric id for frontend compatibility
const convertFromMongoDoc = (doc: any): Transaction => {
  if (!doc) return doc;
  
  // Extract _id and convert to number id, then remove _id
  const { _id, ...rest } = doc;
  return {
    id: typeof _id === 'object' ? _id.toString() : _id,
    ...rest
  };
};

// Helper to prepare document for MongoDB (remove id, add _id if exists)
const prepareForMongo = (doc: any) => {
  const { id, ...rest } = doc;
  return id ? { _id: id, ...rest } : rest;
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    const transactions = await collection.find({}).toArray();
    
    // Convert MongoDB docs to Transaction objects
    return transactions.map(convertFromMongoDoc)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting all transactions:', error);
    return [];
  }
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    const transactions = await collection.find({ type }).toArray();
    return transactions.map(convertFromMongoDoc);
  } catch (error) {
    console.error(`Error getting transactions by type ${type}:`, error);
    return [];
  }
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    const collection = mongoDb.getCollection<Transaction>(COLLECTION_NAME);
    const transactions = await collection.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();
    return transactions.map(convertFromMongoDoc);
  } catch (error) {
    console.error(`Error getting transactions by date range:`, error);
    return [];
  }
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
  try {
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      createdAt: now,
      updatedAt: now
    };
    
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    const result = await collection.insertOne(prepareForMongo(newTransaction));
    
    return {
      id: result.insertedId.toString(),
      ...newTransaction
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: number | string, updates: Partial<Transaction>): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    
    // Prepare updates, add updatedAt
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Remove id from updates if present
    if ('id' in updateData) {
      delete updateData.id;
    }
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return false;
  }
};

export const deleteTransaction = async (id: number | string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: id });
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
