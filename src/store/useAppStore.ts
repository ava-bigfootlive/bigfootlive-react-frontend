import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tenant {
  id: string;
  name: string;
  role: string;
}

interface AppState {
  // User & Auth
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Stream State
  activeStream: {
    eventId?: string;
    streamKey?: string;
    rtmpUrl?: string;
    hlsUrl?: string;
    status?: 'idle' | 'preparing' | 'live' | 'ended';
  } | null;
  setActiveStream: (stream: AppState['activeStream']) => void;
  clearActiveStream: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User & Auth
      selectedTenant: null,
      setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
      
      // UI State
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Stream State
      activeStream: null,
      setActiveStream: (stream) => set({ activeStream: stream }),
      clearActiveStream: () => set({ activeStream: null }),
    }),
    {
      name: 'bigfootlive-app-store',
      partialize: (state) => ({
        selectedTenant: state.selectedTenant,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);