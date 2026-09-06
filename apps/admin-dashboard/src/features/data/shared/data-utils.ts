import type {
  DegreeLevel,
  ExamGroup,
  QualityEntityType,
  QualityIssueType,
  SourceType,
  UniversityType,
} from '../types/data.types';

export const degreeLabels: Record<DegreeLevel, string> = {
  ASSOCIATE: 'کاردانی',
  BACHELOR: 'کارشناسی',
  MASTER: 'کارشناسی ارشد',
  PHD: 'دکتری',
  INTEGRATED: 'پیوسته',
  OTHER: 'سایر',
  UNKNOWN: 'نامشخص',
};
export const examGroupLabels: Record<ExamGroup, string> = {
  MATH: 'ریاضی',
  EXPERIMENTAL: 'تجربی',
  HUMANITIES: 'انسانی',
  ART: 'هنر',
  LANGUAGE: 'زبان',
  OTHER: 'سایر',
};
export const universityTypeLabels: Record<UniversityType, string> = {
  PUBLIC: 'دولتی',
  PRIVATE: 'خصوصی',
  OTHER: 'سایر',
};
export const sourceTypeLabels: Record<SourceType, string> = {
  SANJESH_PDF: 'PDF سازمان سنجش',
  OFFICIAL_WEBSITE: 'وب‌سایت رسمی',
  MANUAL: 'ثبت دستی',
};
export const statusLabels: Record<string, string> = {
  ACTIVE: 'فعال',
  INACTIVE: 'غیرفعال',
  ARCHIVED: 'آرشیوشده',
  SUPERSEDED: 'جایگزین‌شده',
  PENDING: 'در انتظار',
  PARSING: 'در حال استخراج',
  VALIDATING: 'در حال اعتبارسنجی',
  REVIEW_REQUIRED: 'نیازمند بازبینی',
  READY_TO_COMMIT: 'آماده ثبت',
  COMMITTED: 'ثبت نهایی',
  FAILED: 'ناموفق',
  OPEN: 'باز',
  RESOLVED: 'حل‌شده',
  IGNORED: 'نادیده گرفته‌شده',
  VALID: 'معتبر',
  WARNING: 'هشدار',
  INVALID: 'نامعتبر',
  INFO: 'اطلاعاتی',
  CRITICAL: 'بحرانی',
};
export const issueTypeLabels: Record<QualityIssueType, string> = {
  DUPLICATE_UNIVERSITY: 'دانشگاه تکراری',
  MISSING_UNIVERSITY_LOCATION: 'موقعیت ناقص دانشگاه',
  UNMAPPED_MAJOR: 'رشته نگاشت‌نشده',
  INVALID_ADMISSION_CODE: 'کد پذیرش نامعتبر',
  UNKNOWN_DEGREE_LEVEL: 'مقطع نامشخص',
  ORPHAN_PROGRAM: 'برنامه بدون مرجع',
  MISSING_SOURCE: 'منبع مفقود',
};
export const entityTypeLabels: Record<QualityEntityType, string> = {
  UNIVERSITY: 'دانشگاه',
  MAJOR: 'رشته',
  PROGRAM: 'برنامه دانشگاهی',
  ADMISSION: 'پذیرش',
  IMPORT: 'Import',
  RAW_RECORD: 'رکورد خام',
};

export function formatDataDate(value?: string, includeTime = false) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

export function entityPath(type: QualityEntityType, id?: string) {
  if (!id) return undefined;
  const paths: Partial<Record<QualityEntityType, string>> = {
    UNIVERSITY: '/data/universities/',
    MAJOR: '/data/majors/',
    PROGRAM: '/data/programs/',
    ADMISSION: '/data/admissions/',
    IMPORT: '/data/imports/',
  };
  return paths[type] ? `${paths[type]}${id}` : undefined;
}
