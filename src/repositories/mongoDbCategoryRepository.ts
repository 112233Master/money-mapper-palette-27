
import { ObjectId } from 'mongodb';
import { Category } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.CATEGORIES;

// Helper to convert MongoDB _id to numeric id for frontend compatibility
const convertFromMongoDoc = (doc: any): Category => {
  if (!doc) return doc;
  
  // Extract _id and convert to number id, then remove _id
  const { _id, ...rest } = doc;
  return {
    id: typeof _id === 'object' ? _id.toString() : _id,
    ...rest
  };
};

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
    const categories = await collection.find({}).toArray();
    return categories.map(convertFromMongoDoc);
  } catch (error) {
    console.error('Error getting all categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: number | string): Promise<Category | null> => {
  try {
    const collection = mongoDb.getCollection<Category>(COLLECTION_NAME);
    const category = await collection.findOne({ _id: id });
    return category ? convertFromMongoDoc(category) : null;
  } catch (error) {
    console.error(`Error getting category ${id}:`, error);
    return null;
  }
};

export const createCategory = async (name: string): Promise<Category> => {
  try {
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    const result = await collection.insertOne({ name });
    
    return {
      id: result.insertedId.toString(),
      name
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: number | string, name: string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    const result = await collection.updateOne(
      { _id: id },
      { $set: { name } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    return false;
  }
};

export const deleteCategory = async (id: number | string): Promise<boolean> => {
  try {
    const collection = mongoDb.getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: id });
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
