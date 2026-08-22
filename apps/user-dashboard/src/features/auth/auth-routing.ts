import type { AuthState, UserProfile } from '@/features/auth/types';

export type AuthDestination =
  '/login' | '/verify' | '/forgot-password' | '/reset-password' | '/onboarding' | '/dashboard';
export type AuthRouteArea =
  'public-auth' | 'verification' | 'recovery' | 'reset' | 'account' | 'onboarding' | 'dashboard';
export type AuthRouteResolution =
  { type: 'loading' } | { type: 'allow' } | { type: 'redirect'; to: AuthDestination };

export function destinationForUser(user: UserProfile): '/onboarding' | '/dashboard' {
  return user.onboardingStatus === 'completed' ? '/dashboard' : '/onboarding';
}

export function destinationForAuthState(
  state: Exclude<AuthState, { status: 'loading' }>,
): AuthDestination {
  if (state.status === 'anonymous') return '/login';
  if (state.status === 'authenticated') return destinationForUser(state.user);
  if (state.preauth.type === 'signup' || state.preauth.type === 'login') return '/verify';
  if (state.preauth.type === 'step_up') return '/login';
  return state.preauth.stage === 'ready_for_password_reset'
    ? '/reset-password'
    : '/forgot-password';
}

function areaAllows(
  state: Exclude<AuthState, { status: 'loading' }>,
  area: AuthRouteArea,
): boolean {
  switch (area) {
    case 'public-auth':
      return state.status === 'anonymous';
    case 'verification':
      return (
        state.status === 'preauth' &&
        (state.preauth.type === 'signup' || state.preauth.type === 'login')
      );
    case 'recovery':
      return (
        state.status === 'anonymous' ||
        (state.status === 'preauth' &&
          state.preauth.type === 'password_reset' &&
          state.preauth.stage !== 'ready_for_password_reset')
      );
    case 'reset':
      return (
        state.status === 'preauth' &&
        state.preauth.type === 'password_reset' &&
        state.preauth.stage === 'ready_for_password_reset'
      );
    case 'account':
      return state.status === 'authenticated';
    case 'onboarding':
      return state.status === 'authenticated' && state.user.onboardingStatus !== 'completed';
    case 'dashboard':
      return state.status === 'authenticated' && state.user.onboardingStatus === 'completed';
  }
}

export function resolveAuthRoute(state: AuthState, area: AuthRouteArea): AuthRouteResolution {
  if (state.status === 'loading') return { type: 'loading' };
  return areaAllows(state, area)
    ? { type: 'allow' }
    : { type: 'redirect', to: destinationForAuthState(state) };
}
