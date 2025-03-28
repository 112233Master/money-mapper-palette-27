
import { query } from '../services/db';
import { Category } from '../context/FinanceContext';

interface QueryResult {
  affectedRows?: number;
  insertId?: number;
}

export const getAllCategories = async (): Promise<Category[]> => {
  return await query<Category[]>('SELECT id, name FROM categories');
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const categories = await query<Category[]>('SELECT id, name FROM categories WHERE id = ?', [id]);
  return categories.length > 0 ? categories[0] : null;
};

export const createCategory = async (name: string): Promise<Category> => {
  const result = await query<QueryResult>('INSERT INTO categories (name) VALUES (?)', [name]);
  return { id: result.insertId || 0, name };
};

export const updateCategory = async (id: number, name: string): Promise<boolean> => {
  const result = await query<QueryResult>('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return (result.affectedRows || 0) > 0;
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const result = await query<QueryResult>('DELETE FROM categories WHERE id = ?', [id]);
  return (result.affectedRows || 0) > 0;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
