import { ERROR_CODES, type ErrorCode } from '@/errors/error-codes';
import type { ErrorSeverity, ErrorSource } from '@/errors/app-error';

export interface ErrorDefinition {
  title: string;
  userMessage: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  retryable: boolean;
}

export const ERROR_CATALOG = {
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: 'مشکلی پیش آمد',
    userMessage: 'خطای غیرمنتظره‌ای رخ داد.',
    severity: 'error',
    source: 'unknown',
    retryable: true,
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: 'ارتباط برقرار نشد',
    userMessage: 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
    severity: 'error',
    source: 'network',
    retryable: true,
  },
  [ERROR_CODES.NETWORK_TIMEOUT]: {
    title: 'پاسخی دریافت نشد',
    userMessage: 'زمان انتظار برای پاسخ سرور به پایان رسید. دوباره تلاش کنید.',
    severity: 'warning',
    source: 'network',
    retryable: true,
  },
  [ERROR_CODES.REQUEST_ABORTED]: {
    title: 'درخواست لغو شد',
    userMessage: 'درخواست پیش از تکمیل لغو شد.',
    severity: 'info',
    source: 'network',
    retryable: false,
  },
  [ERROR_CODES.BAD_REQUEST]: {
    title: 'درخواست نامعتبر است',
    userMessage: 'اطلاعات ارسال‌شده معتبر نیست.',
    severity: 'warning',
    source: 'validation',
    retryable: false,
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    title: 'ورود لازم است',
    userMessage: 'برای ادامه باید وارد حساب کاربری شوید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.SESSION_EXPIRED]: {
    title: 'نشست شما منقضی شد',
    userMessage: 'نشست شما منقضی شده است. دوباره وارد شوید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.FORBIDDEN]: {
    title: 'دسترسی مجاز نیست',
    userMessage: 'شما اجازه دسترسی به این بخش را ندارید.',
    severity: 'warning',
    source: 'authorization',
    retryable: false,
  },
  [ERROR_CODES.NOT_FOUND]: {
    title: 'صفحه پیدا نشد',
    userMessage: 'صفحه یا اطلاعات موردنظر پیدا نشد.',
    severity: 'warning',
    source: 'route',
    retryable: false,
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    title: 'اطلاعات نیاز به بررسی دارد',
    userMessage: 'لطفاً اطلاعات واردشده را بررسی کنید.',
    severity: 'warning',
    source: 'validation',
    retryable: false,
  },
  [ERROR_CODES.CONFLICT]: {
    title: 'امکان ثبت اطلاعات نیست',
    userMessage: 'این اطلاعات با موردی که از قبل ثبت شده تداخل دارد.',
    severity: 'warning',
    source: 'server',
    retryable: false,
  },
  [ERROR_CODES.RATE_LIMITED]: {
    title: 'درخواست‌های زیادی ارسال شد',
    userMessage: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
    severity: 'warning',
    source: 'server',
    retryable: true,
  },
  [ERROR_CODES.SERVER_ERROR]: {
    title: 'خطای سرور',
    userMessage: 'مشکلی در سرور رخ داده است. کمی بعد دوباره تلاش کنید.',
    severity: 'error',
    source: 'server',
    retryable: true,
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    title: 'سرویس در دسترس نیست',
    userMessage: 'سرویس موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.',
    severity: 'error',
    source: 'server',
    retryable: true,
  },
  [ERROR_CODES.ROUTE_ERROR]: {
    title: 'صفحه بارگذاری نشد',
    userMessage: 'در بارگذاری این صفحه مشکلی رخ داد.',
    severity: 'error',
    source: 'route',
    retryable: true,
  },
  [ERROR_CODES.CLIENT_ERROR]: {
    title: 'خطای برنامه',
    userMessage: 'در اجرای برنامه مشکلی رخ داد. دوباره تلاش کنید.',
    severity: 'critical',
    source: 'client',
    retryable: true,
  },
} as const satisfies Record<ErrorCode, ErrorDefinition>;

export function getErrorDefinition(code: ErrorCode): ErrorDefinition {
  return ERROR_CATALOG[code];
}
