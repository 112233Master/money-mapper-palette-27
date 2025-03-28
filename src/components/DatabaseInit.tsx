
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { getProvider, getStorageType, setStorageType, StorageType } from '@/services/storageProvider';

interface DatabaseInitProps {
  children: React.ReactNode;
}

const DatabaseInit: React.FC<DatabaseInitProps> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [storageType, setStorageTypeState] = useState<StorageType>(getStorageType());

  useEffect(() => {
    const connectToDb = async () => {
      try {
        const provider = getProvider();
        
        // Test the connection
        const isConnected = await provider.testConnection();
        
        if (isConnected) {
          // Initialize database schema
          const isInitialized = await provider.initializeDatabase();
          
          if (isInitialized) {
            setStatus('connected');
          } else {
            // If IndexedDB fails, try falling back to mock
            if (storageType === 'indexeddb') {
              console.log('Falling back to mock database');
              setStorageType('mock');
              setStorageTypeState('mock');
              // Try again with mock
              const mockProvider = getProvider();
              const mockConnected = await mockProvider.testConnection();
              const mockInitialized = await mockProvider.initializeDatabase();
              
              if (mockConnected && mockInitialized) {
                setStatus('connected');
              } else {
                setStatus('error');
                setErrorMessage('Failed to initialize both IndexedDB and mock database');
              }
            } else {
              setStatus('error');
              setErrorMessage('Failed to initialize database schema');
            }
          }
        } else {
          // If IndexedDB fails, try falling back to mock
          if (storageType === 'indexeddb') {
            console.log('Falling back to mock database');
            setStorageType('mock');
            setStorageTypeState('mock');
            // Try again with mock
            const mockProvider = getProvider();
            const mockConnected = await mockProvider.testConnection();
            const mockInitialized = await mockProvider.initializeDatabase();
            
            if (mockConnected && mockInitialized) {
              setStatus('connected');
            } else {
              setStatus('error');
              setErrorMessage('Failed to connect to both IndexedDB and mock database');
            }
          } else {
            setStatus('error');
            setErrorMessage('Failed to connect to the database');
          }
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown database error');
        console.error('Database connection error:', error);
        
        // Try fallback if using IndexedDB
        if (storageType === 'indexeddb') {
          try {
            console.log('Falling back to mock database after error');
            setStorageType('mock');
            setStorageTypeState('mock');
            const mockProvider = getProvider();
            const mockConnected = await mockProvider.testConnection();
            const mockInitialized = await mockProvider.initializeDatabase();
            
            if (mockConnected && mockInitialized) {
              setStatus('connected');
            }
          } catch (fallbackError) {
            console.error('Fallback to mock database also failed:', fallbackError);
          }
        }
      }
    };

    connectToDb();
  }, [storageType]);

  // Function to switch storage type and reconnect
  const switchStorageType = (type: StorageType) => {
    setStatus('loading');
    setStorageType(type);
    setStorageTypeState(type);
  };

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Initializing {storageType === 'indexeddb' ? 'IndexedDB' : 'Mock'} database...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            <p className="mt-2">{errorMessage}</p>
            <p className="mt-4">
              {storageType === 'indexeddb' 
                ? 'There was an error connecting to IndexedDB. Try using the mock database instead.'
                : 'This application is using a browser-compatible mock database for demonstration.'}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </button>
              {storageType === 'indexeddb' && (
                <button 
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                  onClick={() => switchStorageType('mock')}
                >
                  Use Mock Database
                </button>
              )}
              {storageType === 'mock' && (
                <button 
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                  onClick={() => switchStorageType('indexeddb')}
                >
                  Use IndexedDB
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <select 
          className="bg-muted text-primary px-3 py-1 rounded border border-input"
          value={storageType}
          onChange={(e) => switchStorageType(e.target.value as StorageType)}
        >
          <option value="indexeddb">IndexedDB</option>
          <option value="mock">Mock Database</option>
        </select>
      </div>
      {children}
    </div>
  );
};

export default DatabaseInit;
