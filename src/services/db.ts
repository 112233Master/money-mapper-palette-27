
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Execute a query with parameters
export const query = async <T>(sql: string, params?: any[]): Promise<T> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results as unknown as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a raw connection (for transactions)
export const getConnection = async () => {
  return await pool.getConnection();
};

// Create database schema if it doesn't exist
export const initializeDatabase = async () => {
  try {
    // Create categories table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Create transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('deposit', 'withdrawal', 'petty-cash') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category_id INT NOT NULL,
        description TEXT,
        ref_number VARCHAR(255),
        cheque_number VARCHAR(255),
        voucher_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Check if categories exist, if not insert default ones
    const categories = await query<any[]>('SELECT * FROM categories');
    if (categories.length === 0) {
      await query(`
        INSERT INTO categories (name) VALUES 
        ('Salary'), ('Rent'), ('Utilities'), ('Office Supplies'), ('Travel')
      `);
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

export default {
  query,
  testConnection,
  getConnection,
  initializeDatabase
};
