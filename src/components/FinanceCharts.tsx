
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { useFinance } from "@/context/FinanceContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";

// Function to group transactions by month
const groupTransactionsByMonth = (transactions: any[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  // Initialize data with all months
  const monthlyData = months.map(month => ({
    name: month,
    deposit: 0,
    withdrawal: 0,
    pettyCash: 0,
  }));

  // Group transactions by month
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    // Only process transactions from current year
    if (date.getFullYear() === currentYear) {
      const monthIndex = date.getMonth();
      const type = transaction.type;
      
      if (type === 'deposit') {
        monthlyData[monthIndex].deposit += transaction.amount;
      } else if (type === 'withdrawal') {
        monthlyData[monthIndex].withdrawal += transaction.amount;
      } else if (type === 'petty-cash') {
        monthlyData[monthIndex].pettyCash += transaction.amount;
      }
    }
  });

  return monthlyData;
};

// Generate traffic sources data based on transaction categories
const generateTrafficSourcesData = (transactions: any[], categories: any[]) => {
  const categoryTotals: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    if (category) {
      const categoryName = category.name;
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += transaction.amount;
    }
  });

  // Convert to array for chart
  return Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3); // Get top 3 categories
};

export const FinanceCharts: React.FC = () => {
  const { transactions, categories } = useFinance();
  
  const monthlyData = groupTransactionsByMonth(transactions);
  const trafficSourcesData = generateTrafficSourcesData(transactions, categories);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];
  
  const chartConfig = {
    deposit: { 
      label: "Deposits",
      theme: { light: "#8884d8", dark: "#8884d8" } 
    },
    withdrawal: { 
      label: "Withdrawals",
      theme: { light: "#FF8042", dark: "#FF8042" } 
    },
    pettyCash: { 
      label: "Petty Cash",
      theme: { light: "#00C49F", dark: "#00C49F" } 
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="overflow-hidden rounded-xl bg-white shadow-sm p-2">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium">Monthly Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="deposit" fill="#8884d8" name="Deposits" />
                <Bar dataKey="withdrawal" fill="#FF8042" name="Withdrawals" />
                <Bar dataKey="pettyCash" fill="#00C49F" name="Petty Cash" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl bg-white shadow-sm p-2">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {trafficSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceCharts;
