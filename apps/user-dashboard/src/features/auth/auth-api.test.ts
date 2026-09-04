import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAuthApi, getRetryAfterSeconds } from '@/features/auth/auth-api';

const anonymousBootstrap = {
  data: {
    user: null,
    preauth: null,
    csrfToken: 'anonymous-csrf-token',
    termsVersion: '2026-08',
  },
};

const signupPreauth = {
  type: 'signup',
  stage: 'verify_contacts',
  allowedChannels: ['email', 'sms'],
  completedChannels: [],
  destinations: { email: 's***@example.com', sms: '+98*****67' },
  expiresAt: '2026-08-22T13:00:00.000Z',
};

const registrationInput = {
  firstName: 'سارا',
  lastName: 'احمدی',
  username: 'sara',
  email: 'sara@example.com',
  phone: '+989121234567',
  password: 'correct horse battery staple',
  passwordConfirmation: 'correct horse battery staple',
  termsAccepted: true as const,
  termsVersion: '2026-08',
};

const activeUser = {
  id: 'user-1',
  firstName: 'سارا',
  lastName: 'احمدی',
  username: 'sara',
  email: 'sara@example.com',
  phone: '+989121234567',
  emailVerified: true,
  phoneVerified: true,
  role: 'applicant',
  status: 'active',
  onboardingStatus: 'not_started',
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('auth API client', () => {
  it('bootstraps cookies and sends the in-memory CSRF plus current terms version', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'VERIFICATION_REQUIRED',
            preauth: signupPreauth,
            csrfToken: 'anonymous-csrf-token',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('https://api.example.test/api/v1/');

    const bootstrap = await api.getMe();
    await api.register({ ...registrationInput, termsVersion: bootstrap.termsVersion });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.test/api/v1/auth/me',
      expect.objectContaining({ credentials: 'include' }),
    );
    const requestInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(requestInit.credentials).toBe('include');
    expect(headers.get('X-CSRF-Token')).toBe('anonymous-csrf-token');
    expect(JSON.parse(requestInit.body as string)).toMatchObject({
      username: 'sara',
      termsAccepted: true,
      termsVersion: '2026-08',
    });
  });

  it('accepts crash-safe registration finalization as authenticated', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
        .mockResolvedValueOnce(
          jsonResponse(
            {
              data: {
                status: 'AUTHENTICATED',
                user: activeUser,
                preauth: null,
                csrfToken: 'rotated-csrf-token',
              },
            },
            { status: 201 },
          ),
        ),
    );
    const api = createAuthApi('/api/v1');

    await api.getMe();
    await expect(api.register(registrationInput)).resolves.toMatchObject({
      status: 'AUTHENTICATED',
      snapshot: { user: activeUser, preauth: null },
    });
  });

  it('accepts no-step login, reauthentication, and contact changes without losing rotated CSRF', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'AUTHENTICATED',
            user: activeUser,
            preauth: null,
            csrfToken: 'login-csrf-token',
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'REAUTHENTICATED',
            user: activeUser,
            preauth: null,
            purpose: 'change_email',
            csrfToken: 'reauth-csrf-token',
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'CODE_SENT',
            channel: 'email',
            destinationMasked: 'n***@example.com',
            retryAfterSeconds: 60,
            expiresInSeconds: 300,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'EMAIL_CHANGED',
            user: { ...activeUser, email: 'new@example.com' },
            preauth: null,
            csrfToken: 'contact-csrf-token',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { success: true } }));
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('/api/v1');

    await api.getMe();
    await expect(
      api.login({ identifier: 'sara', password: 'correct password' }),
    ).resolves.toMatchObject({
      status: 'AUTHENTICATED',
      snapshot: { user: activeUser, preauth: null },
    });
    await expect(
      api.reauthenticate({ purpose: 'change_email', currentPassword: 'correct password' }),
    ).resolves.toMatchObject({
      status: 'REAUTHENTICATED',
      purpose: 'change_email',
      snapshot: { preauth: null, user: activeUser },
    });
    await expect(api.requestContactChange('email', 'new@example.com')).resolves.toMatchObject({
      status: 'CODE_SENT',
      destinationMasked: 'n***@example.com',
    });
    await expect(api.requestContactChange('email', 'new@example.com')).resolves.toMatchObject({
      status: 'EMAIL_CHANGED',
      snapshot: { user: { email: 'new@example.com' }, preauth: null },
    });
    await api.logout();

    const csrfHeaders = fetchMock.mock.calls
      .slice(1)
      .map(([, init]) => new Headers((init as RequestInit).headers).get('X-CSRF-Token'));
    expect(csrfHeaders).toEqual([
      'anonymous-csrf-token',
      'login-csrf-token',
      'reauth-csrf-token',
      'reauth-csrf-token',
      'contact-csrf-token',
    ]);
  });

  it('accepts no-step recovery readiness and uses its rotated CSRF for reset', async () => {
    const recoveryReady = {
      type: 'password_reset',
      stage: 'ready_for_password_reset',
      allowedChannels: ['email', 'sms'],
      completedChannels: ['email', 'sms'],
      destinations: { email: 's***@example.com', sms: '+98*****67' },
      expiresAt: '2026-08-22T13:00:00.000Z',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'READY_FOR_PASSWORD_RESET',
            user: null,
            preauth: recoveryReady,
            csrfToken: 'recovery-ready-csrf-token',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { success: true } }));
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('/api/v1');

    await api.getMe();
    await expect(api.forgotPassword('sara')).resolves.toMatchObject({
      status: 'READY_FOR_PASSWORD_RESET',
      snapshot: { preauth: recoveryReady, user: null },
    });
    await api.resetPassword({
      password: 'new correct horse battery staple',
      passwordConfirmation: 'new correct horse battery staple',
    });

    expect(
      new Headers((fetchMock.mock.calls[2]?.[1] as RequestInit).headers).get('X-CSRF-Token'),
    ).toBe('recovery-ready-csrf-token');
  });

  it('does not mistake invalid credentials for session expiry or discard CSRF', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'AUTH_INVALID_CREDENTIALS',
              message: 'database/provider detail must stay hidden',
            },
          },
          { status: 401 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: 'RECOVERY_STARTED',
            preauth: { ...signupPreauth, type: 'password_reset', stage: 'recovery_verification' },
            csrfToken: 'anonymous-csrf-token',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('/api/v1');
    const onExpired = vi.fn();
    api.setSessionExpiredHandler(onExpired);

    await api.getMe();
    await expect(
      api.login({ identifier: 'sara', password: 'wrong-password' }),
    ).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
      userMessage: 'نام کاربری یا ایمیل و رمز عبور را بررسی کنید.',
    });
    await api.forgotPassword('sara');

    expect(onExpired).not.toHaveBeenCalled();
    expect(
      new Headers((fetchMock.mock.calls[2]?.[1] as RequestInit).headers).get('X-CSRF-Token'),
    ).toBe('anonymous-csrf-token');
  });

  it('clears stale auth state only for a definitive session failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { code: 'AUTH_SESSION_EXPIRED', message: 'Expired' } },
          { status: 401 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('/api/v1');
    const onExpired = vi.fn();
    api.setSessionExpiredHandler(onExpired);

    await api.getMe();
    await expect(api.logout()).rejects.toMatchObject({ code: 'AUTH_SESSION_EXPIRED' });
    expect(onExpired).toHaveBeenCalledOnce();
    await expect(
      api.login({ identifier: 'sara', password: 'still-not-sent' }),
    ).rejects.toMatchObject({ code: 'AUTH_SESSION_EXPIRED' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses backend retry details for resend countdowns', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'AUTH_RATE_LIMITED',
              message: 'Too many requests',
              details: { retryAfterSeconds: 17 },
            },
          },
          { status: 429, headers: { 'Retry-After': '99' } },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const api = createAuthApi('/api/v1');

    await api.getMe();
    const error = await api.requestRegistrationCode('email').catch((cause: unknown) => cause);
    expect(error).toMatchObject({ code: 'AUTH_RATE_LIMITED' });
    expect(getRetryAfterSeconds(error)).toBe(17);
  });

  it('maps delivery failures to safe Persian copy', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(anonymousBootstrap))
        .mockResolvedValueOnce(
          jsonResponse(
            {
              error: {
                code: 'AUTH_DELIVERY_UNAVAILABLE',
                message: 'provider detail must stay hidden',
              },
            },
            { status: 503 },
          ),
        ),
    );
    const api = createAuthApi('/api/v1');

    await api.getMe();
    await expect(api.requestRegistrationCode('email')).rejects.toMatchObject({
      code: 'AUTH_DELIVERY_UNAVAILABLE',
      statusCode: 503,
      userMessage: 'ارسال کد فعلاً ممکن نیست؛ کمی بعد دوباره تلاش کنید.',
    });
  });

  it('rejects malformed success envelopes instead of trusting server data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: { csrfToken: 'token', user: null } })),
    );
    const api = createAuthApi('/api/v1');
    await expect(api.getMe()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });
});
