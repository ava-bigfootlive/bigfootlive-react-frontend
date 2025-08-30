import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileView: boolean;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [mobileView, setMobileView] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      
      // Auto-close sidebar on mobile
      if (isMobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileView,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}