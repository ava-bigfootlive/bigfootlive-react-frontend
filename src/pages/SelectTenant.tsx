import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, ChevronRight, Loader2, Plus } from 'lucide-react';
import api from '../services/api';

interface Tenant {
  id: string;
  name: string;
  description?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function SelectTenantPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenants/my-tenants');
      if (response.data && Array.isArray(response.data)) {
        setTenants(response.data);
        
        // If only one tenant, auto-select it
        if (response.data.length === 1) {
          await selectTenant(response.data[0].id);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch tenants:', error);
      setError('Failed to load your organizations');
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = async (tenantId: string) => {
    try {
      setSelectedTenant(tenantId);
      
      // Set the selected tenant in the API context
      await api.post('/tenants/select', { tenantId });
      
      // Store in localStorage for persistence
      localStorage.setItem('selectedTenantId', tenantId);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to select tenant:', error);
      setError('Failed to select organization');
      setSelectedTenant(null);
    }
  };

  const createNewTenant = () => {
    // Navigate to tenant creation flow
    navigate('/tenants/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-300">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Select Organization</h1>
          <p className="mt-2 text-gray-300">
            Choose an organization to continue
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {tenants.length > 0 ? (
            tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:border-blue-500 ${
                  selectedTenant === tenant.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => selectTenant(tenant.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {tenant.name}
                        </h3>
                        {tenant.description && (
                          <p className="text-sm text-gray-400 mt-1">
                            {tenant.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tenant.status === 'active' 
                              ? 'bg-green-500/20 text-green-400'
                              : tenant.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {tenant.status}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {tenant.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Organizations Found
                </h3>
                <p className="text-gray-400 mb-6">
                  You're not a member of any organizations yet.
                </p>
                <Button onClick={createNewTenant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Organization
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {tenants.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={createNewTenant}
              className="text-gray-300 border-gray-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Organization
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}