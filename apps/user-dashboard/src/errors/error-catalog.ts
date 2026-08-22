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
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    title: 'ورود انجام نشد',
    userMessage: 'نام کاربری یا ایمیل و رمز عبور را بررسی کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_INVALID_CODE]: {
    title: 'کد صحیح نیست',
    userMessage: 'کد واردشده صحیح نیست.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_CODE_EXPIRED]: {
    title: 'کد منقضی شده است',
    userMessage: 'کد منقضی شده است؛ کد جدید دریافت کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_TOO_MANY_ATTEMPTS]: {
    title: 'تلاش‌های ناموفق زیاد است',
    userMessage: 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد جدید دریافت کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_TOO_MANY_SENDS]: {
    title: 'ارسال کد محدود شده است',
    userMessage: 'تعداد کدهای ارسالی بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_RATE_LIMITED]: {
    title: 'درخواست‌های زیادی ارسال شد',
    userMessage: 'لطفاً کمی بعد دوباره تلاش کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_UNAUTHORIZED]: {
    title: 'ورود لازم است',
    userMessage: 'برای ادامه باید وارد حساب کاربری شوید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_FORBIDDEN]: {
    title: 'دسترسی مجاز نیست',
    userMessage: 'شما اجازه دسترسی به این بخش را ندارید.',
    severity: 'warning',
    source: 'authorization',
    retryable: false,
  },
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: {
    title: 'نشست شما منقضی شد',
    userMessage: 'نشست شما منقضی شده است؛ دوباره وارد شوید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_ACCOUNT_SUSPENDED]: {
    title: 'حساب در دسترس نیست',
    userMessage: 'این حساب در حال حاضر قابل استفاده نیست.',
    severity: 'warning',
    source: 'authorization',
    retryable: false,
  },
  [ERROR_CODES.AUTH_CSRF_INVALID]: {
    title: 'نشست نیاز به نوسازی دارد',
    userMessage: 'نشست شما معتبر نیست؛ صفحه را تازه‌سازی و دوباره تلاش کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_DELIVERY_UNAVAILABLE]: {
    title: 'ارسال کد انجام نشد',
    userMessage: 'ارسال کد فعلاً ممکن نیست؛ کمی بعد دوباره تلاش کنید.',
    severity: 'error',
    source: 'server',
    retryable: true,
  },
  [ERROR_CODES.AUTH_PREAUTH_INVALID]: {
    title: 'فرایند تأیید منقضی شد',
    userMessage: 'زمان این فرایند به پایان رسیده است؛ دوباره از ابتدا تلاش کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_REAUTH_REQUIRED]: {
    title: 'تأیید دوباره لازم است',
    userMessage: 'برای این تغییر امنیتی، هویت خود را دوباره تأیید کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: true,
  },
  [ERROR_CODES.AUTH_IDENTITY_CONFLICT]: {
    title: 'اطلاعات هویتی در دسترس نیست',
    userMessage: 'نام کاربری، ایمیل یا شماره موبایل واردشده قبلاً ثبت شده است.',
    severity: 'warning',
    source: 'validation',
    retryable: true,
  },
  [ERROR_CODES.AUTH_CHANNEL_NOT_ALLOWED]: {
    title: 'روش تأیید مجاز نیست',
    userMessage: 'این روش تأیید برای فرایند فعلی قابل استفاده نیست.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_CHANNEL_ALREADY_VERIFIED]: {
    title: 'این مرحله تکمیل شده است',
    userMessage: 'این روش قبلاً تأیید شده است؛ مرحله بعد را ادامه دهید.',
    severity: 'info',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_EMAIL_VERIFICATION_REQUIRED]: {
    title: 'ابتدا ایمیل را تأیید کنید',
    userMessage: 'پیش از تأیید موبایل باید ایمیل را تأیید کنید.',
    severity: 'warning',
    source: 'authentication',
    retryable: false,
  },
  [ERROR_CODES.AUTH_CONTACT_UNCHANGED]: {
    title: 'اطلاعات تغییری نکرد',
    userMessage: 'ایمیل یا شماره جدید باید با مقدار فعلی متفاوت باشد.',
    severity: 'warning',
    source: 'validation',
    retryable: true,
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
