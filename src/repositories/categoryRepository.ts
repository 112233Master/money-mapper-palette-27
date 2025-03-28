
import { query } from '../services/db';
import { Category } from '../context/FinanceContext';

export const getAllCategories = async (): Promise<Category[]> => {
  return await query<Category[]>('SELECT id, name FROM categories');
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const categories = await query<Category[]>('SELECT id, name FROM categories WHERE id = ?', [id]);
  return categories.length > 0 ? categories[0] : null;
};

export const createCategory = async (name: string): Promise<Category> => {
  const result = await query<{insertId: number}>('INSERT INTO categories (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
};

export const updateCategory = async (id: number, name: string): Promise<boolean> => {
  const result = await query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows > 0;
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const result = await query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
