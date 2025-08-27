# Global Error Handling Implementation Guide

## Overview
Comprehensive global error handling has been implemented for the BigFootLive React frontend application. This system provides robust error handling across all layers of the application.

## Components Implemented

### 1. Error Boundary Component (`/src/components/ErrorBoundary.tsx`)
- Catches React component errors
- Provides fallback UI with recovery options
- Logs errors to console/external service
- Offers multiple recovery actions (retry, reload, go home)
- Shows technical details in development mode

### 2. Global Error Handler (`/src/utils/errorHandler.ts`)
**Features:**
- Centralized error handling system
- Error type classification (Network, Auth, Validation, API, etc.)
- Error severity levels (Info, Warning, Error, Critical)
- Automatic retry mechanism for retryable errors
- Toast notifications with contextual messages
- Error logging to console and external services
- User-friendly error messages

**Error Types Handled:**
- `NETWORK` - Connection errors
- `AUTH` - Authentication failures
- `VALIDATION` - Form validation errors
- `API` - API request errors
- `PERMISSION` - Authorization errors
- `NOT_FOUND` - Resource not found
- `SERVER` - Server errors
- `RATE_LIMIT` - Rate limiting
- `WEBSOCKET` - Real-time connection errors
- `FILE_UPLOAD` - Upload failures
- `UNKNOWN` - Unclassified errors

### 3. Enhanced API Client (`/src/services/api.ts`)
**Improvements:**
- Automatic retry logic with exponential backoff
- Request timeout handling
- Network status checking
- HTTP status code handling (401, 403, 404, 422, 429, 500+)
- Authentication error handling with redirect to login
- Content-type aware response handling

### 4. Enhanced WebSocket Service (`/src/services/websocket.ts`)
**Improvements:**
- Connection error handling with detailed error types
- Automatic reconnection with exponential backoff
- Connection state tracking
- Graceful degradation
- User notifications for connection status changes

### 5. Error Pages
- **NotFound** (`/src/pages/ErrorPages/NotFound.tsx`) - 404 errors
- **ServerError** (`/src/pages/ErrorPages/ServerError.tsx`) - 500 errors with server status checking
- **Forbidden** (`/src/pages/ErrorPages/Forbidden.tsx`) - 403 errors with access request option

### 6. Network Monitor (`/src/utils/networkMonitor.ts`)
**Features:**
- Online/offline detection
- Connection speed monitoring
- Action queuing for offline mode
- Automatic retry when connection restored
- User notifications for network status changes

### 7. Form Error Handler (`/src/utils/formErrorHandler.ts`)
**Features:**
- Zod schema validation integration
- API validation error parsing
- Field-level error messages
- Error summary generation
- Toast notifications for form errors

### 8. Error Handling Hooks (`/src/hooks/useErrorHandler.ts`)
- `useErrorHandler` - General error handling hook
- `useApiCall` - API calls with loading and error states
- `useFormSubmit` - Form submission with error handling
- `useRetryable` - Operations with automatic retry

## Usage Examples

### Basic Error Handling
```typescript
import { handleError } from '@/utils/errorHandler';

try {
  // Your code here
} catch (error) {
  handleError(error, 'Context description');
}
```

### API Call with Error Handling
```typescript
import { apiClient } from '@/services/api';

// Errors are automatically handled by the API client
const data = await apiClient.getEvents();
```

### Using Error Handling Hook
```typescript
import { useApiCall } from '@/hooks/useErrorHandler';

const { data, loading, error, execute } = useApiCall(
  apiClient.getEvents,
  {
    successMessage: 'Events loaded successfully',
    context: 'Loading Events'
  }
);

// Execute the API call
await execute();
```

### Form Validation
```typescript
import { formErrorHandler } from '@/utils/formErrorHandler';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const validation = formErrorHandler.validateWithSchema(schema, formData);
if (!validation.success) {
  formErrorHandler.showFormErrors(validation.errors);
}
```

### Network Status Monitoring
```typescript
import { networkMonitor, queueAction } from '@/utils/networkMonitor';

// Check network status
if (networkMonitor.isOffline()) {
  // Queue action for when online
  queueAction(
    async () => await apiClient.createEvent(data),
    'Create Event'
  );
}

// Listen to network changes
networkMonitor.on('statusChange', (event) => {
  console.log('Network status:', event.current);
});
```

## Global Error Handlers in App.tsx

The following global error handlers are automatically set up:
1. **Unhandled Promise Rejections** - Caught and displayed as toasts
2. **JavaScript Errors** - Caught by error boundary with fallback UI
3. **Network Status Changes** - Monitored and actions queued when offline

## Testing Error Handling

To test the error handling system:
1. Navigate to any page with the `ExampleWithErrorHandling` component
2. Use the error testing buttons to trigger different error types
3. Turn off network to test offline handling
4. Submit invalid forms to test validation errors

## Configuration

Error handling can be configured in several ways:

### Error Handler Configuration
```typescript
errorHandler.updateConfig({
  logToConsole: true,      // Log errors to console
  logToService: true,       // Send errors to external service
  showToast: true,          // Show toast notifications
  serviceUrl: 'your-url'    // Error logging service URL
});
```

### Network Monitor Configuration
```typescript
const monitor = new NetworkMonitor({
  checkInterval: 10000,           // Check every 10 seconds
  slowConnectionThreshold: 2000,  // 2 second threshold
  enableToasts: true              // Show network status toasts
});
```

## Best Practices

1. **Always use the error handling utilities** instead of raw try/catch
2. **Provide context** when handling errors for better debugging
3. **Use appropriate error types** when creating custom errors
4. **Let the API client handle errors** - it has built-in retry and notification
5. **Wrap components in ErrorBoundary** for React error catching
6. **Use form validation** before API submission
7. **Queue actions when offline** using the network monitor
8. **Test error scenarios** regularly to ensure handling works

## Error Flow

1. Error occurs → 
2. Error is caught by nearest handler → 
3. Error is classified by type and severity → 
4. User-friendly message is generated → 
5. Toast notification is shown → 
6. Error is logged → 
7. Specific error handling is applied (redirect, retry, etc.) → 
8. Recovery options are provided to user

## Monitoring and Debugging

Errors are logged with the following information:
- Error type and severity
- Timestamp
- User context (URL, user agent)
- Stack trace (in development)
- Custom context information
- Retry attempts (if applicable)

Check the browser console for detailed error information during development.