import { AppError } from '@/errors/app-error';
import { ERROR_CODES } from '@/errors/error-codes';
import {
  createProfileCompletion,
  EMPTY_PROFILE_COMPLETION,
} from '@/features/auth/profile-completion';
import type {
  AuthSnapshot,
  AuthState,
  AuthUser,
  ProfileCompletion,
  UserProfile,
} from '@/features/auth/types';

export function toUserProfile(user: AuthUser): UserProfile {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const onboardingCompleted = user.onboardingStatus === 'completed';

  return {
    ...user,
    fullName: fullName || user.username || 'کاربر وآند',
    onboardingCompleted,
    profileCompletion: createProfileCompletion(onboardingCompleted),
  };
}

export function authStateFromSnapshot({ preauth, user }: AuthSnapshot): AuthState {
  if (!user && preauth && preauth.type !== 'step_up') return { status: 'preauth', preauth };
  if (!user) return { status: 'anonymous' };
  if (user.status !== 'active') {
    return {
      status: 'anonymous',
      error: new AppError(ERROR_CODES.AUTH_ACCOUNT_SUSPENDED),
      requiresSessionReset: true,
    };
  }
  return { status: 'authenticated', user: toUserProfile(user) };
}

export function authStateFromUser(user: AuthUser | null): AuthState {
  return authStateFromSnapshot({ preauth: null, user });
}

export function userFromAuthState(state: AuthState): UserProfile | null {
  return state.status === 'authenticated' ? state.user : null;
}

export function profileCompletionFromAuthState(state: AuthState): ProfileCompletion {
  return state.status === 'authenticated' ? state.user.profileCompletion : EMPTY_PROFILE_COMPLETION;
}
