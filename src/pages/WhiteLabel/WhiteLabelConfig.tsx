import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Palette,
  Upload,
  Download,
  Eye,
  Save,
  RefreshCw,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Monitor,
  Code,
  Image,
  Type,
  Layout,
  Settings,
  Check,
  X,
  Info,
  AlertCircle,
  Sparkles,
  Zap,
  Crown,
  Building,
  CreditCard,
  Key,
  Lock,
  Unlock,
  Sun,
  Moon,
  ChevronRight,
  Copy
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BrandConfig {
  id: string;
  name: string;
  logo: {
    light: string;
    dark: string;
    favicon: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: {
      base: number;
      scale: number;
    };
  };
  layout: {
    borderRadius: number;
    spacing: number;
    maxWidth: string;
  };
  customCSS?: string;
  customJS?: string;
  domains: {
    primary: string;
    aliases: string[];
  };
  features: {
    chat: boolean;
    reactions: boolean;
    polls: boolean;
    qa: boolean;
    virtualGifts: boolean;
    subscriptions: boolean;
    ppv: boolean;
    ads: boolean;
  };
  legal: {
    termsUrl?: string;
    privacyUrl?: string;
    cookiePolicyUrl?: string;
  };
  contact: {
    supportEmail?: string;
    supportPhone?: string;
    address?: string;
  };
}

export const WhiteLabelConfig: React.FC = () => {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    id: '1',
    name: 'My Brand',
    logo: {
      light: 'https://placehold.co/200x50',
      dark: 'https://placehold.co/200x50',
      favicon: 'https://placehold.co/32x32'
    },
    colors: {
      primary: '#8b5cf6',
      secondary: '#3b82f6',
      accent: '#10b981',
      background: '#ffffff',
      foreground: '#0a0a0a',
      muted: '#f3f4f6',
      border: '#e5e7eb'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: {
        base: 16,
        scale: 1.25
      }
    },
    layout: {
      borderRadius: 8,
      spacing: 4,
      maxWidth: '1280px'
    },
    domains: {
      primary: 'mybrand.com',
      aliases: ['www.mybrand.com', 'stream.mybrand.com']
    },
    features: {
      chat: true,
      reactions: true,
      polls: true,
      qa: true,
      virtualGifts: true,
      subscriptions: true,
      ppv: true,
      ads: false
    },
    legal: {
      termsUrl: 'https://mybrand.com/terms',
      privacyUrl: 'https://mybrand.com/privacy',
      cookiePolicyUrl: 'https://mybrand.com/cookies'
    },
    contact: {
      supportEmail: 'support@mybrand.com',
      supportPhone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001'
    }
  });

  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [showPreview, setShowPreview] = useState(false);
  const [configStatus, setConfigStatus] = useState<'draft' | 'published'>('draft');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Raleway',
    'Source Sans Pro',
    'Ubuntu'
  ];

  const validateConfig = () => {
    const errors: string[] = [];
    
    if (!brandConfig.name) errors.push('Brand name is required');
    if (!brandConfig.logo.light) errors.push('Light logo is required');
    if (!brandConfig.domains.primary) errors.push('Primary domain is required');
    if (!brandConfig.contact.supportEmail) errors.push('Support email is required');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const publishConfig = () => {
    if (!validateConfig()) {
      toast({
        title: "Validation Failed",
        description: "Please fix the errors before publishing",
        variant: "destructive"
      });
      return;
    }

    setConfigStatus('published');
    toast({
      title: "Configuration Published",
      description: "Your white label configuration is now live"
    });
  };

  const exportConfig = () => {
    const configJson = JSON.stringify(brandConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brandConfig.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    link.click();
    
    toast({
      title: "Configuration Exported",
      description: "Your configuration has been downloaded"
    });
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setBrandConfig(config);
        toast({
          title: "Configuration Imported",
          description: "Your configuration has been loaded successfully"
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid configuration file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const generateAPIKey = () => {
    const key = `wl_${Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('')}`;
    
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Generated",
      description: "New API key copied to clipboard"
    });
  };

  const completionScore = () => {
    let score = 0;
    const totalFields = 20;
    
    if (brandConfig.name) score++;
    if (brandConfig.logo.light) score++;
    if (brandConfig.logo.dark) score++;
    if (brandConfig.logo.favicon) score++;
    if (brandConfig.domains.primary) score++;
    if (brandConfig.domains.aliases.length > 0) score++;
    if (brandConfig.legal.termsUrl) score++;
    if (brandConfig.legal.privacyUrl) score++;
    if (brandConfig.contact.supportEmail) score++;
    if (brandConfig.contact.supportPhone) score++;
    
    return Math.round((score / totalFields) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            White Label Configuration
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
          </h1>
          <p className="text-muted-foreground">Customize your platform branding and features</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
            id="import-config"
          />
          <Label htmlFor="import-config">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </Label>
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={publishConfig}>
            <Save className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Status and Progress */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {configStatus === 'published' ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Published</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Draft</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={completionScore()} className="flex-1" />
              <span className="text-sm font-medium">{completionScore()}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Domain Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">{brandConfig.domains.primary}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Tabs */}
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Configure your brand name and logos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={brandConfig.name}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    name: e.target.value
                  })}
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Light Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <img
                      src={brandConfig.logo.light}
                      alt="Light Logo"
                      className="h-12 mx-auto mb-2"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Dark Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center bg-slate-900">
                    <img
                      src={brandConfig.logo.dark}
                      alt="Dark Logo"
                      className="h-12 mx-auto mb-2"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <img
                      src={brandConfig.logo.favicon}
                      alt="Favicon"
                      className="h-8 w-8 mx-auto mb-2"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Contact Information</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={brandConfig.contact.supportEmail}
                      onChange={(e) => setBrandConfig({
                        ...brandConfig,
                        contact: {
                          ...brandConfig.contact,
                          supportEmail: e.target.value
                        }
                      })}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Support Phone</Label>
                    <Input
                      id="support-phone"
                      value={brandConfig.contact.supportPhone}
                      onChange={(e) => setBrandConfig({
                        ...brandConfig,
                        contact: {
                          ...brandConfig.contact,
                          supportPhone: e.target.value
                        }
                      })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your platform colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(brandConfig.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`color-${key}`} className="capitalize">
                      {key} Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`color-${key}`}
                        type="color"
                        value={value}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          colors: {
                            ...brandConfig.colors,
                            [key]: e.target.value
                          }
                        })}
                        className="w-16 h-9 p-1"
                      />
                      <Input
                        value={value}
                        onChange={(e) => setBrandConfig({
                          ...brandConfig,
                          colors: {
                            ...brandConfig.colors,
                            [key]: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Configure fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heading-font">Heading Font</Label>
                  <Select
                    value={brandConfig.typography.headingFont}
                    onValueChange={(value) => setBrandConfig({
                      ...brandConfig,
                      typography: {
                        ...brandConfig.typography,
                        headingFont: value
                      }
                    })}
                  >
                    <SelectTrigger id="heading-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body-font">Body Font</Label>
                  <Select
                    value={brandConfig.typography.bodyFont}
                    onValueChange={(value) => setBrandConfig({
                      ...brandConfig,
                      typography: {
                        ...brandConfig.typography,
                        bodyFont: value
                      }
                    })}
                  >
                    <SelectTrigger id="body-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base-size">Base Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="base-size"
                      value={[brandConfig.typography.fontSize.base]}
                      onValueChange={(value) => setBrandConfig({
                        ...brandConfig,
                        typography: {
                          ...brandConfig.typography,
                          fontSize: {
                            ...brandConfig.typography.fontSize,
                            base: value[0]
                          }
                        }
                      })}
                      min={12}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">
                      {brandConfig.typography.fontSize.base}px
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="border-radius"
                      value={[brandConfig.layout.borderRadius]}
                      onValueChange={(value) => setBrandConfig({
                        ...brandConfig,
                        layout: {
                          ...brandConfig.layout,
                          borderRadius: value[0]
                        }
                      })}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">
                      {brandConfig.layout.borderRadius}px
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Enable or disable platform functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Interactive Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-chat">Live Chat</Label>
                        <p className="text-sm text-muted-foreground">
                          Real-time chat during streams
                        </p>
                      </div>
                      <Switch
                        id="feature-chat"
                        checked={brandConfig.features.chat}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            chat: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-reactions">Reactions</Label>
                        <p className="text-sm text-muted-foreground">
                          Emoji reactions and animations
                        </p>
                      </div>
                      <Switch
                        id="feature-reactions"
                        checked={brandConfig.features.reactions}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            reactions: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-polls">Polls</Label>
                        <p className="text-sm text-muted-foreground">
                          Interactive polls and voting
                        </p>
                      </div>
                      <Switch
                        id="feature-polls"
                        checked={brandConfig.features.polls}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            polls: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-qa">Q&A System</Label>
                        <p className="text-sm text-muted-foreground">
                          Question and answer functionality
                        </p>
                      </div>
                      <Switch
                        id="feature-qa"
                        checked={brandConfig.features.qa}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            qa: checked
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Monetization Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-subscriptions">Subscriptions</Label>
                        <p className="text-sm text-muted-foreground">
                          Recurring subscription plans
                        </p>
                      </div>
                      <Switch
                        id="feature-subscriptions"
                        checked={brandConfig.features.subscriptions}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            subscriptions: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-ppv">Pay-Per-View</Label>
                        <p className="text-sm text-muted-foreground">
                          One-time payment events
                        </p>
                      </div>
                      <Switch
                        id="feature-ppv"
                        checked={brandConfig.features.ppv}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            ppv: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-gifts">Virtual Gifts</Label>
                        <p className="text-sm text-muted-foreground">
                          Digital gifts and tips
                        </p>
                      </div>
                      <Switch
                        id="feature-gifts"
                        checked={brandConfig.features.virtualGifts}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            virtualGifts: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feature-ads">Advertising</Label>
                        <p className="text-sm text-muted-foreground">
                          Display ads and sponsorships
                        </p>
                      </div>
                      <Switch
                        id="feature-ads"
                        checked={brandConfig.features.ads}
                        onCheckedChange={(checked) => setBrandConfig({
                          ...brandConfig,
                          features: {
                            ...brandConfig.features,
                            ads: checked
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
              <CardDescription>Configure your custom domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-domain">Primary Domain</Label>
                <Input
                  id="primary-domain"
                  value={brandConfig.domains.primary}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    domains: {
                      ...brandConfig.domains,
                      primary: e.target.value
                    }
                  })}
                  placeholder="example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Domain Aliases</Label>
                <div className="space-y-2">
                  {brandConfig.domains.aliases.map((alias, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={alias}
                        onChange={(e) => {
                          const newAliases = [...brandConfig.domains.aliases];
                          newAliases[idx] = e.target.value;
                          setBrandConfig({
                            ...brandConfig,
                            domains: {
                              ...brandConfig.domains,
                              aliases: newAliases
                            }
                          });
                        }}
                        placeholder="www.example.com"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newAliases = brandConfig.domains.aliases.filter((_, i) => i !== idx);
                          setBrandConfig({
                            ...brandConfig,
                            domains: {
                              ...brandConfig.domains,
                              aliases: newAliases
                            }
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setBrandConfig({
                      ...brandConfig,
                      domains: {
                        ...brandConfig.domains,
                        aliases: [...brandConfig.domains.aliases, '']
                      }
                    })}
                  >
                    Add Alias
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To complete domain setup, add the following DNS records:
                  <pre className="mt-2 text-xs bg-muted p-2 rounded">
                    A     @ → 192.0.2.1
                    CNAME www → {brandConfig.domains.primary}
                  </pre>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SSL Configuration</CardTitle>
              <CardDescription>Secure your domains with SSL certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{brandConfig.domains.primary}</p>
                      <p className="text-sm text-muted-foreground">SSL Certificate Active</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Auto-renew</Badge>
                </div>
                
                {brandConfig.domains.aliases.map((alias, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{alias}</p>
                        <p className="text-sm text-muted-foreground">SSL Certificate Active</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Auto-renew</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Pages</CardTitle>
              <CardDescription>Configure legal and compliance pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms-url">Terms of Service URL</Label>
                <Input
                  id="terms-url"
                  value={brandConfig.legal.termsUrl}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    legal: {
                      ...brandConfig.legal,
                      termsUrl: e.target.value
                    }
                  })}
                  placeholder="https://example.com/terms"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                <Input
                  id="privacy-url"
                  value={brandConfig.legal.privacyUrl}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    legal: {
                      ...brandConfig.legal,
                      privacyUrl: e.target.value
                    }
                  })}
                  placeholder="https://example.com/privacy"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cookie-url">Cookie Policy URL</Label>
                <Input
                  id="cookie-url"
                  value={brandConfig.legal.cookiePolicyUrl}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    legal: {
                      ...brandConfig.legal,
                      cookiePolicyUrl: e.target.value
                    }
                  })}
                  placeholder="https://example.com/cookies"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Code</CardTitle>
              <CardDescription>Add custom CSS and JavaScript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={brandConfig.customCSS}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    customCSS: e.target.value
                  })}
                  placeholder="/* Your custom CSS */"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-js">Custom JavaScript</Label>
                <Textarea
                  id="custom-js"
                  value={brandConfig.customJS}
                  onChange={(e) => setBrandConfig({
                    ...brandConfig,
                    customJS: e.target.value
                  })}
                  placeholder="// Your custom JavaScript"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage API access and webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value="wl_********************************"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={generateAPIKey}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Keep your API key secure. It provides full access to your white label configuration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Panel */}
      {showPreview && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Live Preview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('dark')}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg border p-8"
              style={{
                backgroundColor: previewMode === 'light' 
                  ? brandConfig.colors.background 
                  : '#0a0a0a',
                color: previewMode === 'light'
                  ? brandConfig.colors.foreground
                  : '#fafafa',
                fontFamily: brandConfig.typography.bodyFont
              }}
            >
              <img
                src={previewMode === 'light' ? brandConfig.logo.light : brandConfig.logo.dark}
                alt="Logo"
                className="h-12 mb-6"
              />
              <h1
                style={{
                  fontFamily: brandConfig.typography.headingFont,
                  fontSize: `${brandConfig.typography.fontSize.base * 2}px`,
                  color: brandConfig.colors.primary
                }}
                className="mb-4"
              >
                Welcome to {brandConfig.name}
              </h1>
              <p className="mb-4">
                Experience the power of white-label streaming with your custom branding.
              </p>
              <div className="flex gap-2">
                <button
                  style={{
                    backgroundColor: brandConfig.colors.primary,
                    color: '#ffffff',
                    borderRadius: `${brandConfig.layout.borderRadius}px`,
                    padding: '8px 16px'
                  }}
                >
                  Primary Button
                </button>
                <button
                  style={{
                    backgroundColor: brandConfig.colors.secondary,
                    color: '#ffffff',
                    borderRadius: `${brandConfig.layout.borderRadius}px`,
                    padding: '8px 16px'
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhiteLabelConfig;