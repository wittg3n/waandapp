import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { AppErrorBoundary } from '@/components/errors/app-error-boundary';
import { AuthProvider } from '@/features/auth/auth-context';

export function App() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppErrorBoundary>
    </AppProviders>
  );
}
