
import React from 'react';
import Header from '@/components/Header';
import MongoDBSetupGuide from '@/components/MongoDBSetupGuide';
import { Sidebar } from '@/components/Sidebar';

const MongoDBSetup: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="MongoDB Setup" />
        <main className="flex-1 overflow-y-auto p-4">
          <MongoDBSetupGuide />
        </main>
      </div>
    </div>
  );
};

export default MongoDBSetup;
