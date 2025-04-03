
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
    testDatabaseConnection();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>MongoDB Setup Guide</CardTitle>
        <CardDescription>
          Configure your MongoDB connection for Money Mapper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'error' && (
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
            <li>Download and install <a href="https://www.mongodb.com/try/download/compass" target="_blank" rel="noopener noreferrer" className="text-primary underline">MongoDB Compass</a></li>
            <li>Open MongoDB Compass and connect to your MongoDB instance</li>
            <li>Create a new database named <code>finance_app</code> (or choose your own name)</li>
            <li>Create collections: <code>categories</code>, <code>transactions</code>, <code>users</code>, and <code>credentials</code></li>
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
                <li>Start your application with <code>npm run dev</code></li>
              </ul>
            </li>
            <li className="font-medium">For production:
              <ul className="list-disc pl-5 mt-2">
                <li>Deploy your application to a Node.js environment</li>
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
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MongoDBSetupGuide;
