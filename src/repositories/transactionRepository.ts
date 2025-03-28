
import { query } from '../services/db';
import { Transaction, TransactionType } from '../context/FinanceContext';

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await query<Transaction[]>(`
    SELECT 
      id, type, amount, DATE_FORMAT(date, '%Y-%m-%d') as date, 
      category_id as categoryId, description, ref_number as refNumber,
      cheque_number as chequeNumber, voucher_number as voucherNumber,
      created_at as createdAt, updated_at as updatedAt
    FROM transactions
    ORDER BY date DESC
  `);
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  return await query<Transaction[]>(
    `SELECT 
      id, type, amount, DATE_FORMAT(date, '%Y-%m-%d') as date, 
      category_id as categoryId, description, ref_number as refNumber,
      cheque_number as chequeNumber, voucher_number as voucherNumber,
      created_at as createdAt, updated_at as updatedAt
    FROM transactions 
    WHERE type = ?
    ORDER BY date DESC`, 
    [type]
  );
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  return await query<Transaction[]>(
    `SELECT 
      id, type, amount, DATE_FORMAT(date, '%Y-%m-%d') as date, 
      category_id as categoryId, description, ref_number as refNumber,
      cheque_number as chequeNumber, voucher_number as voucherNumber,
      created_at as createdAt, updated_at as updatedAt
    FROM transactions 
    WHERE date BETWEEN ? AND ?
    ORDER BY date DESC`, 
    [startDate, endDate]
  );
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
  const result = await query<{insertId: number}>(
    `INSERT INTO transactions 
      (type, amount, date, category_id, description, ref_number, cheque_number, voucher_number) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.type,
      transaction.amount,
      transaction.date,
      transaction.categoryId,
      transaction.description,
      transaction.refNumber || null,
      transaction.chequeNumber || null,
      transaction.voucherNumber || null
    ]
  );

  // Get the created transaction
  const createdTransaction = await query<Transaction[]>(
    `SELECT 
      id, type, amount, DATE_FORMAT(date, '%Y-%m-%d') as date, 
      category_id as categoryId, description, ref_number as refNumber,
      cheque_number as chequeNumber, voucher_number as voucherNumber,
      created_at as createdAt, updated_at as updatedAt
    FROM transactions 
    WHERE id = ?`, 
    [result.insertId]
  );

  return createdTransaction[0];
};

export const updateTransaction = async (id: number, updates: Partial<Transaction>): Promise<boolean> => {
  // Build the update query dynamically based on the fields that are provided
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }

  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }

  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }

  if (updates.categoryId !== undefined) {
    fields.push('category_id = ?');
    values.push(updates.categoryId);
  }

  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }

  if (updates.refNumber !== undefined) {
    fields.push('ref_number = ?');
    values.push(updates.refNumber);
  }

  if (updates.chequeNumber !== undefined) {
    fields.push('cheque_number = ?');
    values.push(updates.chequeNumber);
  }

  if (updates.voucherNumber !== undefined) {
    fields.push('voucher_number = ?');
    values.push(updates.voucherNumber);
  }

  // Add id to values array (for WHERE clause)
  values.push(id);

  if (fields.length === 0) {
    return false; // Nothing to update
  }

  const result = await query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
};

export const deleteTransaction = async (id: number): Promise<boolean> => {
  const result = await query('DELETE FROM transactions WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

export default {
  getAllTransactions,
  getTransactionsByType,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
