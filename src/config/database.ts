
// Database configuration
export const dbConfig = {
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DBNAME || 'finance_tracker',
  },
  
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
  mongodb: {
    uri: dbConfig.mongodb.uri,
    dbName: dbConfig.mongodb.dbName
  },
  mock: {
    host: dbConfig.mock.host,
    database: dbConfig.mock.database
  }
});

// Export configuration
export default dbConfig;
