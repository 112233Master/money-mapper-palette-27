
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserData {
  id: number;
  username: string;
  role: "admin" | "user";
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error("Failed to parse stored users:", error);
        return [];
      }
    }
    // Default users if none exist
    return [
      { id: 1, username: "admin", role: "admin" as const },
      { id: 2, username: "user", role: "user" as const },
    ];
  });

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddUser = () => {
    if (!newUsername || !newPassword) {
      toast.error("Username and password are required");
      return;
    }

    // Check if username already exists
    if (users.some(user => user.username.toLowerCase() === newUsername.toLowerCase())) {
      toast.error("Username already exists");
      return;
    }

    const newUser = {
      id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
      username: newUsername,
      role: newRole,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Store in localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Also store password (in a real app, this would be hashed and stored in a database)
    const userCredentials = JSON.parse(localStorage.getItem("userCredentials") || "{}");
    userCredentials[newUsername.toLowerCase()] = newPassword;
    localStorage.setItem("userCredentials", JSON.stringify(userCredentials));

    // Reset form
    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
    setDialogOpen(false);
    
    toast.success(`User ${newUsername} added successfully`);
  };

  const handleDeleteUser = (id: number, username: string) => {
    // Prevent deleting the main admin account
    if (username.toLowerCase() === "admin") {
      toast.error("Cannot delete the main admin account");
      return;
    }

    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Also remove from credentials
    const userCredentials = JSON.parse(localStorage.getItem("userCredentials") || "{}");
    delete userCredentials[username.toLowerCase()];
    localStorage.setItem("userCredentials", JSON.stringify(userCredentials));

    toast.success(`User ${username} deleted successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newRole} 
                  onValueChange={(value) => setNewRole(value as "admin" | "user")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Regular User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddUser}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage your application users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.username.toLowerCase() === "admin"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
