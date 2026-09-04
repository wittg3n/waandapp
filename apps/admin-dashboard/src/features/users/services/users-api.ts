import type {
  AdminSession,
  ManagedUser,
  UserAuditResult,
  UserDetail,
  UserStatusAction,
  UsersResult,
} from '@/features/users/types/users.types';

export const ADMIN_MOCK_MODE =
  import.meta.env.DEV &&
  import.meta.env.MODE === 'development' &&
  import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

const DEFAULT_API_URL = '/api/v1';
const baseUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
let csrfToken: string | null = null;

type JsonRecord = Record<string, unknown>;

export class AdminApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function request(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  const mutation = method !== 'GET' && method !== 'HEAD';
  if (mutation && !csrfToken) await getRealAdminSession();

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (mutation && csrfToken) headers.set('X-CSRF-Token', csrfToken);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/admin${path}`, {
      ...init,
      credentials: 'include',
      headers,
    });
  } catch (cause) {
    throw new AdminApiError('ارتباط با سرور برقرار نشد.', 0, String(cause));
  }

  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = isRecord(payload) && isRecord(payload.error) ? payload.error : null;
    const code = typeof error?.code === 'string' ? error.code : undefined;
    const message =
      response.status === 401
        ? 'نشست مدیریت معتبر نیست.'
        : response.status === 403
          ? 'دسترسی لازم برای این عملیات را ندارید.'
          : response.status === 404
            ? 'کاربر موردنظر پیدا نشد.'
            : 'انجام درخواست با خطا روبه‌رو شد.';
    throw new AdminApiError(message, response.status, code);
  }
  return payload;
}

function dataFrom(payload: unknown): JsonRecord {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new AdminApiError('پاسخ سرور معتبر نیست.', 500, 'INVALID_RESPONSE');
  }
  return payload.data;
}

async function getRealAdminSession(signal?: AbortSignal): Promise<AdminSession> {
  const data = dataFrom(await request('/auth/me', { signal }));
  if (typeof data.csrfToken !== 'string') {
    throw new AdminApiError('نشست مدیریت معتبر نیست.', 401, 'INVALID_SESSION');
  }
  csrfToken = data.csrfToken;
  return { user: (data.user as AdminSession['user']) ?? null };
}

export interface UsersRepository {
  list(params: URLSearchParams, signal?: AbortSignal): Promise<UsersResult>;
  get(userId: string, signal?: AbortSignal): Promise<UserDetail>;
  update(
    userId: string,
    input: { firstName?: string; lastName?: string; reason: string },
  ): Promise<ManagedUser>;
  changeStatus(userId: string, status: UserStatusAction, reason: string): Promise<ManagedUser>;
  resetVerification(
    userId: string,
    channel: 'email' | 'phone',
    reason: string,
  ): Promise<ManagedUser>;
  revokeAllSessions(userId: string, reason: string): Promise<void>;
  audit(userId: string, signal?: AbortSignal): Promise<UserAuditResult>;
}

const realUsersRepository: UsersRepository = {
  async list(params: URLSearchParams, signal?: AbortSignal): Promise<UsersResult> {
    const query = new URLSearchParams(params);
    query.set('adminRole', 'USER');
    return dataFrom(await request(`/users?${query}`, { signal })) as unknown as UsersResult;
  },

  async get(userId: string, signal?: AbortSignal): Promise<UserDetail> {
    const data = dataFrom(await request(`/users/${encodeURIComponent(userId)}`, { signal }));
    return data.user as UserDetail;
  },

  async update(
    userId: string,
    input: { firstName?: string; lastName?: string; reason: string },
  ): Promise<ManagedUser> {
    const data = dataFrom(
      await request(`/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    );
    return data.user as ManagedUser;
  },

  async changeStatus(userId: string, status: UserStatusAction, reason: string) {
    const data = dataFrom(
      await request(`/users/${encodeURIComponent(userId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    );
    return data.user as ManagedUser;
  },

  async resetVerification(userId: string, channel: 'email' | 'phone', reason: string) {
    const data = dataFrom(
      await request(`/users/${encodeURIComponent(userId)}/verification/${channel}/reset`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    );
    return data.user as ManagedUser;
  },

  async revokeAllSessions(userId: string, reason: string) {
    await request(`/users/${encodeURIComponent(userId)}/sessions/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async audit(userId: string, signal?: AbortSignal): Promise<UserAuditResult> {
    const query = new URLSearchParams({ resourceType: 'USER', resourceId: userId, pageSize: '50' });
    return dataFrom(await request(`/audit?${query}`, { signal })) as unknown as UserAuditResult;
  },
};

const mockModulePromise = ADMIN_MOCK_MODE ? import('@/features/users/mocks/users-mock') : null;

async function selectedRepository() {
  return mockModulePromise ? (await mockModulePromise).mockUsersRepository : realUsersRepository;
}

export async function getAdminSession(signal?: AbortSignal): Promise<AdminSession> {
  return mockModulePromise
    ? (await mockModulePromise).getMockAdminSession(signal)
    : getRealAdminSession(signal);
}

export const usersApi = {
  supportsBan: ADMIN_MOCK_MODE,
  async list(...args: Parameters<UsersRepository['list']>) {
    return (await selectedRepository()).list(...args);
  },
  async get(...args: Parameters<UsersRepository['get']>) {
    return (await selectedRepository()).get(...args);
  },
  async update(...args: Parameters<UsersRepository['update']>) {
    return (await selectedRepository()).update(...args);
  },
  async changeStatus(...args: Parameters<UsersRepository['changeStatus']>) {
    return (await selectedRepository()).changeStatus(...args);
  },
  async resetVerification(...args: Parameters<UsersRepository['resetVerification']>) {
    return (await selectedRepository()).resetVerification(...args);
  },
  async revokeAllSessions(...args: Parameters<UsersRepository['revokeAllSessions']>) {
    return (await selectedRepository()).revokeAllSessions(...args);
  },
  async audit(...args: Parameters<UsersRepository['audit']>) {
    return (await selectedRepository()).audit(...args);
  },
};
