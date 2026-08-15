import {
  iranianAcademicFields,
  iranianUniversities,
} from '@/data/iran';
import type { TargetCountryCode } from '@/features/auth/types';

import type { SelectOption, SelectOptionGroup } from './onboarding-field';

export const degreeOptions = [
  { label: 'دیپلم', value: 'diploma' },
  { label: 'کاردانی', value: 'associate' },
  { label: 'کارشناسی', value: 'bachelor' },
  { label: 'کارشناسی ارشد', value: 'master' },
  { label: 'دکتری حرفه‌ای', value: 'professional-doctorate' },
  { label: 'دکتری تخصصی', value: 'phd' },
] as const satisfies readonly SelectOption[];

export const targetDegreeOptions = degreeOptions.filter(
  (option) => option.value !== 'diploma' && option.value !== 'associate',
);

export const studyStatusOptions = [
  { label: 'در حال تحصیل هستم', value: 'studying' },
  { label: 'فارغ‌التحصیل شده‌ام', value: 'graduated' },
] as const satisfies readonly SelectOption[];

export const gradeScaleOptions = [
  { label: 'از ۲۰', value: '20' },
  { label: 'از ۴', value: '4' },
  { label: 'از ۱۰۰', value: '100' },
] as const satisfies readonly SelectOption[];

function groupOptions<T>(
  values: readonly T[],
  groupOf: (value: T) => string,
  optionOf: (value: T) => SelectOption,
): SelectOptionGroup[] {
  const groups = new Map<string, SelectOption[]>();

  for (const value of values) {
    const group = groupOf(value);
    const options = groups.get(group) ?? [];
    options.push(optionOf(value));
    groups.set(group, options);
  }

  return [...groups].map(([label, options]) => ({ label, options }));
}

export const academicFieldOptionGroups = groupOptions(
  iranianAcademicFields,
  (field) => field.group,
  (field) => ({ label: field.nameFa, value: field.id }),
);

export const universityOptionGroups = groupOptions(
  iranianUniversities,
  (university) => university.institutionType,
  (university) => ({ label: university.nameFa, value: university.id }),
);

export const targetCountryOptions = [
  { label: 'آلمان', value: 'DE' },
  { label: 'فرانسه', value: 'FR' },
  { label: 'آمریکا', value: 'US' },
  { label: 'کانادا', value: 'CA' },
  { label: 'ایتالیا', value: 'IT' },
] as const satisfies readonly { label: string; value: TargetCountryCode }[];

export const languageCertificateOptions = [
  { label: 'IELTS Academic', value: 'ielts' },
  { label: 'TOEFL iBT', value: 'toefl' },
  { label: 'DELF', value: 'delf' },
  { label: 'DALF', value: 'dalf' },
  { label: 'TCF', value: 'tcf' },
  { label: 'TEF', value: 'tef' },
  { label: 'Duolingo English Test', value: 'duolingo' },
  { label: 'Cambridge English', value: 'cambridge' },
] as const satisfies readonly SelectOption[];

export const languageCertificateConfig: Record<
  string,
  {
    kind: 'level' | 'score';
    label: string;
    maximum?: number;
    minimum?: number;
    options?: readonly SelectOption[];
    placeholder: string;
    step?: number;
  }
> = {
  ielts: {
    kind: 'score',
    label: 'نمره',
    maximum: 9,
    minimum: 0,
    placeholder: 'مثلاً ۷.۵',
    step: 0.5,
  },
  toefl: {
    kind: 'score',
    label: 'نمره',
    maximum: 120,
    minimum: 0,
    placeholder: 'مثلاً ۱۰۳',
    step: 1,
  },
  tcf: {
    kind: 'score',
    label: 'نمره کل TCF',
    maximum: 699,
    minimum: 100,
    placeholder: 'مثلاً ۵۱۲',
    step: 1,
  },
  duolingo: {
    kind: 'score',
    label: 'نمره',
    maximum: 160,
    minimum: 10,
    placeholder: 'مثلاً ۱۲۰',
    step: 5,
  },
  delf: {
    kind: 'level',
    label: 'سطح',
    options: ['A1', 'A2', 'B1', 'B2'].map((level) => ({ label: level, value: level })),
    placeholder: 'سطح مدرک را انتخاب کنید',
  },
  dalf: {
    kind: 'level',
    label: 'سطح',
    options: ['C1', 'C2'].map((level) => ({ label: level, value: level })),
    placeholder: 'سطح مدرک را انتخاب کنید',
  },
  tef: {
    kind: 'level',
    label: 'سطح CEFR',
    options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({ label: level, value: level })),
    placeholder: 'سطح درج‌شده در مدرک',
  },
  cambridge: {
    kind: 'level',
    label: 'سطح',
    options: ['B2', 'C1', 'C2'].map((level) => ({ label: level, value: level })),
    placeholder: 'سطح مدرک را انتخاب کنید',
  },
};

export const annualBudgetOptions = [
  { label: 'کمتر از ۱۰٬۰۰۰ یورو', value: 'under-10000' },
  { label: '۱۰٬۰۰۰ تا ۲۰٬۰۰۰ یورو', value: '10000-20000' },
  { label: '۲۰٬۰۰۰ تا ۳۰٬۰۰۰ یورو', value: '20000-30000' },
  { label: 'بیشتر از ۳۰٬۰۰۰ یورو', value: 'over-30000' },
  { label: 'هنوز مطمئن نیستم', value: 'undecided' },
] as const satisfies readonly SelectOption[];

export const scholarshipOptions = [
  { label: 'خیلی مهم است', value: 'essential' },
  { label: 'ترجیح می‌دهم بورسیه داشته باشد', value: 'preferred' },
  { label: 'ضروری نیست', value: 'not-required' },
] as const satisfies readonly SelectOption[];

const intakeSeason = {
  fall: { label: 'پاییز', month: 8 },
  spring: { label: 'بهار', month: 0 },
} as const;

export function createIntakeOptions(referenceDate = new Date()): SelectOption[] {
  const startOfToday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const options: SelectOption[] = [];

  for (let year = referenceDate.getFullYear(); options.length < 4; year += 1) {
    for (const season of ['spring', 'fall'] as const) {
      const intake = intakeSeason[season];
      if (new Date(year, intake.month, 1) < startOfToday) continue;
      options.push({
        label: `${intake.label} ${new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(year)}`,
        value: `${season}-${year}`,
      });
      if (options.length === 4) break;
    }
  }

  return [...options, { label: 'هنوز مطمئن نیستم', value: 'undecided' }];
}
