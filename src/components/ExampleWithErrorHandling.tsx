// Example component demonstrating comprehensive error handling
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/services/api';
import { webSocketService } from '@/services/websocket';
import { handleError } from '@/utils/errorHandler';
import { formErrorHandler, FormErrors } from '@/utils/formErrorHandler';
import { networkMonitor, queueAction } from '@/utils/networkMonitor';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Validation schema
const eventSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  startTime: z.string()
    .refine((val) => new Date(val) > new Date(), {
      message: 'Start time must be in the future'
    })
});

type EventFormData = z.infer<typeof eventSchema>;

const ExampleWithErrorHandling = () => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startTime: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Example 1: Form validation with error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validate form data
    const validation = formErrorHandler.validateWithSchema(eventSchema, formData);
    
    if (!validation.success) {
      setFormErrors(validation.errors || {});
      formErrorHandler.showFormErrors(validation.errors || {}, 'Please fix the following errors');
      return;
    }

    setIsLoading(true);

    try {
      // Check network status before making request
      if (networkMonitor.isOffline()) {
        // Queue the action for when connection is restored
        queueAction(
          async () => {
            const response = await apiClient.createEvent(validation.data);
            toast({
              title: 'Event Created',
              description: 'Your event has been successfully created',
              variant: 'default'
            });
            return response;
          },
          'Create Event'
        );
        return;
      }

      // Make API call with built-in error handling
      const response = await apiClient.createEvent(validation.data);
      
      toast({
        title: 'Event Created',
        description: 'Your event has been successfully created',
        variant: 'default'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        startTime: ''
      });

    } catch (error: any) {
      // API client already handles errors, but we can add custom handling here
      if (error.statusCode === 422) {
        // Validation errors from API
        const apiErrors = formErrorHandler.parseApiValidationError(error);
        setFormErrors(apiErrors);
      }
      // Other errors are already handled by the API client's error handler
    } finally {
      setIsLoading(false);
    }
  };

  // Example 2: File upload with error handling
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      handleError(
        new Error('File too large'),
        'File Upload',
        () => handleFileUpload(file) // Retry callback
      );
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload with progress
      const formData = new FormData();
      formData.append('file', file);

      // This would be a real upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onerror = () => {
        handleError(
          new Error('Upload failed'),
          'File Upload'
        );
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({
            title: 'Upload Successful',
            description: `${file.name} has been uploaded`,
            variant: 'default'
          });
        } else {
          handleError(
            new Error(`Upload failed with status ${xhr.status}`),
            'File Upload'
          );
        }
      };

      // xhr.open('POST', '/api/upload');
      // xhr.send(formData);

      // For demo, simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploadProgress(100);
      
    } catch (error) {
      handleError(error, 'File Upload', () => handleFileUpload(file));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Example 3: WebSocket with error handling
  const handleConnectWebSocket = () => {
    try {
      // WebSocket service has built-in error handling
      webSocketService.connect('event-123', 'token');
      
      // Listen for WebSocket events
      webSocketService.on('error', (error) => {
        console.error('WebSocket error received:', error);
      });

      webSocketService.on('reconnecting', ({ attempt, delay }) => {
        console.log(`Reconnecting... Attempt ${attempt}, delay: ${delay}ms`);
      });

      webSocketService.on('connected', () => {
        toast({
          title: 'Connected',
          description: 'Real-time connection established',
          variant: 'default'
        });
      });

    } catch (error) {
      handleError(error, 'WebSocket Connection');
    }
  };

  // Example 4: Intentional error for testing
  const triggerError = () => {
    throw new Error('This is a test error to demonstrate error boundary');
  };

  // Example 5: Async error
  const triggerAsyncError = async () => {
    await Promise.reject(new Error('This is an async error'));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Examples</CardTitle>
        <CardDescription>
          This component demonstrates comprehensive error handling patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form with validation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={formErrors.title ? 'border-destructive' : ''}
            />
            {formErrors.title && (
              <p className="text-sm text-destructive mt-1">{formErrors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={formErrors.description ? 'border-destructive' : ''}
            />
            {formErrors.description && (
              <p className="text-sm text-destructive mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={formErrors.startTime ? 'border-destructive' : ''}
            />
            {formErrors.startTime && (
              <p className="text-sm text-destructive mt-1">{formErrors.startTime}</p>
            )}
          </div>

          {formErrors._form && (
            <Alert variant="destructive">
              <AlertDescription>{formErrors._form}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
        </form>

        {/* File upload */}
        <div className="space-y-2">
          <Label>File Upload Example</Label>
          <Input
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={isLoading}
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* WebSocket connection */}
        <div className="space-y-2">
          <Label>WebSocket Example</Label>
          <Button onClick={handleConnectWebSocket} variant="outline">
            Connect WebSocket
          </Button>
        </div>

        {/* Error testing buttons */}
        <div className="space-y-2">
          <Label>Error Testing</Label>
          <div className="flex gap-2">
            <Button onClick={triggerError} variant="destructive">
              Trigger Sync Error
            </Button>
            <Button onClick={triggerAsyncError} variant="destructive">
              Trigger Async Error
            </Button>
          </div>
        </div>

        {/* Network status */}
        <div className="space-y-2">
          <Label>Network Status</Label>
          <Alert>
            <AlertDescription>
              Current Status: {networkMonitor.getStatus()}
              {networkMonitor.getQueuedActionsCount() > 0 && (
                <span className="ml-2">
                  ({networkMonitor.getQueuedActionsCount()} actions queued)
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExampleWithErrorHandling;