import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/components/auth/auth-layout';
import { RouteErrorPage } from '@/components/errors/route-error-page';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard, AuthHomeRedirect } from '@/features/auth/auth-guard';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { FeaturePlaceholderPage } from '@/features/dashboard/pages/feature-placeholder-page';
import { OnboardingPage } from '@/features/onboarding/pages/onboarding-page';
import { LoginPage } from '@/pages/auth/login-page';
import { PasswordRecoveryPage } from '@/pages/auth/password-recovery-page';
import { ResetPasswordPage } from '@/pages/auth/reset-password-page';
import { SignupPage } from '@/pages/auth/signup-page';
import { VerifyPage } from '@/pages/auth/verify-page';
import { NotFoundPage } from '@/pages/errors/not-found-page';
import { SettingsPage } from '@/pages/settings-page';

const featurePaths = [
  'profile',
  'documents',
  'universities',
  'applications',
  'deadlines',
  'messages',
  'help',
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthHomeRedirect />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <AuthGuard area="public-auth" />,
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
    element: <AuthGuard area="verification" />,
    children: [
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [{ path: 'verify', element: <VerifyPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard area="recovery" />,
    children: [
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [{ path: 'forgot-password', element: <PasswordRecoveryPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard area="reset" />,
    children: [
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [{ path: 'reset-password', element: <ResetPasswordPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard area="onboarding" />,
    errorElement: <RouteErrorPage />,
    children: [{ path: 'onboarding', element: <OnboardingPage /> }],
  },
  {
    element: <AuthGuard area="account" />,
    errorElement: <RouteErrorPage homePath="/dashboard" />,
    children: [
      {
        element: <DashboardShell />,
        children: [{ path: 'settings', element: <SettingsPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard area="dashboard" />,
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
