import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Copy,
  MoreHorizontal,
  Trash2,
  Edit,
  Share
} from 'lucide-react';

interface OverlayTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  overlay_type: string;
  width: number;
  height: number;
  usage_count: number;
  is_public: boolean;
  created_at: string;
  tenant_id: string;
  created_by_id: string;
  recent_usage_count?: number;
  avg_engagement_increase?: number;
}

interface TemplateLibraryProps {
  onSelectTemplate?: (template: OverlayTemplate) => void;
  onEditTemplate?: (template: OverlayTemplate) => void;
  onCreateFromTemplate?: (template: OverlayTemplate) => void;
  className?: string;
}

const OVERLAY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'lower_third', label: 'Lower Third' },
  { value: 'chyron', label: 'Chyron/Ticker' },
  { value: 'full_screen', label: 'Full Screen' },
  { value: 'corner_bug', label: 'Corner Bug' },
  { value: 'countdown', label: 'Countdown' },
  { value: 'data_display', label: 'Data Display' }
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'News', label: 'News' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Education', label: 'Education' },
  { value: 'Gaming', label: 'Gaming' }
];

export const OverlayTemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
  onEditTemplate,
  onCreateFromTemplate,
  className = ''
}) => {
  const [templates, setTemplates] = useState<OverlayTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<OverlayTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<OverlayTemplate | null>(null);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/overlays/templates?include_public=true');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.overlay_type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.usage_count - a.usage_count);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'engagement':
        filtered.sort((a, b) => (b.avg_engagement_increase || 0) - (a.avg_engagement_increase || 0));
        break;
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedType, selectedCategory, sortBy]);

  const handleUseTemplate = async (template: OverlayTemplate) => {
    try {
      // Increment usage count
      await fetch(`/api/v1/overlays/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usage_count: template.usage_count + 1 })
      });

      onSelectTemplate?.(template);
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const handleCloneTemplate = async (template: OverlayTemplate) => {
    try {
      const clonedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        is_public: false
      };
      delete (clonedTemplate as any).id;
      delete (clonedTemplate as any).created_at;
      delete (clonedTemplate as any).updated_at;
      delete (clonedTemplate as any).tenant_id;
      delete (clonedTemplate as any).created_by_id;

      const response = await fetch('/api/v1/overlays/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clonedTemplate)
      });

      if (response.ok) {
        fetchTemplates(); // Refresh list
      }
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/v1/overlays/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      lower_third: '📝',
      chyron: '📺',
      full_screen: '🖥️',
      corner_bug: '🏷️',
      countdown: '⏰',
      data_display: '📊'
    };
    return icons[type] || '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overlay-template-library ${className}`}>
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OVERLAY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {filteredTemplates.length} Templates Found
        </h3>
      </div>

      {/* Template Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(template.overlay_type)}</span>
                    <div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.is_public && (
                          <Badge variant="secondary" className="text-xs">
                            <Share className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Template Actions</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => onEditTemplate?.(template)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Template
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleCloneTemplate(template)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Clone Template
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Template
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span>{template.width}×{template.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <span>{template.usage_count} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(template.created_at)}</span>
                  </div>
                  {template.avg_engagement_increase !== undefined && (
                    <div className="flex justify-between">
                      <span>Avg. Engagement:</span>
                      <span className="text-green-600">
                        +{Math.round(template.avg_engagement_increase)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Template Preview: {template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Template preview would go here */}
                        <div className="bg-gray-100 p-4 rounded">
                          <p>Template preview functionality would be implemented here</p>
                          <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
                            {JSON.stringify({
                              type: template.overlay_type,
                              dimensions: `${template.width}×${template.height}`,
                              category: template.category
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No templates found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};