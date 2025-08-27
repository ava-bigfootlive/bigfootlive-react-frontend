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
import { Building2, MoreVertical, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: string;
  user_count?: number;
  storage_used?: number;
  admin_email?: string;
}

export default function TenantManagement() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    admin_email: '',
    plan: 'free' as Tenant['plan'],
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.getTenants();
      
      // If backend returns empty or error, show sample data for demo
      if (!response || response.length === 0) {
        // Sample data for demonstration - remove when backend is fully implemented
        const sampleTenants: Tenant[] = [
          {
            id: 'tenant-1',
            name: 'Acme Corporation',
            subdomain: 'acme',
            status: 'active',
            plan: 'pro',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            user_count: 25,
            storage_used: 15.2,
            admin_email: 'admin@acme.com',
          },
          {
            id: 'tenant-2',
            name: 'Tech Startup Inc',
            subdomain: 'techstartup',
            status: 'active',
            plan: 'starter',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            user_count: 8,
            storage_used: 3.7,
            admin_email: 'cto@techstartup.io',
          },
          {
            id: 'tenant-3',
            name: 'Enterprise Corp',
            subdomain: 'enterprise',
            status: 'active',
            plan: 'enterprise',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            user_count: 150,
            storage_used: 85.5,
            admin_email: 'it@enterprise.com',
          },
          {
            id: 'tenant-4',
            name: 'Beta Testers LLC',
            subdomain: 'beta',
            status: 'inactive',
            plan: 'free',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            user_count: 3,
            storage_used: 0.5,
            admin_email: 'test@beta.dev',
          },
        ];
        setTenants(sampleTenants);
        toast({
          title: 'Info',
          description: 'Showing sample data. Connect to backend for real data.',
        });
      } else {
        setTenants(response);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      // Show sample data even on error for better UX
      const sampleTenants: Tenant[] = [
        {
          id: 'demo-tenant',
          name: 'Demo Organization',
          subdomain: 'demo',
          status: 'active',
          plan: 'free',
          created_at: new Date().toISOString(),
          user_count: 1,
        },
      ];
      setTenants(sampleTenants);
      toast({
        title: 'Warning',
        description: 'Using demo data. Backend connection unavailable.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      const newTenant = await api.createTenant({
        ...formData,
        status: 'active',
      });
      setTenants([...tenants, newTenant]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Tenant created successfully.',
      });
    } catch (error) {
      console.error('Failed to create tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      const updatedTenant = await api.updateTenant(selectedTenant.id, formData);
      setTenants(tenants.map(t => t.id === selectedTenant.id ? updatedTenant : t));
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Tenant updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      await api.deleteTenant(selectedTenant.id);
      setTenants(tenants.filter(t => t.id !== selectedTenant.id));
      setIsDeleteDialogOpen(false);
      setSelectedTenant(null);
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subdomain: '',
      admin_email: '',
      plan: 'free',
    });
    setSelectedTenant(null);
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      subdomain: tenant.subdomain,
      admin_email: tenant.admin_email || '',
      plan: tenant.plan,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: Tenant['status']) => {
    const variants = {
      active: 'status-success',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      suspended: 'status-error',
    };
    return (
      <Badge variant="outline" className={cn('font-medium px-3 py-1', variants[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (plan: Tenant['plan']) => {
    const variants = {
      free: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      starter: 'status-info',
      pro: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      enterprise: 'status-warning',
    };
    return (
      <Badge variant="outline" className={cn('font-medium px-3 py-1', variants[plan])}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="card-modern animate-fade-in" style={{
        backgroundColor: 'hsl(var(--surface))',
        borderColor: 'hsl(var(--border))'
      }}>
        <CardHeader className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex justify-between items-center">
            <div className="animate-slide-in">
              <CardTitle className="text-title flex items-center gap-3" style={{ color: 'hsl(var(--foreground))' }}>
                <Building2 className="h-6 w-6" style={{ color: 'hsl(var(--brand-primary))' }} />
                Tenant Management
              </CardTitle>
              <CardDescription className="text-subtitle mt-2">
                View and manage all platform tenants
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn-primary shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background: 'hsl(var(--button-primary))',
                color: 'white'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(var(--foreground-tertiary))' }} />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "input-modern pl-9 text-base",
                  "transition-all duration-200 focus:shadow-lg"
                )}
                style={{
                  backgroundColor: 'hsl(var(--input-background))',
                  borderColor: 'hsl(var(--input-border))',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </div>
          </div>

          {/* Tenants Table */}
          {loading ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--surface-elevated))' }}>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" style={{ borderColor: 'hsl(var(--brand-primary))' }}></div>
                <span className="text-body" style={{ color: 'hsl(var(--foreground-secondary))' }}>Loading tenants...</span>
              </div>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="card-elevated p-8 max-w-sm mx-auto">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'hsl(var(--foreground-tertiary))' }} />
                <p className="text-body" style={{ color: 'hsl(var(--foreground-secondary))' }}>No tenants found</p>
                <p className="text-caption mt-2" style={{ color: 'hsl(var(--foreground-tertiary))' }}>Try adjusting your search terms</p>
              </div>
            </div>
          ) : (
            <div className="card-elevated rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))' }}>
                    <TableHead className="text-overline font-semibold px-6 py-4" style={{ color: 'hsl(var(--foreground-secondary))' }}>Name</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Subdomain</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Plan</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Status</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Users</TableHead>
                    <TableHead className="text-overline font-semibold" style={{ color: 'hsl(var(--foreground-secondary))' }}>Created</TableHead>
                    <TableHead className="text-overline font-semibold text-right px-6" style={{ color: 'hsl(var(--foreground-secondary))' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant, index) => (
                    <TableRow 
                      key={tenant.id} 
                      className="animate-fade-in transition-colors duration-200 hover:bg-[hsl(var(--surface-overlay))]" 
                      style={{ 
                        borderColor: 'hsl(var(--border))',
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <TableCell className="font-medium px-6 py-4" style={{ color: 'hsl(var(--foreground))' }}>{tenant.name}</TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>{tenant.subdomain}</TableCell>
                      <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>{tenant.user_count || 0}</TableCell>
                      <TableCell className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                        {new Date(tenant.created_at).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => openEditDialog(tenant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(tenant)}
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

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>
              Add a new tenant to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tenant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                placeholder="acme"
              />
            </div>
            <div>
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input
                id="admin_email"
                type="email"
                value={formData.admin_email}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                placeholder="admin@acme.com"
              />
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                className="w-full p-2 rounded-md bg-background border border-border"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as Tenant['plan'] })}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTenant}>Create Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tenant Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-subdomain">Subdomain</Label>
              <Input
                id="edit-subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-admin_email">Admin Email</Label>
              <Input
                id="edit-admin_email"
                type="email"
                value={formData.admin_email}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-plan">Plan</Label>
              <select
                id="edit-plan"
                className="w-full p-2 rounded-md bg-background border border-border"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as Tenant['plan'] })}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTenant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tenant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <Alert>
              <AlertDescription>
                You are about to delete <strong>{selectedTenant.name}</strong> ({selectedTenant.subdomain})
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTenant}>
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}