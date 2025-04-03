
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
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  const testDatabaseConnection = async () => {
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
    // Only attempt to test connection on server, never in browser
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
              <p>Currently using browser localStorage as a temporary data store. For persistent data storage and full functionality:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Deploy this application to a Node.js environment</li>
                <li>Use a MongoDB Atlas database</li>
                <li>Configure with environment variables</li>
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
            <li>Configure the application with your connection string using environment variables:
              <ul className="list-disc pl-5 mt-2">
                <li><code>MONGODB_URI</code>: Your MongoDB connection string</li>
                <li><code>MONGODB_DB_NAME</code>: Your database name (defaults to 'finance_app')</li>
              </ul>
            </li>
            <li className="font-medium">For full functionality, deploy this application to a server environment that supports MongoDB connection.</li>
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
