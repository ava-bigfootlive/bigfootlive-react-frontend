import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Shield,
  Settings,
  Key,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  Upload,
  TestTube,
  Save,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  ExternalLink,
  Lock,
  Users,
  Building
} from 'lucide-react';
import api from '../services/api';

interface SAMLConfig {
  id: string;
  tenant_id: string;
  tenant_name: string;
  enabled: boolean;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_certificate: string;
  sp_entity_id: string;
  sp_acs_url: string;
  attribute_mapping: {
    email?: string;
    first_name?: string;
    last_name?: string;
    groups?: string;
    [key: string]: string | undefined;
  };
  default_role?: string;
  auto_create_users: boolean;
  allow_unencrypted_assertions: boolean;
  signature_algorithm: string;
  created_at: string;
  updated_at: string;
  last_tested?: string;
  test_status?: 'success' | 'failed' | 'pending';
}

interface AttributeMapping {
  local_attribute: string;
  saml_attribute: string;
  required: boolean;
}

export default function SAMLConfiguration() {
  const [configs, setConfigs] = useState<SAMLConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SAMLConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state
  const [formData, setFormData] = useState<Partial<SAMLConfig>>({
    enabled: false,
    idp_entity_id: '',
    idp_sso_url: '',
    idp_certificate: '',
    attribute_mapping: {
      email: 'email',
      first_name: 'firstName',
      last_name: 'lastName',
      groups: 'groups'
    },
    auto_create_users: true,
    allow_unencrypted_assertions: false,
    signature_algorithm: 'RSA_SHA256'
  });

  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([
    { local_attribute: 'email', saml_attribute: 'email', required: true },
    { local_attribute: 'first_name', saml_attribute: 'firstName', required: false },
    { local_attribute: 'last_name', saml_attribute: 'lastName', required: false },
    { local_attribute: 'groups', saml_attribute: 'groups', required: false }
  ]);

  useEffect(() => {
    loadSAMLConfigs();
  }, []);

  const loadSAMLConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/tenant/saml/configurations');
      setConfigs(response.data || []);
      if (response.data?.length > 0) {
        setSelectedConfig(response.data[0]);
        populateForm(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load SAML configurations:', error);
      // Load demo data
      const demoConfigs: SAMLConfig[] = [
        {
          id: 'demo-1',
          tenant_id: 'tenant-1',
          tenant_name: 'Acme Corporation',
          enabled: true,
          idp_entity_id: 'http://www.okta.com/exk1fxpvhzZTI1234',
          idp_sso_url: 'https://acme.okta.com/app/acme_bigfootlive_1/exk1fxpvhzZTI1234/sso/saml',
          idp_certificate: '-----BEGIN CERTIFICATE-----\nMIIDpDCCAoygAwIBAgIGAV2k...\n-----END CERTIFICATE-----',
          sp_entity_id: 'https://bigfootlive.io/saml/acme',
          sp_acs_url: 'https://api.bigfootlive.io/api/v1/auth/saml/callback',
          attribute_mapping: {
            email: 'email',
            first_name: 'firstName',
            last_name: 'lastName',
            groups: 'groups'
          },
          default_role: 'viewer',
          auto_create_users: true,
          allow_unencrypted_assertions: false,
          signature_algorithm: 'RSA_SHA256',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          last_tested: new Date(Date.now() - 3600000).toISOString(),
          test_status: 'success'
        }
      ];
      setConfigs(demoConfigs);
      setSelectedConfig(demoConfigs[0]);
      populateForm(demoConfigs[0]);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (config: SAMLConfig) => {
    setFormData(config);
    if (config.attribute_mapping) {
      const mappings: AttributeMapping[] = Object.entries(config.attribute_mapping).map(([local, saml]) => ({
        local_attribute: local,
        saml_attribute: saml || '',
        required: local === 'email'
      }));
      setAttributeMappings(mappings);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert attribute mappings back to object format
      const attribute_mapping: { [key: string]: string } = {};
      attributeMappings.forEach(mapping => {
        if (mapping.saml_attribute) {
          attribute_mapping[mapping.local_attribute] = mapping.saml_attribute;
        }
      });

      const dataToSave = {
        ...formData,
        attribute_mapping
      };

      if (selectedConfig) {
        await api.put(`/api/v1/tenant/saml/configurations/${selectedConfig.id}`, dataToSave);
        toast.success('SAML configuration updated successfully');
      } else {
        await api.post('/api/v1/tenant/saml/configurations', dataToSave);
        toast.success('SAML configuration created successfully');
      }
      
      await loadSAMLConfigs();
    } catch (error) {
      console.error('Failed to save SAML configuration:', error);
      toast.error('Failed to save SAML configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await api.post(`/api/v1/tenant/saml/test/${selectedConfig?.id}`);
      toast.success('SAML test initiated. Check your IdP for login prompt.');
    } catch (error) {
      console.error('SAML test failed:', error);
      toast.error('SAML test failed. Please check your configuration.');
    } finally {
      setTesting(false);
    }
  };

  const downloadMetadata = () => {
    const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${formData.sp_entity_id || 'https://bigfootlive.io/saml/sp'}">
  <SPSSODescriptor AuthnRequestsSigned="false" 
                   WantAssertionsSigned="true"
                   protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                              Location="${formData.sp_acs_url || 'https://api.bigfootlive.io/api/v1/auth/saml/callback'}"
                              index="1" />
  </SPSSODescriptor>
</EntityDescriptor>`;
    
    const blob = new Blob([metadata], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bigfootlive-sp-metadata.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SP metadata downloaded');
  };

  const addAttributeMapping = () => {
    setAttributeMappings([
      ...attributeMappings,
      { local_attribute: '', saml_attribute: '', required: false }
    ]);
  };

  const removeAttributeMapping = (index: number) => {
    setAttributeMappings(attributeMappings.filter((_, i) => i !== index));
  };

  const updateAttributeMapping = (index: number, field: keyof AttributeMapping, value: string | boolean) => {
    const updated = [...attributeMappings];
    updated[index] = { ...updated[index], [field]: value };
    setAttributeMappings(updated);
  };

  return (
    <DashboardLayout
      title="SAML Configuration"
      subtitle="Configure Single Sign-On for your organization"
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5 text-blue-500" />
                <Badge variant={selectedConfig?.enabled ? 'default' : 'secondary'}>
                  {selectedConfig?.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">SSO Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedConfig?.enabled ? 'Users can sign in via SSO' : 'SSO is currently disabled'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TestTube className="h-5 w-5 text-green-500" />
                <Badge variant={
                  selectedConfig?.test_status === 'success' ? 'default' :
                  selectedConfig?.test_status === 'failed' ? 'destructive' : 'secondary'
                }>
                  {selectedConfig?.test_status || 'Not Tested'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Last Test</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedConfig?.last_tested 
                  ? new Date(selectedConfig.last_tested).toLocaleString()
                  : 'Never tested'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-purple-500" />
                <Badge>{selectedConfig?.auto_create_users ? 'Auto' : 'Manual'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">User Provisioning</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedConfig?.auto_create_users 
                  ? 'Users created automatically'
                  : 'Users must be pre-provisioned'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Identity Provider Configuration</CardTitle>
            <CardDescription>
              Configure your SAML 2.0 identity provider settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="idp">Identity Provider</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable SAML SSO</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to sign in using your identity provider
                      </p>
                    </div>
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Service Provider Information</AlertTitle>
                    <AlertDescription className="space-y-2 mt-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm font-medium">Entity ID:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs">{formData.sp_entity_id || 'https://bigfootlive.io/saml/sp'}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(formData.sp_entity_id || 'https://bigfootlive.io/saml/sp');
                                toast.success('Copied to clipboard');
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm font-medium">ACS URL:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs">{formData.sp_acs_url || 'https://api.bigfootlive.io/api/v1/auth/saml/callback'}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(formData.sp_acs_url || 'https://api.bigfootlive.io/api/v1/auth/saml/callback');
                                toast.success('Copied to clipboard');
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadMetadata}
                        className="w-full mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download SP Metadata
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="idp" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idp-entity-id">Identity Provider Entity ID</Label>
                    <Input
                      id="idp-entity-id"
                      placeholder="http://www.okta.com/exk..."
                      value={formData.idp_entity_id}
                      onChange={(e) => setFormData({ ...formData, idp_entity_id: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      The unique identifier for your identity provider
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idp-sso-url">Single Sign-On URL</Label>
                    <Input
                      id="idp-sso-url"
                      placeholder="https://your-domain.okta.com/app/..."
                      value={formData.idp_sso_url}
                      onChange={(e) => setFormData({ ...formData, idp_sso_url: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      The URL where authentication requests will be sent
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idp-cert">X.509 Certificate</Label>
                    <Textarea
                      id="idp-cert"
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      value={formData.idp_certificate}
                      onChange={(e) => setFormData({ ...formData, idp_certificate: e.target.value })}
                      className="font-mono text-xs"
                      rows={10}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Public certificate used to verify SAML assertions
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('cert-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Certificate
                      </Button>
                      <input
                        id="cert-upload"
                        type="file"
                        accept=".pem,.crt,.cer"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setFormData({ ...formData, idp_certificate: e.target?.result as string });
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium">Attribute Mapping</h3>
                      <p className="text-xs text-muted-foreground">
                        Map SAML attributes to user properties
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={addAttributeMapping}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mapping
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {attributeMappings.map((mapping, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Input
                          placeholder="Local attribute"
                          value={mapping.local_attribute}
                          onChange={(e) => updateAttributeMapping(index, 'local_attribute', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">→</span>
                        <Input
                          placeholder="SAML attribute"
                          value={mapping.saml_attribute}
                          onChange={(e) => updateAttributeMapping(index, 'saml_attribute', e.target.value)}
                          className="flex-1"
                        />
                        <Switch
                          checked={mapping.required}
                          onCheckedChange={(checked) => updateAttributeMapping(index, 'required', checked)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttributeMapping(index)}
                          disabled={mapping.local_attribute === 'email'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Common Attributes</AlertTitle>
                    <AlertDescription>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div><code>email</code> → User's email address</div>
                        <div><code>firstName</code> → User's first name</div>
                        <div><code>lastName</code> → User's last name</div>
                        <div><code>groups</code> → User's group memberships</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-role">Default User Role</Label>
                    <Select
                      value={formData.default_role || 'viewer'}
                      onValueChange={(value) => setFormData({ ...formData, default_role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Role assigned to new users created via SSO
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sig-algo">Signature Algorithm</Label>
                    <Select
                      value={formData.signature_algorithm || 'RSA_SHA256'}
                      onValueChange={(value) => setFormData({ ...formData, signature_algorithm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSA_SHA256">RSA-SHA256</SelectItem>
                        <SelectItem value="RSA_SHA1">RSA-SHA1</SelectItem>
                        <SelectItem value="RSA_SHA384">RSA-SHA384</SelectItem>
                        <SelectItem value="RSA_SHA512">RSA-SHA512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-create Users</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically create user accounts on first SSO login
                        </p>
                      </div>
                      <Switch
                        checked={formData.auto_create_users}
                        onCheckedChange={(checked) => setFormData({ ...formData, auto_create_users: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Allow Unencrypted Assertions</Label>
                        <p className="text-xs text-muted-foreground">
                          Accept SAML assertions without encryption (less secure)
                        </p>
                      </div>
                      <Switch
                        checked={formData.allow_unencrypted_assertions}
                        onCheckedChange={(checked) => setFormData({ ...formData, allow_unencrypted_assertions: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={!formData.idp_sso_url || !formData.idp_certificate || testing}
                >
                  {testing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Configuration
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(formData.idp_sso_url, '_blank')}
                  disabled={!formData.idp_sso_url}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open IdP Console
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadSAMLConfigs()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.idp_entity_id || !formData.idp_sso_url}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}