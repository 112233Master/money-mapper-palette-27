
import { Category } from '../context/FinanceContext';
import * as mongoDb from '../services/mongoDb';

const COLLECTION_NAME = mongoDb.COLLECTIONS.CATEGORIES;

// In browser environment, these functions will always fail
// They're included for API compatibility with other repository implementations

export const getAllCategories = async (): Promise<Category[]> => {
  console.warn('MongoDB getAllCategories called in browser environment');
  return [];
};

export const getCategoryById = async (id: number | string): Promise<Category | null> => {
  console.warn(`MongoDB getCategoryById(${id}) called in browser environment`);
  return null;
};

export const createCategory = async (name: string): Promise<Category> => {
  console.warn(`MongoDB createCategory(${name}) called in browser environment`);
  throw new Error('Cannot create category: MongoDB operations not supported in browser');
};

export const updateCategory = async (id: number | string, name: string): Promise<boolean> => {
  console.warn(`MongoDB updateCategory(${id}, ${name}) called in browser environment`);
  return false;
};

export const deleteCategory = async (id: number | string): Promise<boolean> => {
  console.warn(`MongoDB deleteCategory(${id}) called in browser environment`);
  return false;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
