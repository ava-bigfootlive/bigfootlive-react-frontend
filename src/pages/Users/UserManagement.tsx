import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Key,
  Mail,
  Phone,
  Calendar,
  Clock,
  Activity,
  Settings,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Crown,
  Star,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  LogIn,
  LogOut,
  Ban,
  UserCog
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  joinedDate: Date;
  lastActive?: Date;
  permissions: string[];
  department?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
  icon: React.ElementType;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: Date;
  ip?: string;
}

export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://placehold.co/40x40',
      role: 'owner',
      status: 'active',
      joinedDate: new Date('2023-01-01'),
      lastActive: new Date(),
      permissions: ['all'],
      department: 'Management',
      twoFactorEnabled: true,
      emailVerified: true
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      avatar: 'https://placehold.co/40x40',
      role: 'admin',
      status: 'active',
      joinedDate: new Date('2023-03-15'),
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
      permissions: ['manage_users', 'manage_content', 'manage_streams'],
      department: 'Operations',
      twoFactorEnabled: true,
      emailVerified: true
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'moderator',
      status: 'active',
      joinedDate: new Date('2023-06-01'),
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      permissions: ['moderate_chat', 'moderate_content'],
      department: 'Support',
      twoFactorEnabled: false,
      emailVerified: true
    },
    {
      id: '4',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      avatar: 'https://placehold.co/40x40',
      role: 'member',
      status: 'pending',
      joinedDate: new Date('2024-01-15'),
      permissions: ['view_content', 'chat'],
      department: 'Marketing',
      twoFactorEnabled: false,
      emailVerified: false
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'viewer',
      status: 'suspended',
      joinedDate: new Date('2023-09-20'),
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      permissions: ['view_content'],
      twoFactorEnabled: false,
      emailVerified: true
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to all features and settings',
      permissions: ['all'],
      userCount: 1,
      color: 'text-purple-500',
      icon: Crown
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Manage users, content, and settings',
      permissions: ['manage_users', 'manage_content', 'manage_streams', 'view_analytics'],
      userCount: 2,
      color: 'text-blue-500',
      icon: Shield
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Moderate chat and content',
      permissions: ['moderate_chat', 'moderate_content', 'ban_users'],
      userCount: 3,
      color: 'text-green-500',
      icon: UserCheck
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Standard member access',
      permissions: ['view_content', 'chat', 'create_content'],
      userCount: 15,
      color: 'text-yellow-500',
      icon: Users
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'View-only access',
      permissions: ['view_content'],
      userCount: 100,
      color: 'text-gray-500',
      icon: Eye
    }
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Wilson',
      action: 'Updated user permissions',
      details: 'Changed Mike Johnson role to Moderator',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      ip: '192.168.1.1'
    },
    {
      id: '2',
      userId: '1',
      userName: 'John Doe',
      action: 'Invited new user',
      details: 'Sent invitation to emily.chen@example.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      ip: '192.168.1.2'
    },
    {
      id: '3',
      userId: '3',
      userName: 'Mike Johnson',
      action: 'Suspended user',
      details: 'Suspended David Brown for policy violation',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      ip: '192.168.1.3'
    }
  ]);

  const permissions = [
    { id: 'manage_users', label: 'Manage Users', category: 'Administration' },
    { id: 'manage_content', label: 'Manage Content', category: 'Content' },
    { id: 'manage_streams', label: 'Manage Streams', category: 'Streaming' },
    { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
    { id: 'moderate_chat', label: 'Moderate Chat', category: 'Moderation' },
    { id: 'moderate_content', label: 'Moderate Content', category: 'Moderation' },
    { id: 'ban_users', label: 'Ban Users', category: 'Moderation' },
    { id: 'create_content', label: 'Create Content', category: 'Content' },
    { id: 'chat', label: 'Use Chat', category: 'Communication' },
    { id: 'view_content', label: 'View Content', category: 'Basic' }
  ];

  const getRoleIcon = (role: string) => {
    const roleData = roles.find(r => r.id === role);
    return roleData ? roleData.icon : Users;
  };

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.id === role);
    return roleData ? roleData.color : 'text-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      case 'inactive': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const inviteUser = (email: string, role: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role: role as any,
      status: 'pending',
      joinedDate: new Date(),
      permissions: roles.find(r => r.id === role)?.permissions || [],
      twoFactorEnabled: false,
      emailVerified: false
    };
    
    setUsers([...users, newUser]);
    setShowInviteDialog(false);
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${email}`
    });
  };

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as any, permissions: roles.find(r => r.id === newRole)?.permissions || [] }
        : user
    ));
    
    toast({
      title: "Role Updated",
      description: "User role has been updated successfully"
    });
  };

  const suspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'suspended' } : user
    ));
    
    toast({
      title: "User Suspended",
      description: "The user has been suspended"
    });
  };

  const activateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' } : user
    ));
    
    toast({
      title: "User Activated",
      description: "The user has been activated"
    });
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "User Deleted",
      description: "The user has been removed"
    });
  };

  const executeBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    switch (bulkAction) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        ));
        break;
      case 'suspend':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'suspended' } : user
        ));
        break;
      case 'delete':
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        break;
    }
    
    setSelectedUsers([]);
    setBulkAction('');
    
    toast({
      title: "Bulk Action Completed",
      description: `Action applied to ${selectedUsers.length} users`
    });
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Joined Date'],
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        format(user.joinedDate, 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({
      title: "Users Exported",
      description: "User data has been exported to CSV"
    });
  };

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage team members and permissions"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
            </div>
            <p className="text-xs text-muted-foreground">With admin rights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.twoFactorEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Secured accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
                <span className="text-sm">{selectedUsers.length} users selected</span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="suspend">Suspend</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={executeBulkAction}>
                  Apply
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedUsers([])}
                >
                  Clear
                </Button>
              </div>
            )}
          </Card>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon className={`h-4 w-4 ${getRoleColor(user.role)}`} />
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(user.joinedDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {user.lastActive 
                          ? formatDistanceToNow(user.lastActive, { addSuffix: true })
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.twoFactorEnabled && (
                            <Shield className="h-4 w-4 text-green-500" />
                          )}
                          {user.emailVerified && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.status === 'suspended' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => activateUser(user.id)}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => suspendUser(user.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Roles List */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage user roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {roles.map(role => {
                      const Icon = role.icon;
                      return (
                        <div key={role.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-5 w-5 ${role.color}`} />
                              <div>
                                <p className="font-medium">{role.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {role.description}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{role.userCount} users</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {role.permissions.slice(0, 3).map((perm, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="mt-3">
                            <Settings className="h-3 w-3 mr-2" />
                            Configure
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Permissions Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions Matrix</CardTitle>
                <CardDescription>Configure permissions for each role</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    {Object.entries(
                      permissions.reduce((acc, perm) => {
                        if (!acc[perm.category]) acc[perm.category] = [];
                        acc[perm.category].push(perm);
                        return acc;
                      }, {} as Record<string, typeof permissions>)
                    ).map(([category, perms]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-3">{category}</h4>
                        <div className="space-y-2">
                          {perms.map(perm => (
                            <div key={perm.id} className="flex items-center justify-between">
                              <Label className="text-sm">{perm.label}</Label>
                              <div className="flex gap-2">
                                {roles.slice(0, 3).map(role => (
                                  <Checkbox
                                    key={role.id}
                                    checked={role.permissions.includes(perm.id) || role.permissions.includes('all')}
                                    disabled={role.permissions.includes('all')}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent user management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{log.userName}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.action}
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.details}
                          </p>
                        )}
                        {log.ip && (
                          <p className="text-xs text-muted-foreground mt-1">
                            IP: {log.ip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
              <CardDescription>Configure user management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Registration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Open Registration</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification</Label>
                      <p className="text-xs text-muted-foreground">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Approval</Label>
                      <p className="text-xs text-muted-foreground">
                        Require admin approval for new accounts
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enforce 2FA</Label>
                      <p className="text-xs text-muted-foreground">
                        Require two-factor authentication for all users
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto logout after inactivity
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New User Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify admins when new users register
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Send alerts for suspicious activities
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select defaultValue="member">
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2 p-3 border rounded-lg max-h-[200px] overflow-y-auto">
                {permissions.map(perm => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox id={perm.id} />
                    <Label htmlFor={perm.id} className="text-sm">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => inviteUser('newuser@example.com', 'member')}>
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={selectedUser.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={selectedUser.email} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select 
                      value={selectedUser.role}
                      onValueChange={(value) => updateUserRole(selectedUser.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={selectedUser.department} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-2">
                  {permissions.map(perm => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedUser.permissions.includes(perm.id)}
                      />
                      <Label className="text-sm">{perm.label}</Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <Switch checked={selectedUser.twoFactorEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Verified</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    <Badge variant={selectedUser.emailVerified ? 'default' : 'secondary'}>
                      {selectedUser.emailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Force Logout All Sessions
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowEditDialog(false);
                toast({
                  title: "User Updated",
                  description: "User details have been saved"
                });
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;