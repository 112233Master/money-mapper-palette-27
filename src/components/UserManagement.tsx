import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, Edit, Shield } from "lucide-react";
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
import * as mongoDbService from "../services/mongoDb";

interface UserPermission {
  viewTransactions: boolean;
  addTransactions: boolean;
  editTransactions: boolean;
  deleteTransactions: boolean;
  manageCategories: boolean;
  manageUsers: boolean;
}

interface UserData {
  id: number;
  username: string;
  role: "admin" | "user";
  permissions: UserPermission;
  createdAt: string;
  createdBy: string | null;
}

const USERS_COLLECTION = 'users';
const CREDENTIALS_COLLECTION = 'credentials';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState<UserPermission>({
    viewTransactions: true,
    addTransactions: false,
    editTransactions: false,
    deleteTransactions: false,
    manageCategories: false,
    manageUsers: false,
  });
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const initialized = await mongoDbService.initializeDatabase();
        
        if (initialized) {
          const collection = mongoDbService.getCollection<UserData>(USERS_COLLECTION);
          const result = await collection.find({}).toArray();
          
          if (result && result.length > 0) {
            setUsers(result);
          } else {
            const defaultUsers = [
              { 
                id: 1, 
                username: "admin", 
                role: "admin" as const,
                permissions: {
                  viewTransactions: true,
                  addTransactions: true,
                  editTransactions: true,
                  deleteTransactions: true,
                  manageCategories: true,
                  manageUsers: true,
                },
                createdAt: new Date().toISOString(),
                createdBy: null
              },
              { 
                id: 2, 
                username: "user", 
                role: "user" as const,
                permissions: {
                  viewTransactions: true,
                  addTransactions: true,
                  editTransactions: false,
                  deleteTransactions: false,
                  manageCategories: false,
                  manageUsers: false,
                },
                createdAt: new Date().toISOString(),
                createdBy: null
              },
            ];
            setUsers(defaultUsers);
            
            for (const user of defaultUsers) {
              await saveUserToMongoDB(user);
            }
            
            await saveCredentialsToMongoDB("admin", "admin");
            await saveCredentialsToMongoDB("user", "user");
          }
        } else {
          console.error("Failed to initialize MongoDB");
          toast.error("Failed to connect to database");
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users from database");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  const saveUserToMongoDB = async (userData: UserData): Promise<boolean> => {
    try {
      const collection = mongoDbService.getCollection<UserData>(USERS_COLLECTION);
      await collection.insertOne(userData);
      return true;
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
      return false;
    }
  };
  
  const saveCredentialsToMongoDB = async (username: string, password: string): Promise<boolean> => {
    try {
      const collection = mongoDbService.getCollection<{username: string, password: string}>(CREDENTIALS_COLLECTION);
      await collection.insertOne({ username: username.toLowerCase(), password });
      return true;
    } catch (error) {
      console.error("Error saving credentials to MongoDB:", error);
      return false;
    }
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      toast.error("Username and password are required");
      return;
    }

    if (users.some(user => user.username.toLowerCase() === newUsername.toLowerCase())) {
      toast.error("Username already exists");
      return;
    }

    const newUser: UserData = {
      id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
      username: newUsername,
      role: newRole,
      permissions: newRole === "admin" 
        ? {
            viewTransactions: true,
            addTransactions: true,
            editTransactions: true,
            deleteTransactions: true,
            manageCategories: true,
            manageUsers: true,
          }
        : {
            viewTransactions: true,
            addTransactions: true,
            editTransactions: permissions.editTransactions,
            deleteTransactions: permissions.deleteTransactions,
            manageCategories: permissions.manageCategories,
            manageUsers: permissions.manageUsers,
          },
      createdAt: new Date().toISOString(),
      createdBy: user?.username || null
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    try {
      const initialized = await mongoDbService.initializeDatabase();
      if (initialized) {
        await saveUserToMongoDB(newUser);
        await saveCredentialsToMongoDB(newUsername, newPassword);
      }
    } catch (error) {
      console.error("Error saving to MongoDB:", error);
      toast.error("Failed to save user to database");
      return;
    }

    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
    setPermissions({
      viewTransactions: true,
      addTransactions: true,
      editTransactions: false,
      deleteTransactions: false,
      manageCategories: false,
      manageUsers: false,
    });
    setDialogOpen(false);
    
    toast.success(`User ${newUsername} added successfully`);
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (username.toLowerCase() === "admin") {
      toast.error("Cannot delete the main admin account");
      return;
    }

    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    
    try {
      const initialized = await mongoDbService.initializeDatabase();
      if (initialized) {
        const userCollection = mongoDbService.getCollection<UserData>(USERS_COLLECTION);
        await userCollection.deleteOne({ id });
        
        const credCollection = mongoDbService.getCollection<{username: string}>(CREDENTIALS_COLLECTION);
        await credCollection.deleteOne({ username: username.toLowerCase() });
      }
    } catch (error) {
      console.error("Error deleting from MongoDB:", error);
      toast.error("Failed to delete user from database");
      return;
    }

    toast.success(`User ${username} deleted successfully`);
  };
  
  const handleEditPermissions = (user: UserData) => {
    setSelectedUserId(user.id);
    setPermissions(user.permissions);
    setPermissionsDialogOpen(true);
  };
  
  const handleSavePermissions = async () => {
    if (selectedUserId === null) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          permissions,
          updatedAt: new Date().toISOString()
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    try {
      const initialized = await mongoDbService.initializeDatabase();
      if (initialized) {
        const collection = mongoDbService.getCollection<UserData>(USERS_COLLECTION);
        await collection.updateOne(
          { id: selectedUserId },
          { $set: { permissions, updatedAt: new Date().toISOString() } }
        );
      }
    } catch (error) {
      console.error("Error updating permissions in MongoDB:", error);
      toast.error("Failed to update permissions in database");
      return;
    }
    
    setPermissionsDialogOpen(false);
    setSelectedUserId(null);
    toast.success("User permissions updated successfully");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto"></div>
        <p className="mt-2">Loading users...</p>
      </div>
    </div>;
  }

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
                  onValueChange={(value) => {
                    setNewRole(value as "admin" | "user");
                    if (value === "admin") {
                      setPermissions({
                        viewTransactions: true,
                        addTransactions: true,
                        editTransactions: true,
                        deleteTransactions: true,
                        manageCategories: true,
                        manageUsers: true,
                      });
                    }
                  }}
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
              
              {newRole === "user" && (
                <div className="col-span-4 space-y-2 mt-2">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="perm-edit"
                        checked={permissions.editTransactions}
                        onChange={e => setPermissions({...permissions, editTransactions: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <Label htmlFor="perm-edit" className="text-sm font-normal">Edit Transactions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="perm-delete"
                        checked={permissions.deleteTransactions}
                        onChange={e => setPermissions({...permissions, deleteTransactions: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <Label htmlFor="perm-delete" className="text-sm font-normal">Delete Transactions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="perm-category"
                        checked={permissions.manageCategories}
                        onChange={e => setPermissions({...permissions, manageCategories: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <Label htmlFor="perm-category" className="text-sm font-normal">Manage Categories</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="perm-users"
                        checked={permissions.manageUsers}
                        onChange={e => setPermissions({...permissions, manageUsers: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <Label htmlFor="perm-users" className="text-sm font-normal">Manage Users</Label>
                    </div>
                  </div>
                </div>
              )}
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
          <CardDescription>Manage your application users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created By</TableHead>
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
                  <TableCell>{user.createdBy || "System"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPermissions(user)}
                      disabled={user.username.toLowerCase() === "admin"}
                      title="Edit Permissions"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.username.toLowerCase() === "admin"}
                      title="Delete User"
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
      
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              Customize what this user can do in the application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="perm-view" className="text-sm">Transaction Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-view"
                      checked={permissions.viewTransactions}
                      onChange={e => setPermissions({...permissions, viewTransactions: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-view" className="text-sm font-normal">View Transactions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-add"
                      checked={permissions.addTransactions}
                      onChange={e => setPermissions({...permissions, addTransactions: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-add" className="text-sm font-normal">Add Transactions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-edit-dialog"
                      checked={permissions.editTransactions}
                      onChange={e => setPermissions({...permissions, editTransactions: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-edit-dialog" className="text-sm font-normal">Edit Transactions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-delete-dialog"
                      checked={permissions.deleteTransactions}
                      onChange={e => setPermissions({...permissions, deleteTransactions: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-delete-dialog" className="text-sm font-normal">Delete Transactions</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perm-categories" className="text-sm">Administrative Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-categories"
                      checked={permissions.manageCategories}
                      onChange={e => setPermissions({...permissions, manageCategories: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-categories" className="text-sm font-normal">Manage Categories</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm-users-dialog"
                      checked={permissions.manageUsers}
                      onChange={e => setPermissions({...permissions, manageUsers: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <Label htmlFor="perm-users-dialog" className="text-sm font-normal">Manage Users</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
