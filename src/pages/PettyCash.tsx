
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TransactionForm from "@/components/TransactionForm";
import { Transaction, useFinance } from "@/context/FinanceContext";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PettyCash: React.FC = () => {
  const { isAdmin } = useAuth();
  const { getTransactionsByType, deleteTransaction, categories } = useFinance();
  
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

  const pettyCashTransactions = getTransactionsByType("petty-cash");

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete !== null) {
      deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "voucherNumber",
      header: "Voucher No",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return formatDate(row.original.date);
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return <div className="font-medium">Rs. {row.original.amount}</div>;
      },
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        return getCategoryName(row.original.categoryId);
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return isAdmin ? (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null;
      },
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Petty Cash Transactions" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="mb-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Petty Cash
              </Button>
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Petty Cash Records</h2>
              <DataTable
                columns={columns}
                data={pettyCashTransactions}
                searchColumn="description"
                searchPlaceholder="Search petty cash transactions..."
              />
            </div>
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Petty Cash</DialogTitle>
          </DialogHeader>
          <TransactionForm
            type="petty-cash"
            onSuccess={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Petty Cash</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm
              type="petty-cash"
              transactionToEdit={editTransaction}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this petty cash record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PettyCash;
