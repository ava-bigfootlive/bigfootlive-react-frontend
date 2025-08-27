import { toast } from 'sonner';

export function useToast() {
  return {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive' | 'success';
    }) => {
      const message = options.title || options.description || '';
      
      switch (options.variant) {
        case 'destructive':
          toast.error(message, {
            description: options.title ? options.description : undefined,
          });
          break;
        case 'success':
          toast.success(message, {
            description: options.title ? options.description : undefined,
          });
          break;
        default:
          toast(message, {
            description: options.title ? options.description : undefined,
          });
      }
    }
  };
}

export { toast };