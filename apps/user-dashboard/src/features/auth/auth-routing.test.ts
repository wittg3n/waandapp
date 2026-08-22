import { describe, expect, it } from 'vitest';

import { authStateFromSnapshot } from '@/features/auth/auth-state';
import { destinationForAuthState, resolveAuthRoute } from '@/features/auth/auth-routing';
import type { AuthState, AuthUser, PreauthContext } from '@/features/auth/types';

function user(onboardingStatus: AuthUser['onboardingStatus']): AuthUser {
  return {
    id: 'user-1',
    firstName: 'سارا',
    lastName: 'احمدی',
    username: 'sara',
    email: 'user@example.com',
    phone: '+989121234567',
    emailVerified: true,
    phoneVerified: true,
    role: 'applicant',
    status: 'active',
    onboardingStatus,
  };
}

function preauth(overrides: Partial<PreauthContext> = {}): PreauthContext {
  return {
    type: 'login',
    stage: 'second_step',
    allowedChannels: ['email', 'sms'],
    completedChannels: [],
    destinations: { email: 's***@example.com', sms: '+98*****67' },
    expiresAt: '2026-08-22T13:00:00.000Z',
    ...overrides,
  };
}

describe('auth state and route resolution', () => {
  it('holds protected routes while the session is loading', () => {
    expect(resolveAuthRoute({ status: 'loading' }, 'dashboard')).toEqual({ type: 'loading' });
  });

  it('allows anonymous auth and recovery entry while redirecting protected routes', () => {
    const state: AuthState = { status: 'anonymous' };
    expect(resolveAuthRoute(state, 'public-auth')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(state, 'recovery')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(state, 'dashboard')).toEqual({ type: 'redirect', to: '/login' });
    expect(resolveAuthRoute(state, 'account')).toEqual({ type: 'redirect', to: '/login' });
  });

  it('routes signup and login preauth only to verification', () => {
    for (const type of ['signup', 'login'] as const) {
      const state = authStateFromSnapshot({ user: null, preauth: preauth({ type }) });
      expect(resolveAuthRoute(state, 'verification')).toEqual({ type: 'allow' });
      expect(resolveAuthRoute(state, 'public-auth')).toEqual({
        type: 'redirect',
        to: '/verify',
      });
    }
  });

  it('routes password recovery to verification and then reset without loops', () => {
    const recovery = authStateFromSnapshot({
      user: null,
      preauth: preauth({ type: 'password_reset', stage: 'recovery_verification' }),
    });
    expect(resolveAuthRoute(recovery, 'recovery')).toEqual({ type: 'allow' });
    expect(destinationForAuthState(recovery as Exclude<AuthState, { status: 'loading' }>)).toBe(
      '/forgot-password',
    );

    const ready = authStateFromSnapshot({
      user: null,
      preauth: preauth({ type: 'password_reset', stage: 'ready_for_password_reset' }),
    });
    expect(resolveAuthRoute(ready, 'reset')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(ready, 'recovery')).toEqual({
      type: 'redirect',
      to: '/reset-password',
    });
  });

  it('routes authenticated users by onboarding completion', () => {
    const incomplete = authStateFromSnapshot({ user: user('in_progress'), preauth: null });
    expect(resolveAuthRoute(incomplete, 'account')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(incomplete, 'onboarding')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(incomplete, 'dashboard')).toEqual({
      type: 'redirect',
      to: '/onboarding',
    });

    const complete = authStateFromSnapshot({ user: user('completed'), preauth: null });
    expect(resolveAuthRoute(complete, 'account')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(complete, 'dashboard')).toEqual({ type: 'allow' });
    expect(resolveAuthRoute(complete, 'onboarding')).toEqual({
      type: 'redirect',
      to: '/dashboard',
    });
  });

  it('keeps an active user authenticated while a step-up descriptor exists', () => {
    for (const stage of ['second_step', 'reauthenticated', 'new_contact_verification'] as const) {
      const state = authStateFromSnapshot({
        user: user('completed'),
        preauth: preauth({ type: 'step_up', stage, purpose: 'change_email' }),
      });
      expect(state.status).toBe('authenticated');
      expect(resolveAuthRoute(state, 'dashboard')).toEqual({ type: 'allow' });
      expect(resolveAuthRoute(state, 'account')).toEqual({ type: 'allow' });
    }
  });

  it('fails closed for a step-up descriptor without an authenticated user', () => {
    const state = authStateFromSnapshot({
      user: null,
      preauth: preauth({ type: 'step_up', purpose: 'change_email' }),
    });
    expect(state.status).toBe('anonymous');
    expect(resolveAuthRoute(state, 'verification')).toEqual({ type: 'redirect', to: '/login' });
  });

  it('does not authenticate suspended or deleted users', () => {
    for (const status of ['suspended', 'deleted'] as const) {
      expect(
        authStateFromSnapshot({
          user: { ...user('completed'), status },
          preauth: preauth({ type: 'step_up', purpose: 'change_phone' }),
        }),
      ).toMatchObject({
        status: 'anonymous',
        error: { code: 'AUTH_ACCOUNT_SUSPENDED' },
        requiresSessionReset: true,
      });
    }
  });
});
