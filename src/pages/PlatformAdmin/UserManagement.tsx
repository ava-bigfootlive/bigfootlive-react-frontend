import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, MoreVertical, Plus, Search, Edit, Trash2, Shield, Ban } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  role: 'platform_admin' | 'tenant_admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  tenant_id?: string;
  tenant_name?: string;
  created_at: string;
  last_login?: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    given_name: '',
    family_name: '',
    role: 'user' as User['role'],
    tenant_id: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await api.createUser({
        ...formData,
        status: 'active',
      });
      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'User created successfully.',
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { password, ...updateData } = formData;
      const updatedUser = await api.updateUser(selectedUser.id, updateData);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendUser = async (user: User) => {
    try {
      const updatedUser = await api.updateUser(user.id, {
        status: user.status === 'suspended' ? 'active' : 'suspended',
      });
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      toast({
        title: 'Success',
        description: `User ${user.status === 'suspended' ? 'activated' : 'suspended'} successfully.`,
      });
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      given_name: '',
      family_name: '',
      role: 'user',
      tenant_id: '',
      password: '',
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      given_name: user.given_name || '',
      family_name: user.family_name || '',
      role: user.role,
      tenant_id: user.tenant_id || '',
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      platform_admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      tenant_admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      user: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    const labels = {
      platform_admin: 'Platform Admin',
      tenant_admin: 'Tenant Admin',
      user: 'User',
    };
    return (
      <Badge variant="outline" className={variants[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.given_name && user.given_name.toLowerCase().includes(searchLower)) ||
      (user.family_name && user.family_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground">User Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage platform users and permissions
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--surface-elevated))' }}>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" style={{ borderColor: 'hsl(var(--brand-primary))' }}></div>
                <span className="text-body" style={{ color: 'hsl(var(--foreground-secondary))' }}>Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="card-elevated p-8 max-w-sm mx-auto">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'hsl(var(--foreground-tertiary))' }} />
                <p className="text-body" style={{ color: 'hsl(var(--foreground-secondary))' }}>No users found</p>
                <p className="text-caption mt-2" style={{ color: 'hsl(var(--foreground-tertiary))' }}>Try adjusting your search terms</p>
              </div>
            </div>
          ) : (
            <div className="card-elevated rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))' }}>
                    <TableHead className="text-overline font-semibold px-6 py-4" style={{ color: 'hsl(var(--foreground-secondary))' }}>Name</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Email</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Role</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Status</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Tenant</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Last Login</TableHead>
                    <TableHead className="text-overline font-semibold text-right px-6" style={{ color: 'hsl(var(--foreground-secondary))' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="animate-fade-in transition-colors duration-200 hover:bg-[hsl(var(--surface-overlay))]" 
                      style={{ 
                        borderColor: 'hsl(var(--border))',
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <TableCell className="font-medium px-6 py-4" style={{ color: 'hsl(var(--foreground))' }}>
                        {user.given_name && user.family_name
                          ? `${user.given_name} ${user.family_name}`
                          : user.given_name || '-'}
                      </TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>{user.tenant_name || '-'}</TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-[hsl(var(--surface-elevated))] hover:shadow-md"
                              style={{ color: 'hsl(var(--foreground-tertiary))' }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                              {user.status === 'suspended' ? (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="given_name">First Name</Label>
                <Input
                  id="given_name"
                  value={formData.given_name}
                  onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="family_name">Last Name</Label>
                <Input
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full p-2 rounded-md bg-background border border-border"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              >
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="platform_admin">Platform Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-given_name">First Name</Label>
                <Input
                  id="edit-given_name"
                  value={formData.given_name}
                  onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-family_name">Last Name</Label>
                <Input
                  id="edit-family_name"
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="w-full p-2 rounded-md bg-background border border-border"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              >
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="platform_admin">Platform Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Alert>
              <AlertDescription>
                You are about to delete <strong>{selectedUser.email}</strong>
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}