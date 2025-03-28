
// Browser-compatible mock database configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_tracker'
};

// For troubleshooting
console.log('Using database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Export configuration
export default dbConfig;
