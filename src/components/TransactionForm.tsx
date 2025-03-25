
import React, { useState } from "react";
import { Category, Transaction, TransactionType, useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface TransactionFormProps {
  type: TransactionType;
  transactionToEdit?: Transaction;
  onSuccess?: () => void;
}

const numberInputProps = {
  min: 0,
  step: 1,
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  transactionToEdit,
  onSuccess,
}) => {
  const { categories, addTransaction, updateTransaction } = useFinance();
  const { isAdmin } = useAuth();
  
  const initialFormState = transactionToEdit || {
    id: 0,
    type,
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    categoryId: categories.length > 0 ? categories[0].id : 0,
    description: "",
    refNumber: "",
    chequeNumber: "",
    voucherNumber: "",
    createdAt: "",
    updatedAt: "",
  };

  const [formData, setFormData] = useState<Transaction>(initialFormState);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    transactionToEdit ? new Date(transactionToEdit.date) : new Date()
  );

  // Reference, cheque or voucher number field based on type
  const getReferenceNumberField = () => {
    switch (type) {
      case "deposit":
        return {
          name: "refNumber",
          label: "Reference Number",
          placeholder: "Enter reference number",
          value: formData.refNumber || "",
        };
      case "withdrawal":
        return {
          name: "chequeNumber",
          label: "Cheque Number",
          placeholder: "Enter cheque number",
          value: formData.chequeNumber || "",
        };
      case "petty-cash":
        return {
          name: "voucherNumber",
          label: "Voucher Number",
          placeholder: "Enter voucher number",
          value: formData.voucherNumber || "",
        };
      default:
        return { name: "", label: "", placeholder: "", value: "" };
    }
  };

  const referenceField = getReferenceNumberField();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? parseInt(value) : value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, formData);
    } else {
      const { id, createdAt, updatedAt, ...newTransaction } = formData;
      addTransaction(newTransaction);
      
      // Reset form after submission
      setFormData({
        ...initialFormState,
        amount: 0,
        description: "",
        refNumber: "",
        chequeNumber: "",
        voucherNumber: "",
      });
      setSelectedDate(new Date());
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  // Remove card wrapper since it will be in a dialog now
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={referenceField.name}>{referenceField.label}</Label>
          <Input
            id={referenceField.name}
            name={referenceField.name}
            placeholder={referenceField.placeholder}
            value={referenceField.value}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (Rs.)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="Enter amount"
            value={formData.amount || ""}
            onChange={handleInputChange}
            {...numberInputProps}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={formData.categoryId.toString()}
            onValueChange={(value) => handleSelectChange("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter transaction details"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!isAdmin && !!transactionToEdit}
        >
          {transactionToEdit ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
