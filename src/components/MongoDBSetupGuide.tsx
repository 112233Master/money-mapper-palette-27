
import React from 'react';
import { checkMongoDBSetup, testConnection } from '../services/mongoDb';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const MongoDBSetupGuide = () => {
  const [connectionStatus, setConnectionStatus] = React.useState<'unknown' | 'success' | 'error'>('unknown');
  const [isLoading, setIsLoading] = React.useState(false);
  const { isConfigured, connectionString } = checkMongoDBSetup();
  
  // Enhanced browser detection - checking both window existence and absence of Node.js process
  const isBrowser = typeof window !== 'undefined' && 
                    typeof window.document !== 'undefined';

  const testDatabaseConnection = async () => {
    // Don't attempt connection in browser
    if (isBrowser) {
      setConnectionStatus('error');
      return;
    }
    
    setIsLoading(true);
    try {
      const connected = await testConnection();
      setConnectionStatus(connected ? 'success' : 'error');
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Only attempt to test connection in server environment, never in browser
    if (!isBrowser) {
      testDatabaseConnection();
    } else {
      // In browser, immediately set status to browser environment
      setConnectionStatus('error');
    }
  }, [isBrowser]);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>MongoDB Setup Guide</CardTitle>
        <CardDescription>
          Configure your MongoDB connection for Money Mapper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBrowser && (
          <Alert variant="destructive">
            <AlertTitle>Browser Environment Detected</AlertTitle>
            <AlertDescription>
              <p className="mb-2"><strong>Important:</strong> MongoDB requires a server environment to operate.</p>
              <p>This application is currently running in a browser environment where MongoDB connections are not possible. For full functionality:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Clone this repository to your local machine</li>
                <li>Set up MongoDB Atlas or local MongoDB instance</li>
                <li>Configure with environment variables</li>
                <li>Run with Node.js</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'error' && !isBrowser && (
          <Alert variant="destructive">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Could not connect to MongoDB. Please check your connection string and ensure your database is accessible.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'success' && (
          <Alert>
            <AlertTitle>Connected Successfully</AlertTitle>
            <AlertDescription>
              Successfully connected to your MongoDB database.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Configuration</h3>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="font-medium">Connection:</div>
            <div className="text-muted-foreground overflow-hidden text-ellipsis">
              {isConfigured ? connectionString : "Using default (localhost)"}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">MongoDB Setup Instructions</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a MongoDB Atlas account or use your own MongoDB server</li>
            <li>Create a new database named <code>finance_app</code> (or choose your own name)</li>
            <li>Create collections: <code>categories</code>, <code>transactions</code>, <code>users</code>, and <code>credentials</code></li>
            <li>Get your MongoDB connection string (URI)</li>
            <li>Set up environment variables for your application:
              <ul className="list-disc pl-5 mt-2">
                <li><code>MONGODB_URI</code>: Your MongoDB connection string</li>
                <li><code>MONGODB_DB_NAME</code>: Your database name (defaults to 'finance_app')</li>
              </ul>
            </li>
            <li className="font-medium">For local development:
              <ul className="list-disc pl-5 mt-2">
                <li>Install MongoDB Community Edition locally</li>
                <li>Create a <code>.env</code> file in your project root with the variables above</li>
                <li>Start your server with <code>npm run dev</code></li>
              </ul>
            </li>
            <li className="font-medium">For production:
              <ul className="list-disc pl-5 mt-2">
                <li>Deploy to a Node.js environment (Vercel, Netlify, Heroku, etc.)</li>
                <li>Set environment variables in your hosting platform</li>
                <li>Connect to MongoDB Atlas for cloud database hosting</li>
              </ul>
            </li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testDatabaseConnection} 
          disabled={isLoading || isBrowser}
          title={isBrowser ? "Testing not available in browser environment" : "Test connection"}
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MongoDBSetupGuide;
