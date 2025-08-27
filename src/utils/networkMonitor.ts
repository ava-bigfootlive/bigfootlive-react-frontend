import { EventEmitter } from 'events';
import { toast } from '@/components/ui/use-toast';

export type NetworkStatus = 'online' | 'offline' | 'slow';

interface NetworkMonitorConfig {
  checkInterval?: number;
  slowConnectionThreshold?: number;
  enableToasts?: boolean;
}

class NetworkMonitor extends EventEmitter {
  private status: NetworkStatus = 'online';
  private checkInterval: number;
  private slowConnectionThreshold: number;
  private enableToasts: boolean;
  private intervalId: NodeJS.Timeout | null = null;
  private connectionSpeed: number = 0;
  private lastOnlineTime: Date | null = null;
  private queuedActions: Array<() => Promise<any>> = [];

  constructor(config: NetworkMonitorConfig = {}) {
    super();
    this.checkInterval = config.checkInterval || 10000; // 10 seconds
    this.slowConnectionThreshold = config.slowConnectionThreshold || 2000; // 2 seconds
    this.enableToasts = config.enableToasts !== false;
    
    this.initialize();
  }

  private initialize() {
    // Set initial status
    this.updateStatus(navigator.onLine ? 'online' : 'offline');

    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start periodic connectivity check
    this.startPeriodicCheck();

    // Check connection speed on initialization
    this.checkConnectionSpeed();
  }

  private handleOnline = () => {
    console.log('Network: Browser reports online');
    this.updateStatus('online');
    this.processQueuedActions();
  };

  private handleOffline = () => {
    console.log('Network: Browser reports offline');
    this.updateStatus('offline');
  };

  private updateStatus(newStatus: NetworkStatus) {
    if (this.status === newStatus) return;

    const previousStatus = this.status;
    this.status = newStatus;

    // Track when we went online
    if (newStatus === 'online') {
      this.lastOnlineTime = new Date();
    }

    // Emit status change event
    this.emit('statusChange', {
      current: newStatus,
      previous: previousStatus,
      timestamp: new Date()
    });

    // Show toast notifications if enabled
    if (this.enableToasts) {
      this.showStatusToast(newStatus, previousStatus);
    }
  }

  private showStatusToast(current: NetworkStatus, previous: NetworkStatus) {
    if (current === 'offline') {
      toast({
        title: 'Connection Lost',
        description: 'You are currently offline. Some features may be unavailable.',
        variant: 'destructive',
        duration: 0 // Don't auto-dismiss
      });
    } else if (current === 'online' && previous === 'offline') {
      toast({
        title: 'Connection Restored',
        description: 'You are back online.',
        variant: 'default',
        duration: 3000
      });
    } else if (current === 'slow') {
      toast({
        title: 'Slow Connection',
        description: 'Your connection is slow. Some features may take longer to load.',
        variant: 'default',
        duration: 5000
      });
    }
  }

  private startPeriodicCheck() {
    this.intervalId = setInterval(() => {
      this.checkConnectivity();
    }, this.checkInterval);
  }

  private async checkConnectivity() {
    try {
      const startTime = Date.now();
      
      // Try to fetch a small resource
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store'
      }).catch(() => null);

      const responseTime = Date.now() - startTime;
      this.connectionSpeed = responseTime;

      if (!response) {
        this.updateStatus('offline');
      } else if (responseTime > this.slowConnectionThreshold) {
        this.updateStatus('slow');
      } else {
        this.updateStatus('online');
      }
    } catch (error) {
      console.error('Network check failed:', error);
      this.updateStatus('offline');
    }
  }

  async checkConnectionSpeed(): Promise<number> {
    if (!navigator.onLine) {
      this.connectionSpeed = Infinity;
      return this.connectionSpeed;
    }

    try {
      const startTime = performance.now();
      
      // Fetch a small known resource
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const endTime = performance.now();
      this.connectionSpeed = endTime - startTime;
      
      // Update status based on speed
      if (this.connectionSpeed > this.slowConnectionThreshold) {
        this.updateStatus('slow');
      } else if (this.status !== 'online') {
        this.updateStatus('online');
      }

      return this.connectionSpeed;
    } catch (error) {
      this.connectionSpeed = Infinity;
      this.updateStatus('offline');
      return this.connectionSpeed;
    }
  }

  // Queue actions to be executed when online
  queueAction(action: () => Promise<any>, description?: string): void {
    this.queuedActions.push(action);
    
    if (this.enableToasts && description) {
      toast({
        title: 'Action Queued',
        description: `"${description}" will be executed when connection is restored.`,
        variant: 'default'
      });
    }

    // Try to process immediately if online
    if (this.isOnline()) {
      this.processQueuedActions();
    }
  }

  private async processQueuedActions() {
    if (this.queuedActions.length === 0) return;
    if (!this.isOnline()) return;

    const actions = [...this.queuedActions];
    this.queuedActions = [];

    for (const action of actions) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Re-queue failed action
        this.queuedActions.push(action);
      }
    }

    if (this.enableToasts && actions.length > 0) {
      toast({
        title: 'Queued Actions Processed',
        description: `${actions.length} queued action(s) have been executed.`,
        variant: 'default'
      });
    }
  }

  // Public methods
  getStatus(): NetworkStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  isOffline(): boolean {
    return this.status === 'offline';
  }

  isSlow(): boolean {
    return this.status === 'slow';
  }

  getConnectionSpeed(): number {
    return this.connectionSpeed;
  }

  getLastOnlineTime(): Date | null {
    return this.lastOnlineTime;
  }

  getQueuedActionsCount(): number {
    return this.queuedActions.length;
  }

  // Wait for online status
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline()) return true;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.off('statusChange', statusHandler);
        resolve(false);
      }, timeout);

      const statusHandler = (event: any) => {
        if (event.current === 'online') {
          clearTimeout(timeoutId);
          this.off('statusChange', statusHandler);
          resolve(true);
        }
      };

      this.on('statusChange', statusHandler);
    });
  }

  // Cleanup
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.removeAllListeners();
  }
}

// Create singleton instance
export const networkMonitor = new NetworkMonitor({
  checkInterval: 10000,
  slowConnectionThreshold: 2000,
  enableToasts: true
});

// Export convenience functions
export const isOnline = () => networkMonitor.isOnline();
export const isOffline = () => networkMonitor.isOffline();
export const getNetworkStatus = () => networkMonitor.getStatus();
export const queueAction = (action: () => Promise<any>, description?: string) => 
  networkMonitor.queueAction(action, description);
export const waitForConnection = (timeout?: number) => 
  networkMonitor.waitForConnection(timeout);

export default networkMonitor;