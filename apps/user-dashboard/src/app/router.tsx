import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/components/auth/auth-layout';
import { RouteErrorPage } from '@/components/errors/route-error-page';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard, AuthHomeRedirect } from '@/features/auth/auth-guard';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { FeaturePlaceholderPage } from '@/features/dashboard/pages/feature-placeholder-page';
import { OnboardingPage } from '@/features/onboarding/pages/onboarding-page';
import { LoginPage } from '@/pages/auth/login-page';
import { SignupPage } from '@/pages/auth/signup-page';
import { NotFoundPage } from '@/pages/errors/not-found-page';

const featurePaths = [
  'profile',
  'documents',
  'universities',
  'applications',
  'deadlines',
  'messages',
  'settings',
  'help',
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthHomeRedirect />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <AuthGuard allowed={['unauthenticated']} />,
    children: [
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard allowed={['needs-onboarding']} />,
    errorElement: <RouteErrorPage />,
    children: [{ path: 'onboarding', element: <OnboardingPage /> }],
  },
  {
    element: <AuthGuard allowed={['onboarded']} />,
    errorElement: <RouteErrorPage homePath="/dashboard" />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          ...featurePaths.map((path) => ({ path, element: <FeaturePlaceholderPage /> })),
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <RouteErrorPage />,
  },
]);
