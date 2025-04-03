
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import Header from "@/components/Header";
import UserManagement from "@/components/UserManagement";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Users: React.FC = () => {
  const { isAdmin, hasPermission } = useAuth();

  // Redirect non-admin users who don't have manageUsers permission
  if (!isAdmin && !hasPermission("manageUsers")) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="User Management" />
        <main className="flex-1 overflow-y-auto p-6">
          <UserManagement />
        </main>
      </div>
    </div>
  );
};

export default Users;
