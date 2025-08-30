import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { sidebarData } from '@/components/layout/data/sidebar-data';

interface SearchResult {
  title: string;
  url: string;
  category: string;
  icon?: any;
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  search: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Search through sidebar data
    sidebarData.forEach((group) => {
      group.items.forEach((item) => {
        if (item.title.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            title: item.title,
            url: item.url,
            category: group.title,
            icon: item.icon,
          });
        }

        // Search sub-items
        if (item.items) {
          item.items.forEach((subItem) => {
            if (subItem.title.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                title: subItem.title,
                url: subItem.url,
                category: `${group.title} > ${item.title}`,
                icon: subItem.icon || item.icon,
              });
            }
          });
        }
      });
    });

    // Add quick actions
    const quickActions = [
      { title: 'Go Live', url: '/streaming/live', category: 'Quick Actions' },
      { title: 'Upload Media', url: '/vod-upload', category: 'Quick Actions' },
      { title: 'View Analytics', url: '/analytics', category: 'Quick Actions' },
      { title: 'Create Event', url: '/event-management', category: 'Quick Actions' },
    ];

    quickActions.forEach((action) => {
      if (action.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push(action);
      }
    });

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        isOpen,
        setIsOpen,
        search,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}