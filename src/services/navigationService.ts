// Navigation service to handle redirects without React Router hooks
let navigateFunction: ((path: string) => void) | null = null;

export const navigationService = {
  setNavigate: (navigate: (path: string) => void) => {
    navigateFunction = navigate;
  },
  
  navigate: (path: string) => {
    if (navigateFunction) {
      navigateFunction(path);
    } else {
      // Fallback - but this should not happen if properly initialized
      console.error('Navigation not initialized');
    }
  }
};