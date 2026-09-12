import type { AdminSessionUser } from '@/features/users/types/users.types';

const base = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');
let csrfToken = '';
let bootstrap: Promise<AdminSnapshot> | null = null;
export interface AdminSnapshot {
  user: AdminSessionUser | null;
  preauth?: {
    allowedChannels: Array<'email' | 'sms'>;
    destinations: Partial<Record<'email' | 'sms', string>>;
  } | null;
}
export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(
      status === 403
        ? 'اجازه انجام این عملیات را ندارید.'
        : status === 429
          ? 'تعداد تلاش‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.'
          : status === 401
            ? 'اطلاعات ورود یا نشست معتبر نیست.'
            : 'درخواست انجام نشد. دوباره تلاش کنید.',
    );
    this.status = status;
    this.code = code;
  }
}
export async function adminRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  if (method !== 'GET' && !csrfToken) await getAdminSnapshot();
  const response = await fetch(`${base}/admin${path}`, {
    method,
    signal: options.signal,
    credentials: 'include',
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/'))
      window.dispatchEvent(new Event('waand-admin-expired'));
    if (result?.error?.code === 'AUTH_CSRF_INVALID') {
      csrfToken = '';
      window.dispatchEvent(new Event('waand-admin-refresh'));
    }
    throw new AdminApiError(response.status, result?.error?.code ?? 'REQUEST_FAILED');
  }
  if (result?.data?.csrfToken) csrfToken = result.data.csrfToken;
  return result?.data as T;
}
export function getAdminSnapshot(): Promise<AdminSnapshot> {
  bootstrap ??= adminRequest<AdminSnapshot>('/auth/me').finally(() => {
    bootstrap = null;
  });
  return bootstrap;
}
export async function logoutAdmin() {
  await adminRequest('/auth/logout', { method: 'POST', body: {} });
  csrfToken = '';
  window.dispatchEvent(new Event('waand-admin-expired'));
}
