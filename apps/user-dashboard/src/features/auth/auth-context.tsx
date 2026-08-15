import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { AppError } from '@/errors/app-error';
import { ERROR_CODES } from '@/errors/error-codes';
import { authStorage, type StoredUserProfile } from '@/features/auth/auth-storage';
import {
  createProfileCompletion,
  EMPTY_PROFILE_COMPLETION,
} from '@/features/auth/profile-completion';
import type {
  AuthContextValue,
  AuthStatus,
  InitialProfileData,
  UserProfile,
} from '@/features/auth/types';
import type { LoginFormValues, SignupFormValues } from '@/schemas/auth.schema';

const AuthContext = createContext<AuthContextValue | null>(null);

function toUserProfile(user: StoredUserProfile): UserProfile {
  return { ...user, profileCompletion: createProfileCompletion(user.onboardingCompleted) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedUser = authStorage.getActiveUser();
    return storedUser ? toUserProfile(storedUser) : null;
  });

  const login = useCallback(async (values: LoginFormValues): Promise<UserProfile> => {
    const nextUser = toUserProfile(authStorage.login(values.email));
    setUser(nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (values: SignupFormValues): Promise<UserProfile> => {
    const nextUser = toUserProfile(authStorage.signup(values.email, values.fullName));
    setUser(nextUser);
    return nextUser;
  }, []);

  const completeOnboarding = useCallback(
    async (data: InitialProfileData): Promise<void> => {
      if (!user) {
        throw new AppError(ERROR_CODES.UNAUTHORIZED, {
          message: 'An authenticated user is required to complete onboarding.',
          source: 'authentication',
        });
      }

      setUser(toUserProfile(authStorage.completeOnboarding(user.email, data)));
    },
    [user],
  );

  const logout = useCallback((): void => {
    authStorage.logout();
    setUser(null);
  }, []);

  const status: AuthStatus = !user
    ? 'unauthenticated'
    : user.onboardingCompleted
      ? 'onboarded'
      : 'needs-onboarding';
  const profileCompletion = user?.profileCompletion ?? EMPTY_PROFILE_COMPLETION;

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated: user !== null,
      user,
      profileCompletion,
      login,
      signup,
      completeOnboarding,
      logout,
    }),
    [completeOnboarding, login, logout, profileCompletion, signup, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
