import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, Server, Code, Blocks, 
  TestTube, Github, Palette, Database, Globe
} from 'lucide-react';

export function MCPDemo() {
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('');

  const mcpServers = [
    // Frontend & UI
    { id: 'shadcn', name: 'shadcn MCP', icon: Palette, description: 'Component library', category: 'Frontend' },
    { id: 'react', name: 'React MCP', icon: Code, description: 'React development', category: 'Frontend' },
    
    // Cloud Infrastructure
    { id: 'aws-api', name: 'AWS API MCP', icon: Cloud, description: 'AWS services control', category: 'Infrastructure' },
    { id: 'aws-ecs', name: 'AWS ECS MCP', icon: Server, description: 'Container management', category: 'Infrastructure' },
    { id: 'aws-s3', name: 'AWS S3 Tables', icon: Database, description: 'S3 data operations', category: 'Infrastructure' },
    { id: 'terraform', name: 'Terraform MCP', icon: Blocks, description: 'Infrastructure as Code', category: 'Infrastructure' },
    
    // Development & Testing
    { id: 'playwright', name: 'Playwright MCP', icon: TestTube, description: 'Browser automation', category: 'Testing' },
    { id: 'github', name: 'GitHub MCP', icon: Github, description: 'Repository & CI/CD', category: 'DevOps' },
  ];

  const categories = [...new Set(mcpServers.map(s => s.category))];

  const handleSelect = (serverId: string) => {
    setSelectedServer(serverId);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getServerDetails = (id: string) => {
    const details: Record<string, string[]> = {
      'shadcn': ['Install components with natural language', 'Access entire shadcn/ui library', 'Automatic dark mode support'],
      'react': ['Create React components', 'Manage development server', 'Handle package installations'],
      'aws-api': ['Full AWS API access', 'Manage S3, CloudFront, ECS', 'Infrastructure automation'],
      'aws-ecs': ['Container orchestration', 'Task definitions', 'Service scaling'],
      'aws-s3': ['Advanced S3 operations', 'Table-based data', 'Analytics queries'],
      'terraform': ['Query providers & modules', 'Access documentation', 'Infrastructure planning'],
      'playwright': ['Browser automation', 'E2E testing', 'Accessibility testing'],
      'github': ['Repository management', 'Issues & PRs', 'CI/CD monitoring'],
    };
    return details[id] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>MCP Server Collection</CardTitle>
            <CardDescription>
              Complete development ecosystem powered by Model Context Protocol
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Globe className="mr-1 h-3 w-3" />
            8 Servers Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search MCP servers..." />
          <CommandList>
            <CommandEmpty>No servers found.</CommandEmpty>
            {categories.map((category) => (
              <CommandGroup key={category} heading={category}>
                {mcpServers
                  .filter(s => s.category === category)
                  .map((server) => {
                    const Icon = server.icon;
                    return (
                      <CommandItem
                        key={server.id}
                        value={server.id}
                        onSelect={() => handleSelect(server.id)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{server.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {server.description}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>

        {selectedServer && (
          <div className="space-y-2 p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {mcpServers.find(s => s.id === selectedServer)?.name}
              </h3>
              <Badge className="text-xs">
                {mcpServers.find(s => s.id === selectedServer)?.category}
              </Badge>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="text-sm space-y-1">
                {getServerDetails(selectedServer).map((detail, i) => (
                  <p key={i}>✓ {detail}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Stack Coverage</h4>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>Frontend (React, UI)</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <span>Infrastructure (AWS, Terraform)</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                <span>Testing (Playwright, E2E)</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                <span>DevOps (GitHub, CI/CD)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Capabilities</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Natural language control</p>
              <p>• Automated workflows</p>
              <p>• Real-time monitoring</p>
              <p>• Infrastructure as Code</p>
              <p>• Cross-platform testing</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}