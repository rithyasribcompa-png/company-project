import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}