import { Home, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestComponent() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Icon Test Component</h2>
      
      <div className="flex gap-4">
        <Button variant="ghost">
          <Home className="h-4 w-4 mr-2" />
          Home Icon
        </Button>
        
        <Button variant="ghost">
          <Settings className="h-4 w-4 mr-2" />
          Settings Icon
        </Button>
        
        <Button variant="ghost">
          <User className="h-4 w-4 mr-2" />
          User Icon
        </Button>
      </div>
      
      <div>
        <p>If you see icons above, Lucide React is working correctly.</p>
        <p>If you see text only, there's an issue with icon rendering.</p>
      </div>
    </div>
  );
}