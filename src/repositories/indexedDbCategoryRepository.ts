
import { Category } from '../context/FinanceContext';
import * as indexedDb from '../services/indexedDb';

const STORE_NAME = 'categories';

export const getAllCategories = async (): Promise<Category[]> => {
  return await indexedDb.getAllRecords<Category>(STORE_NAME);
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  return await indexedDb.getRecordById<Category>(STORE_NAME, id);
};

export const createCategory = async (name: string): Promise<Category> => {
  const newCategory = { name };
  const id = await indexedDb.addRecord<Category>(STORE_NAME, newCategory);
  return { id, name };
};

export const updateCategory = async (id: number, name: string): Promise<boolean> => {
  return await indexedDb.updateRecord(STORE_NAME, id, { name });
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  return await indexedDb.deleteRecord(STORE_NAME, id);
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
