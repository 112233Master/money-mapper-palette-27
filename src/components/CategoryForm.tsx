
import React, { useState } from "react";
import { useFinance, Category } from "@/context/FinanceContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormProps {
  categoryToEdit?: Category;
  onSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryToEdit,
  onSuccess,
}) => {
  const { addCategory, updateCategory } = useFinance();
  const [name, setName] = useState(categoryToEdit?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, name);
    } else {
      addCategory(name);
      setName(""); // Clear input after adding
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full animate-fade-up">
      <CardHeader>
        <CardTitle>{categoryToEdit ? "Edit Category" : "Add Category"}</CardTitle>
        <CardDescription>
          {categoryToEdit
            ? "Update the category details"
            : "Create a new transaction category"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" className="ml-auto">
            {categoryToEdit ? "Update" : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
