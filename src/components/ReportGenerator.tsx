import React, { useState } from "react";
import { TransactionType, useFinance } from "@/context/FinanceContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface ReportData {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  reference: string;
}

const ReportGenerator: React.FC = () => {
  const { transactions, categories, getTransactionsByType, getTransactionsByDateRange } = useFinance();
  
  const [reportType, setReportType] = useState<TransactionType>("deposit");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  });
  
  const [generatedReport, setGeneratedReport] = useState<ReportData[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = () => {
    // Filter transactions by type and date range
    const filteredTransactions = transactions
      .filter(t => t.type === reportType)
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      });

    // Map to report data format
    const reportData: ReportData[] = filteredTransactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      let reference = "";
      
      switch (t.type) {
        case "deposit":
          reference = t.refNumber || "";
          break;
        case "withdrawal":
          reference = t.chequeNumber || "";
          break;
        case "petty-cash":
          reference = t.voucherNumber || "";
          break;
      }
      
      return {
        id: t.id,
        date: format(new Date(t.date), "dd/MM/yyyy"),
        category: category?.name || "Uncategorized",
        amount: t.amount,
        description: t.description,
        reference,
      };
    });
    
    setGeneratedReport(reportData);
    setReportGenerated(true);
  };

  const exportToPDF = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ")} Report`;
      const dateRangeText = `${format(dateRange.from, "dd/MM/yyyy")} to ${format(dateRange.to, "dd/MM/yyyy")}`;
      
      doc.setFontSize(18);
      doc.text(reportTitle, 14, 22);
      
      doc.setFontSize(11);
      doc.text(dateRangeText, 14, 30);
      
      // Add timestamp
      const timestamp = `Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
      doc.setFontSize(9);
      doc.text(timestamp, 14, 36);
      
      // Create table
      const tableColumn = ["Date", getReferenceHeader(), "Category", "Description", "Amount (Rs.)"];
      const tableRows = generatedReport.map(item => [
        item.date,
        item.reference,
        item.category,
        item.description,
        item.amount.toString()
      ]);
      
      // Add total row
      const totalAmount = getTotalAmount();
      tableRows.push(["", "", "", "Total", totalAmount.toString()]);
      
      // Generate the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [75, 85, 166] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 255] },
      });
      
      // Save the PDF
      doc.save(`${reportType}-report-${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
      
      toast.success("PDF report exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const columns: ColumnDef<ReportData>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "reference",
      header: getReferenceHeader(),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return <div className="font-medium">Rs. {row.original.amount}</div>;
      },
    },
  ];

  function getReferenceHeader() {
    switch (reportType) {
      case "deposit":
        return "Reference No";
      case "withdrawal":
        return "Cheque No";
      case "petty-cash":
        return "Voucher No";
      default:
        return "Reference";
    }
  }

  const getTotalAmount = () => {
    return generatedReport.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select transaction type and date range to generate a report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportType">Transaction Type</Label>
              <Select
                value={reportType}
                onValueChange={(value) => setReportType(value as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="petty-cash">Petty Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => 
                        setDateRange(range as { from: Date; to: Date })
                      }
                      numberOfMonths={2}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Button onClick={generateReport} className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {reportGenerated && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ")} Report
              </CardTitle>
              <CardDescription>
                {format(dateRange.from, "dd/MM/yyyy")} to {format(dateRange.to, "dd/MM/yyyy")}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={generatedReport} searchColumn="description" />
          </CardContent>
          <CardFooter className="border-t">
            <div className="ml-auto text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-xl font-bold">Rs. {getTotalAmount()}</div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;
