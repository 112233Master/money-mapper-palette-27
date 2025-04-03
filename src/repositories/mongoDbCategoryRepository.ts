
import { Category } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.CATEGORIES;

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
    return await collection.find({}).toArray();
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: number | string): Promise<Category | null> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
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
    
    return await collection.findOne(query) || null;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
};

export const createCategory = async (name: string): Promise<Category> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
    
    // Generate an ID (would normally be done by MongoDB)
    const result = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = result.length > 0 ? (result[0].id || 0) + 1 : 1;
    
    const newCategory: Category = { id: nextId, name };
    await collection.insertOne(newCategory);
    return newCategory;
  } catch (error) {
    console.error(`Error creating category ${name}:`, error);
    throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateCategory = async (id: number | string, name: string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
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
    
    const result = await collection.updateOne(query, { $set: { name } });
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    return false;
  }
};

export const deleteCategory = async (id: number | string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
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
    console.error(`Error deleting category ${id}:`, error);
    return false;
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
