import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/context/search-provider';
import { 
  Search, 
  ArrowRight,
  FileText,
  Home,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchDialog() {
  const navigate = useNavigate();
  const { query, setQuery, results, isOpen, setIsOpen } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].url);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Overview': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Events': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      'Streaming': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'Content': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      'Analytics': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      'Quick Actions': 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
      'Administration': 'bg-red-500/10 text-red-700 dark:text-red-400',
      'Engagement': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Customization': 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
      'Support': 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    };
    return colors[category.split(' > ')[0]] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for pages, actions, or settings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              ESC
            </kbd>
          </div>
        </DialogHeader>

        {results.length > 0 ? (
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = result.icon || FileText;
                return (
                  <button
                    key={`${result.url}-${index}`}
                    onClick={() => handleSelect(result.url)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.category}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', getCategoryColor(result.category))}
                    >
                      {result.category.split(' > ')[0]}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : query ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No results found for "{query}"
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Start typing to search...
            </p>
          </div>
        )}

        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                  ↵
                </kbd>
                Select
              </span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}