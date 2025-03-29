
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import Header from "@/components/Header";
import ReportGenerator from "@/components/ReportGenerator";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";

const Reports: React.FC = () => {
  const { summary } = useFinance();
  
  const exportSummaryToPDF = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Financial Summary Report", 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);
      
      // Create table data
      const tableData = [
        ["Total Deposits", `Rs. ${summary.totalDeposit}`],
        ["Total Withdrawals", `Rs. ${summary.totalWithdrawal}`],
        ["Bank Balance", `Rs. ${summary.bankBalance}`],
        ["Total Petty Cash", `Rs. ${summary.totalPettyCash}`],
        ["Cash In Hand", `Rs. ${summary.cashInHand}`],
      ];
      
      // Generate the table
      autoTable(doc, {
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80 }
        },
        headStyles: { fillColor: [75, 85, 166] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      
      // Save the PDF
      doc.save(`financial-summary-${format(new Date(), "yyyyMMdd")}.pdf`);
      
      toast.success("Summary report exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export summary PDF. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Financial Summary</CardTitle>
                <Button variant="outline" onClick={exportSummaryToPDF}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Summary PDF
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Deposits</TableCell>
                      <TableCell className="text-right">Rs. {summary.totalDeposit}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Withdrawals</TableCell>
                      <TableCell className="text-right">Rs. {summary.totalWithdrawal}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bank Balance</TableCell>
                      <TableCell className="text-right">Rs. {summary.bankBalance}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Petty Cash</TableCell>
                      <TableCell className="text-right">Rs. {summary.totalPettyCash}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cash In Hand</TableCell>
                      <TableCell className="text-right">Rs. {summary.cashInHand}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <ReportGenerator />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
