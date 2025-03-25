
import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReportGenerator from "@/components/ReportGenerator";

const Reports: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports" />
        <main className="flex-1 overflow-y-auto p-6">
          <ReportGenerator />
        </main>
      </div>
    </div>
  );
};

export default Reports;
