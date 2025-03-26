
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import StatCard from "@/components/StatCard";
import { ArrowDownRight, ArrowUpRight, BanknoteIcon, Building, PiggyBank, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { summary, recentTransactions, categories } = useFinance();

  const getCategoryName = (id: number) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : "Uncategorized";
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "petty-cash":
        return <PiggyBank className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Deposits"
          value={summary.totalDeposit}
          icon={BanknoteIcon}
          colorStyle="blue"
        />
        <StatCard
          title="Total Withdrawals"
          value={summary.totalWithdrawal}
          icon={Wallet}
          colorStyle="pink"
        />
        <StatCard
          title="Bank Balance"
          value={summary.bankBalance}
          icon={Building}
          colorStyle="teal"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Petty Cash"
          value={summary.totalPettyCash}
          icon={PiggyBank}
          colorStyle="orange"
        />
        <StatCard
          title="Cash In Hand"
          value={summary.cashInHand}
          icon={Wallet}
          colorStyle="indigo"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No transactions yet</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-all-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {transaction.type.replace('-', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryName(transaction.categoryId)} - {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "deposit" 
                          ? "text-finance-deposit" 
                          : transaction.type === "withdrawal"
                            ? "text-finance-withdrawal"
                            : "text-finance-petty"
                      }`}>
                        {transaction.type === "deposit" ? "+" : "-"} Rs. {transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
