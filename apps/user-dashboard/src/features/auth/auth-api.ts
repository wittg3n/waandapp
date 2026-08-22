import { z, type ZodType } from 'zod';

import { AppError } from '@/errors/app-error';
import { ERROR_CODES, type ErrorCode } from '@/errors/error-codes';
import { normalizeError } from '@/errors/normalize-error';
import type {
  AuthChannel,
  AuthSnapshot,
  AuthUser,
  CodeSentResult,
  InitialProfileData,
  PreauthContext,
  SecurityPurpose,
} from '@/features/auth/types';

const DEFAULT_API_URL = '/api/v1';

const initialProfileSchema = z.custom<InitialProfileData>(
  (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
);

const authUserSchema = z
  .object({
    id: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    emailVerified: z.boolean(),
    phoneVerified: z.boolean(),
    role: z.enum(['applicant', 'staff', 'admin']),
    status: z.enum(['pending_verification', 'active', 'suspended', 'deleted']),
    onboardingStatus: z.enum(['not_started', 'in_progress', 'completed']),
    initialProfile: initialProfileSchema.nullish(),
  })
  .transform(({ initialProfile, ...user }): AuthUser => ({
    ...user,
    ...(initialProfile ? { initialProfile } : {}),
  }));

const securityPurposeSchema = z.enum(['change_password', 'change_email', 'change_phone']);
const preauthSchema = z
  .object({
    type: z.enum(['signup', 'login', 'password_reset', 'step_up']),
    stage: z.enum([
      'verify_contacts',
      'second_step',
      'reauthenticated',
      'new_contact_verification',
      'recovery_verification',
      'ready_for_password_reset',
    ]),
    allowedChannels: z.array(z.enum(['email', 'sms'])),
    completedChannels: z.array(z.enum(['email', 'sms'])),
    destinations: z.object({ email: z.string().optional(), sms: z.string().optional() }),
    expiresAt: z.string().min(1),
    purpose: securityPurposeSchema.optional(),
  })
  .transform((preauth): PreauthContext => preauth);

const meEnvelopeSchema = z.object({
  data: z.object({
    csrfToken: z.string().min(1),
    preauth: preauthSchema.nullable(),
    termsVersion: z.string().min(1),
    user: authUserSchema.nullable(),
  }),
});

const transitionStatusSchema = z.enum([
  'VERIFICATION_REQUIRED',
  'SECOND_STEP_REQUIRED',
  'AUTHENTICATED',
  'RECOVERY_STARTED',
  'RECOVERY_VERIFICATION_REQUIRED',
  'READY_FOR_PASSWORD_RESET',
  'REAUTHENTICATED',
  'PASSWORD_CHANGED',
  'EMAIL_CHANGED',
  'PHONE_CHANGED',
]);

const transitionEnvelopeSchema = z.object({
  data: z.object({
    status: transitionStatusSchema,
    csrfToken: z.string().min(1),
    preauth: preauthSchema.nullable(),
    user: authUserSchema.nullish(),
    purpose: securityPurposeSchema.optional(),
    expiresAt: z.string().optional(),
  }),
});

const codeSentEnvelopeSchema = z.object({
  data: z.object({
    status: z.literal('CODE_SENT'),
    channel: z.enum(['email', 'sms']),
    destinationMasked: z.string().min(1),
    retryAfterSeconds: z.number().int().nonnegative(),
    expiresInSeconds: z.number().int().nonnegative(),
  }),
});

const successEnvelopeSchema = z.object({ data: z.object({ success: z.literal(true) }) });
const profileEnvelopeSchema = z.object({ data: z.object({ user: authUserSchema }) });

type UnknownRecord = Record<string, unknown>;
type SessionExpiredHandler = (error: AppError) => void;
type TransitionStatus = z.infer<typeof transitionStatusSchema>;

export interface AuthTransitionResult {
  status: TransitionStatus;
  snapshot: AuthSnapshot;
  purpose?: SecurityPurpose;
  expiresAt?: string;
}

export interface AuthBootstrapResult extends AuthSnapshot {
  termsVersion: string;
}

const serverCodeMap: Readonly<Record<string, ErrorCode>> = {
  VALIDATION_ERROR: ERROR_CODES.VALIDATION_ERROR,
  INVALID_JSON: ERROR_CODES.BAD_REQUEST,
  PAYLOAD_TOO_LARGE: ERROR_CODES.BAD_REQUEST,
  AUTH_INVALID_CREDENTIALS: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
  AUTH_INVALID_CODE: ERROR_CODES.AUTH_INVALID_CODE,
  AUTH_CODE_EXPIRED: ERROR_CODES.AUTH_CODE_EXPIRED,
  AUTH_TOO_MANY_ATTEMPTS: ERROR_CODES.AUTH_TOO_MANY_ATTEMPTS,
  AUTH_TOO_MANY_SENDS: ERROR_CODES.AUTH_TOO_MANY_SENDS,
  AUTH_RATE_LIMITED: ERROR_CODES.AUTH_RATE_LIMITED,
  RATE_LIMITED: ERROR_CODES.RATE_LIMITED,
  AUTH_UNAUTHORIZED: ERROR_CODES.AUTH_UNAUTHORIZED,
  AUTH_FORBIDDEN: ERROR_CODES.AUTH_FORBIDDEN,
  AUTH_SESSION_EXPIRED: ERROR_CODES.AUTH_SESSION_EXPIRED,
  AUTH_ACCOUNT_SUSPENDED: ERROR_CODES.AUTH_ACCOUNT_SUSPENDED,
  AUTH_CSRF_INVALID: ERROR_CODES.AUTH_CSRF_INVALID,
  AUTH_DELIVERY_UNAVAILABLE: ERROR_CODES.AUTH_DELIVERY_UNAVAILABLE,
  AUTH_PREAUTH_INVALID: ERROR_CODES.AUTH_PREAUTH_INVALID,
  AUTH_REAUTH_REQUIRED: ERROR_CODES.AUTH_REAUTH_REQUIRED,
  AUTH_IDENTITY_CONFLICT: ERROR_CODES.AUTH_IDENTITY_CONFLICT,
  AUTH_CHANNEL_NOT_ALLOWED: ERROR_CODES.AUTH_CHANNEL_NOT_ALLOWED,
  AUTH_CHANNEL_ALREADY_VERIFIED: ERROR_CODES.AUTH_CHANNEL_ALREADY_VERIFIED,
  AUTH_EMAIL_VERIFICATION_REQUIRED: ERROR_CODES.AUTH_EMAIL_VERIFICATION_REQUIRED,
  AUTH_CONTACT_UNCHANGED: ERROR_CODES.AUTH_CONTACT_UNCHANGED,
  NOT_FOUND: ERROR_CODES.NOT_FOUND,
  INTERNAL_ERROR: ERROR_CODES.SERVER_ERROR,
};

const statusCodeMap: Readonly<Record<number, ErrorCode>> = {
  400: ERROR_CODES.BAD_REQUEST,
  401: ERROR_CODES.AUTH_UNAUTHORIZED,
  403: ERROR_CODES.AUTH_FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  409: ERROR_CODES.CONFLICT,
  413: ERROR_CODES.BAD_REQUEST,
  422: ERROR_CODES.VALIDATION_ERROR,
  429: ERROR_CODES.AUTH_RATE_LIMITED,
  500: ERROR_CODES.SERVER_ERROR,
  502: ERROR_CODES.SERVER_ERROR,
  503: ERROR_CODES.SERVICE_UNAVAILABLE,
  504: ERROR_CODES.NETWORK_TIMEOUT,
};

const safeFieldMessages: Readonly<Record<string, string>> = {
  firstName: 'نام واردشده معتبر نیست.',
  lastName: 'نام خانوادگی واردشده معتبر نیست.',
  username: 'نام کاربری واردشده معتبر نیست.',
  identifier: 'نام کاربری یا ایمیل واردشده معتبر نیست.',
  email: 'ایمیل واردشده معتبر نیست.',
  phone: 'شماره موبایل واردشده معتبر نیست.',
  password: 'رمز عبور واردشده معتبر نیست.',
  passwordConfirmation: 'تکرار رمز عبور معتبر نیست.',
  code: 'کد تأیید واردشده معتبر نیست.',
  termsAccepted: 'پذیرش قوانین و شرایط الزامی است.',
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readErrorBody(payload: unknown): UnknownRecord | null {
  if (!isRecord(payload)) return null;
  return isRecord(payload.error) ? payload.error : payload;
}

function readRetryAfterSeconds(response: Response, body: UnknownRecord | null): number | undefined {
  const details = isRecord(body?.details) ? body.details : null;
  const bodyValue = details?.retryAfterSeconds;
  if (typeof bodyValue === 'number' && Number.isFinite(bodyValue) && bodyValue >= 0) {
    return Math.ceil(bodyValue);
  }

  const headerValue = response.headers.get('Retry-After');
  if (!headerValue) return undefined;
  const seconds = Number(headerValue);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}

function readFieldErrors(body: UnknownRecord | null): Record<string, string[]> | undefined {
  const details = isRecord(body?.details) ? body.details : null;
  if (!isRecord(details?.fields)) return undefined;

  const fields = Object.keys(details.fields).reduce<Record<string, string[]>>((result, field) => {
    result[field] = [safeFieldMessages[field] ?? 'مقدار واردشده معتبر نیست.'];
    return result;
  }, {});
  return Object.keys(fields).length > 0 ? fields : undefined;
}

function createApiError(response: Response, payload: unknown): AppError {
  const body = readErrorBody(payload);
  const serverCode = typeof body?.code === 'string' ? body.code : undefined;
  const code =
    (serverCode ? serverCodeMap[serverCode] : undefined) ??
    statusCodeMap[response.status] ??
    (response.status >= 500 ? ERROR_CODES.SERVER_ERROR : ERROR_CODES.UNKNOWN_ERROR);
  const retryAfterSeconds = readRetryAfterSeconds(response, body);

  return new AppError(code, {
    message: serverCode ?? `HTTP ${response.status}`,
    statusCode: response.status,
    fieldErrors: readFieldErrors(body),
    context: retryAfterSeconds === undefined ? undefined : { retryAfterSeconds },
  });
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

function parseEnvelope<T>(schema: ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return parsed.data;
  throw new AppError(ERROR_CODES.SERVER_ERROR, {
    message: 'Authentication API returned an invalid response.',
    source: 'server',
    cause: parsed.error,
  });
}

export function getRetryAfterSeconds(error: unknown): number | undefined {
  if (!(error instanceof AppError)) return undefined;
  const value = error.context?.retryAfterSeconds;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.ceil(value)
    : undefined;
}

export function createAuthApi(baseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  let csrfToken: string | null = null;
  let sessionExpiredHandler: SessionExpiredHandler | null = null;

  async function request(
    path: string,
    init: RequestInit = {},
    { sessionBound = false }: { sessionBound?: boolean } = {},
  ): Promise<unknown> {
    const method = (init.method ?? 'GET').toUpperCase();
    const isMutation = method !== 'GET' && method !== 'HEAD';
    if (isMutation && !csrfToken) {
      throw new AppError(ERROR_CODES.AUTH_SESSION_EXPIRED, {
        message: 'Bootstrap authentication before sending a mutation.',
      });
    }

    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body !== undefined) headers.set('Content-Type', 'application/json');
    if (isMutation) headers.set('X-CSRF-Token', csrfToken as string);

    let response: Response;
    try {
      response = await fetch(`${normalizedBaseUrl}${path}`, {
        ...init,
        credentials: 'include',
        headers,
      });
    } catch (cause) {
      const normalized = normalizeError(cause, { source: 'network' });
      if (normalized.code === ERROR_CODES.REQUEST_ABORTED) throw normalized;
      throw new AppError(ERROR_CODES.NETWORK_ERROR, { message: normalized.message, cause });
    }

    const payload = await readPayload(response);
    if (response.ok) return payload;

    const error = createApiError(response, payload);
    const invalidatesSession =
      error.code === ERROR_CODES.AUTH_SESSION_EXPIRED ||
      error.code === ERROR_CODES.AUTH_CSRF_INVALID ||
      error.code === ERROR_CODES.AUTH_ACCOUNT_SUSPENDED ||
      (sessionBound && error.code === ERROR_CODES.AUTH_UNAUTHORIZED);
    if (invalidatesSession) {
      csrfToken = null;
      sessionExpiredHandler?.(error);
    }
    throw error;
  }

  function parseTransition(
    payload: unknown,
    expectedStatuses: readonly TransitionStatus[],
  ): AuthTransitionResult {
    const { data } = parseEnvelope(transitionEnvelopeSchema, payload);
    if (!expectedStatuses.includes(data.status)) {
      throw new AppError(ERROR_CODES.SERVER_ERROR, {
        message: `Unexpected authentication status: ${data.status}`,
      });
    }
    csrfToken = data.csrfToken;
    return {
      status: data.status,
      snapshot: { preauth: data.preauth, user: data.user ?? null },
      ...(data.purpose ? { purpose: data.purpose } : {}),
      ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
    };
  }

  async function requestCode(path: string, body: object, signal?: AbortSignal) {
    const payload = await request(path, { method: 'POST', body: JSON.stringify(body), signal });
    return parseEnvelope(codeSentEnvelopeSchema, payload).data as CodeSentResult;
  }

  return {
    async getMe(signal?: AbortSignal): Promise<AuthBootstrapResult> {
      const { data } = parseEnvelope(meEnvelopeSchema, await request('/auth/me', { signal }));
      csrfToken = data.csrfToken;
      return { preauth: data.preauth, termsVersion: data.termsVersion, user: data.user };
    },

    async register(
      input: {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        phone: string;
        password: string;
        passwordConfirmation: string;
        termsAccepted: true;
        termsVersion: string;
      },
      signal?: AbortSignal,
    ): Promise<AuthTransitionResult> {
      const payload = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
        signal,
      });
      return parseTransition(payload, ['VERIFICATION_REQUIRED', 'AUTHENTICATED']);
    },

    async login(
      input: { identifier: string; password: string },
      signal?: AbortSignal,
    ): Promise<AuthTransitionResult> {
      const payload = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
        signal,
      });
      return parseTransition(payload, ['SECOND_STEP_REQUIRED', 'VERIFICATION_REQUIRED']);
    },

    requestRegistrationCode(channel: AuthChannel, signal?: AbortSignal) {
      const segment = channel === 'sms' ? 'phone' : 'email';
      return requestCode(`/auth/register/${segment}/request`, {}, signal);
    },

    async verifyRegistrationCode(
      channel: AuthChannel,
      code: string,
      signal?: AbortSignal,
    ): Promise<AuthTransitionResult> {
      const segment = channel === 'sms' ? 'phone' : 'email';
      const payload = await request(`/auth/register/${segment}/verify`, {
        method: 'POST',
        body: JSON.stringify({ code }),
        signal,
      });
      return parseTransition(payload, ['VERIFICATION_REQUIRED', 'AUTHENTICATED']);
    },

    requestSecondStep(channel: AuthChannel, signal?: AbortSignal) {
      return requestCode('/auth/second-step/request', { channel }, signal);
    },

    async verifySecondStep(
      channel: AuthChannel,
      code: string,
      signal?: AbortSignal,
    ): Promise<AuthTransitionResult> {
      const payload = await request('/auth/second-step/verify', {
        method: 'POST',
        body: JSON.stringify({ channel, code }),
        signal,
      });
      return parseTransition(payload, ['AUTHENTICATED', 'REAUTHENTICATED']);
    },

    async forgotPassword(identifier: string, signal?: AbortSignal): Promise<AuthTransitionResult> {
      const payload = await request('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
        signal,
      });
      return parseTransition(payload, ['RECOVERY_STARTED']);
    },

    requestRecoveryCode(channel: AuthChannel, signal?: AbortSignal) {
      const segment = channel === 'sms' ? 'phone' : 'email';
      return requestCode(`/auth/password/recovery/${segment}/request`, {}, signal);
    },

    async verifyRecoveryCode(
      channel: AuthChannel,
      code: string,
      signal?: AbortSignal,
    ): Promise<AuthTransitionResult> {
      const segment = channel === 'sms' ? 'phone' : 'email';
      const payload = await request(`/auth/password/recovery/${segment}/verify`, {
        method: 'POST',
        body: JSON.stringify({ code }),
        signal,
      });
      return parseTransition(payload, [
        'RECOVERY_VERIFICATION_REQUIRED',
        'READY_FOR_PASSWORD_RESET',
      ]);
    },

    async resetPassword(input: { password: string; passwordConfirmation: string }): Promise<void> {
      const payload = await request('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      parseEnvelope(successEnvelopeSchema, payload);
      csrfToken = null;
    },

    async reauthenticate(input: {
      purpose: SecurityPurpose;
      currentPassword: string;
    }): Promise<AuthTransitionResult> {
      const payload = await request(
        '/auth/reauth',
        { method: 'POST', body: JSON.stringify(input) },
        { sessionBound: true },
      );
      return parseTransition(payload, ['SECOND_STEP_REQUIRED']);
    },

    async changePassword(input: {
      password: string;
      passwordConfirmation: string;
    }): Promise<AuthTransitionResult> {
      const payload = await request(
        '/auth/password/change',
        { method: 'POST', body: JSON.stringify(input) },
        { sessionBound: true },
      );
      return parseTransition(payload, ['PASSWORD_CHANGED']);
    },

    requestContactChange(channel: AuthChannel, destination: string) {
      const segment = channel === 'sms' ? 'phone' : 'email';
      const body = channel === 'sms' ? { phone: destination } : { email: destination };
      return requestCode(`/auth/${segment}/change/request`, body);
    },

    async verifyContactChange(channel: AuthChannel, code: string): Promise<AuthTransitionResult> {
      const segment = channel === 'sms' ? 'phone' : 'email';
      const payload = await request(
        `/auth/${segment}/change/verify`,
        { method: 'POST', body: JSON.stringify({ code }) },
        { sessionBound: true },
      );
      return parseTransition(payload, [channel === 'sms' ? 'PHONE_CHANGED' : 'EMAIL_CHANGED']);
    },

    async updateProfile(profile: InitialProfileData): Promise<AuthUser> {
      const payload = await request(
        '/auth/me/profile',
        { method: 'PUT', body: JSON.stringify(profile) },
        { sessionBound: true },
      );
      return parseEnvelope(profileEnvelopeSchema, payload).data.user;
    },

    async logout(signal?: AbortSignal): Promise<void> {
      const payload = await request(
        '/auth/logout',
        { method: 'POST', body: JSON.stringify({}), signal },
        { sessionBound: true },
      );
      parseEnvelope(successEnvelopeSchema, payload);
      csrfToken = null;
    },

    async logoutAll(): Promise<void> {
      const payload = await request(
        '/auth/logout-all',
        { method: 'POST', body: JSON.stringify({}) },
        { sessionBound: true },
      );
      parseEnvelope(successEnvelopeSchema, payload);
      csrfToken = null;
    },

    setSessionExpiredHandler(handler: SessionExpiredHandler | null): () => void {
      sessionExpiredHandler = handler;
      return () => {
        if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
      };
    },
  };
}

export const authApi = createAuthApi();
