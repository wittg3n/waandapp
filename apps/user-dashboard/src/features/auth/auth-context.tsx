import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AppError } from '@/errors/app-error';
import { ERROR_CODES } from '@/errors/error-codes';
import { normalizeError } from '@/errors/normalize-error';
import { authApi } from '@/features/auth/auth-api';
import {
  authStateFromSnapshot,
  profileCompletionFromAuthState,
  toUserProfile,
  userFromAuthState,
} from '@/features/auth/auth-state';
import type {
  AuthContextValue,
  AuthSnapshot,
  AuthState,
  InitialProfileData,
  PreauthContext,
} from '@/features/auth/types';
import { removeLegacyAuthStorage } from '@/features/onboarding/onboarding-draft-storage';

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionExpiredError(error: AppError): AppError {
  if (error.code === ERROR_CODES.AUTH_SESSION_EXPIRED) return error;
  return new AppError(ERROR_CODES.AUTH_SESSION_EXPIRED, {
    message: error.message,
    statusCode: error.statusCode,
    cause: error,
  });
}

function invalidSessionState(error: AppError): AuthState {
  return error.code === ERROR_CODES.AUTH_ACCOUNT_SUSPENDED
    ? { status: 'anonymous', error, requiresSessionReset: true }
    : { status: 'anonymous', error: sessionExpiredError(error) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [preauth, setPreauth] = useState<PreauthContext | null>(null);
  const [termsVersion, setTermsVersion] = useState<string | null>(null);
  const stateRef = useRef<AuthState>(state);
  const requestSequence = useRef(0);

  const commitState = useCallback((nextState: AuthState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const applySnapshot = useCallback(
    (snapshot: AuthSnapshot): AuthState => {
      requestSequence.current += 1;
      setPreauth(snapshot.preauth);

      const current = stateRef.current;
      const nextState =
        !snapshot.user && snapshot.preauth?.type === 'step_up' && current.status === 'authenticated'
          ? current
          : authStateFromSnapshot(snapshot);
      commitState(nextState);
      return nextState;
    },
    [commitState],
  );

  const refreshSession = useCallback(async (): Promise<void> => {
    const sequence = ++requestSequence.current;

    try {
      const result = await authApi.getMe();
      if (sequence !== requestSequence.current) return;
      setTermsVersion(result.termsVersion);
      applySnapshot(result);
    } catch (cause) {
      if (sequence !== requestSequence.current) return;
      const error = normalizeError(cause);
      if (error.code === ERROR_CODES.REQUEST_ABORTED) return;
      if (stateRef.current.status === 'loading') {
        commitState({ status: 'anonymous', error });
      }
    }
  }, [applySnapshot, commitState]);

  useEffect(() => {
    removeLegacyAuthStorage();
    const clearHandler = authApi.setSessionExpiredHandler((error) => {
      requestSequence.current += 1;
      setPreauth(null);
      setTermsVersion(null);
      commitState(invalidSessionState(error));
    });
    void refreshSession();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshSession();
    };
    const refreshOnFocus = () => void refreshSession();
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      requestSequence.current += 1;
      clearHandler();
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [commitState, refreshSession]);

  const completeOnboarding = useCallback(
    async (data: InitialProfileData): Promise<void> => {
      if (stateRef.current.status !== 'authenticated') {
        throw new AppError(ERROR_CODES.AUTH_UNAUTHORIZED, {
          message: 'An authenticated user is required to complete onboarding.',
        });
      }

      const user = toUserProfile(await authApi.updateProfile(data));
      setPreauth(null);
      commitState({ status: 'authenticated', user });
    },
    [commitState],
  );

  const logout = useCallback(async (): Promise<void> => {
    await authApi.logout();
    setPreauth(null);
    commitState({ status: 'loading' });
    await refreshSession();
  }, [commitState, refreshSession]);

  const logoutAll = useCallback(async (): Promise<void> => {
    await authApi.logoutAll();
    setPreauth(null);
    commitState({ status: 'loading' });
    await refreshSession();
  }, [commitState, refreshSession]);

  const user = userFromAuthState(state);
  const profileCompletion = profileCompletionFromAuthState(state);
  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      isAuthenticated: state.status === 'authenticated',
      user,
      preauth,
      termsVersion,
      profileCompletion,
      applySnapshot,
      refreshSession,
      completeOnboarding,
      logout,
      logoutAll,
    }),
    [
      applySnapshot,
      completeOnboarding,
      logout,
      logoutAll,
      preauth,
      profileCompletion,
      refreshSession,
      state,
      termsVersion,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
