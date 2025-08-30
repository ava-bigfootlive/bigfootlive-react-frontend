import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Radio, 
  Film, 
  BarChart, 
  MessageSquare, 
  Settings,
  LogOut
} from 'lucide-react';

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Live Streaming', href: '/streaming-live', icon: Radio },
    { name: 'Media Assets', href: '/media-assets', icon: Film },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">BigfootLive</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email || 'User'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}