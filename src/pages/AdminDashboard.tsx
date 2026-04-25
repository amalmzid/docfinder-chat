import { useState, useEffect } from "react";
import { userService, User } from "../services/userService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, UserPlus, Pencil, Trash2, Search, Shield, Stethoscope,
  Store, UserCheck, AlertTriangle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const roleIcons = {
  administrator: Shield,
  doctor: Stethoscope,
  pharmacist: Store,
  patient: UserCheck,
};

const roleColors = {
  administrator: "bg-purple-100 text-purple-800 border-purple-200",
  doctor: "bg-blue-100 text-blue-800 border-blue-200",
  pharmacist: "bg-green-100 text-green-800 border-green-200",
  patient: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "patient" as User['role'],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: User['role']) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success("User role updated successfully!");
    } catch (err) {
      toast.error("Failed to update user role");
      console.error('Error:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success("User deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete user");
        console.error('Error:', err);
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      await userService.register(newUser);
      toast.success("User created successfully!");
      setNewUser({ nom: "", email: "", mot_de_passe: "", role: "patient" });
      setUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to create user");
      console.error('Error:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    administrators: users.filter(u => u.role === 'administrator').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    pharmacists: users.filter(u => u.role === 'pharmacist').length,
    patients: users.filter(u => u.role === 'patient').length,
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Administrator Dashboard</h1>
        <p className="text-muted-foreground">Manage users and assign roles in the system</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Users", value: userStats.total, icon: Users, color: "text-primary" },
          { label: "Administrators", value: userStats.administrators, icon: Shield, color: "text-purple-600" },
          { label: "Doctors", value: userStats.doctors, icon: Stethoscope, color: "text-blue-600" },
          { label: "Pharmacists", value: userStats.pharmacists, icon: Store, color: "text-green-600" },
          { label: "Patients", value: userStats.patients, icon: UserCheck, color: "text-gray-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
          <div>
            <CardTitle className="font-heading text-lg">User Management</CardTitle>
            <CardDescription>View, edit roles, and manage system users</CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 w-56" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="administrator">Administrators</SelectItem>
                <SelectItem value="doctor">Doctors</SelectItem>
                <SelectItem value="pharmacist">Pharmacists</SelectItem>
                <SelectItem value="patient">Patients</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-medical hover:opacity-90">
                  <UserPlus className="h-4 w-4 mr-1" />Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Create New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Full Name *</Label>
                    <Input 
                      value={newUser.nom} 
                      onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email"
                      value={newUser.email} 
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password *</Label>
                    <Input 
                      type="password"
                      value={newUser.mot_de_passe} 
                      onChange={(e) => setNewUser({ ...newUser, mot_de_passe: e.target.value })} 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role *</Label>
                    <Select value={newUser.role} onValueChange={(v: User['role']) => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCreateUser} className="bg-gradient-medical hover:opacity-90">
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading users...</div>
          ) : error ? (
            <div className="text-red-500 p-8">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                            <RoleIcon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{user.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Select 
                            value={user.role} 
                            onValueChange={(v: User['role']) => handleRoleChange(user.id!, v)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="patient">Patient</SelectItem>
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="pharmacist">Pharmacist</SelectItem>
                              <SelectItem value="administrator">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive" 
                            onClick={() => handleDeleteUser(user.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
