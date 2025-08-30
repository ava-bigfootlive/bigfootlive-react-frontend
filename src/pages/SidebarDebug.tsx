import { sidebarData } from '@/components/layout/data/sidebar-data';
import { Home, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SidebarDebugPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Sidebar Debug Page</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Icon Test</h2>
        <div className="flex gap-4">
          <Button variant="ghost">
            <Home className="h-4 w-4 mr-2" />
            Home Icon
          </Button>
          <Button variant="ghost">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar Icon
          </Button>
          <Button variant="ghost">
            <Video className="h-4 w-4 mr-2" />
            Video Icon
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          If you see icons above, Lucide React is working correctly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Sidebar Data Structure</h2>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(sidebarData, (key, value) => {
              // Convert functions to string representation
              if (typeof value === 'function') {
                return `[Function: ${value.name || 'anonymous'}]`;
              }
              return value;
            }, 2)}
          </pre>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Data loaded: {sidebarData ? 'Yes' : 'No'} | 
          Is Array: {Array.isArray(sidebarData) ? 'Yes' : 'No'} | 
          Length: {sidebarData?.length || 0}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Navigation Items</h2>
        <div className="space-y-4">
          {sidebarData.map((group, groupIndex) => (
            <div key={groupIndex} className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{group.title}</h3>
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div key={itemIndex} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {Icon && (
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs text-green-600">✓ Icon OK</span>
                        </div>
                      )}
                      {!Icon && <span className="text-xs text-red-600">✗ No Icon</span>}
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">({item.url})</span>
                      {item.items && (
                        <span className="text-xs text-blue-600">
                          +{item.items.length} sub-items
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Component Checks</h2>
        <ul className="space-y-1">
          <li>✓ Button component imported</li>
          <li>✓ Lucide icons imported</li>
          <li>✓ Sidebar data imported</li>
          <li>✓ Tailwind CSS working</li>
        </ul>
      </section>
    </div>
  );
}