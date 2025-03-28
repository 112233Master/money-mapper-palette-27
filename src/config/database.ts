
// Database configuration
export const dbConfig = {
  // Browser-compatible mock database configuration
  mock: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finance_tracker'
  }
};

// For troubleshooting
console.log('Using database config:', {
  mock: {
    host: dbConfig.mock.host,
    database: dbConfig.mock.database
  }
});

// Export configuration
export default dbConfig;
