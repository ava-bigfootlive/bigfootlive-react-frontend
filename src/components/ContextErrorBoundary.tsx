import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ContextErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Context error caught by boundary:', error, errorInfo);
    
    // Check if it's a context-related error
    if (error.message?.includes('must be used within') || 
        error.message?.includes('useContext') ||
        error.message?.includes('Cannot read properties of undefined')) {
      console.error('Context provider error detected. Component is trying to use a context outside its provider.');
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 bg-destructive/10 rounded-lg border border-destructive">
            <h2 className="text-2xl font-bold text-destructive mb-4">Context Error</h2>
            <p className="text-muted-foreground mb-4">
              A component tried to use a context outside its provider. This usually means there's a problem with the app structure.
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error Details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ContextErrorBoundary;