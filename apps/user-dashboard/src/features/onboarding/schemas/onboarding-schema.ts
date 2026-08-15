import { z } from 'zod';

import {
  isIranianAcademicFieldId,
  isIranianUniversityId,
  resolveIranianAcademicFieldId,
  resolveIranianUniversityId,
} from '@/data/iran';
import {
  annualBudgetValues,
  educationDegreeValues,
  gradeScaleValues,
  intakeSeasonValues,
  languageCertificateTypeValues,
  scholarshipImportanceValues,
  studyStatusValues,
  targetCountryCodes,
  targetDegreeValues,
  type InitialProfileData,
  type IntakeValue,
  type LanguageCertificate,
} from '@/features/auth/types';

const optionalSelection = <const Values extends readonly [string, ...string[]]>(values: Values) =>
  z.union([z.enum(values), z.literal('')]);

const selection = <const Values extends readonly [string, ...string[]]>(
  values: Values,
  message: string,
) =>
  optionalSelection(values).superRefine((value, context) => {
    if (value === '') context.addIssue({ code: 'custom', message });
  });

function datasetSelection(
  validator: (value: string) => boolean,
  message: string,
): z.ZodString {
  return z.string().refine((value) => validator(value), message);
}

const certificateTypeSchema = optionalSelection(languageCertificateTypeValues);
const intakeTermValues = [...intakeSeasonValues, 'undecided'] as const;
const intakeTermSchema = optionalSelection(intakeTermValues);

const educationShape = {
  currentDegree: selection(educationDegreeValues, 'لطفاً مقطع تحصیلی را انتخاب کنید.'),
  fieldId: datasetSelection(isIranianAcademicFieldId, 'رشته تحصیلی را انتخاب کنید.'),
  universityId: datasetSelection(isIranianUniversityId, 'دانشگاه را انتخاب کنید.'),
  studyStatus: selection(studyStatusValues, 'وضعیت تحصیل را انتخاب کنید.'),
  gradeAverage: z.string().trim().min(1, 'معدل را وارد کنید.'),
  gradeScale: selection(gradeScaleValues, 'سیستم نمره‌دهی را انتخاب کنید.'),
};

const applicationGoalShape = {
  targetFieldId: datasetSelection(isIranianAcademicFieldId, 'رشته یا حوزه موردنظر را انتخاب کنید.'),
  targetDegree: selection(targetDegreeValues, 'مقطع موردنظر را انتخاب کنید.'),
  targetCountries: z
    .array(z.enum(targetCountryCodes))
    .min(1, 'حداقل یک کشور را انتخاب کنید.'),
  intake: z.object({
    term: intakeTermSchema,
    year: z.number().int().nullable(),
  }),
};

const languageCertificateFormSchema = z.object({
  type: certificateTypeSchema,
  score: z.string(),
  level: z.string(),
  testDate: z.string().optional(),
});

const languageShape = {
  hasLanguageCertificate: z.boolean().nullable(),
  languageCertificates: z.array(languageCertificateFormSchema),
};

const preferencesShape = {
  annualBudget: selection(annualBudgetValues, 'بودجه تقریبی سالانه را انتخاب کنید.'),
  scholarshipImportance: selection(
    scholarshipImportanceValues,
    'اهمیت بورسیه را مشخص کنید.',
  ),
};

const onboardingFormSchema = z.object({
  ...educationShape,
  ...applicationGoalShape,
  ...languageShape,
  ...preferencesShape,
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
export type LanguageCertificateFormValue = z.infer<typeof languageCertificateFormSchema>;
export type IntakeFormValue = OnboardingFormValues['intake'];
export type OnboardingDataStep = 0 | 1 | 2 | 3;

export const emptyLanguageCertificate: LanguageCertificateFormValue = {
  type: '',
  score: '',
  level: '',
  testDate: '',
};

export const onboardingDefaultValues: OnboardingFormValues = {
  currentDegree: '',
  fieldId: '',
  universityId: '',
  studyStatus: '',
  gradeAverage: '',
  gradeScale: '',
  targetFieldId: '',
  targetDegree: '',
  targetCountries: [],
  intake: { term: '', year: null },
  hasLanguageCertificate: null,
  languageCertificates: [],
  annualBudget: '',
  scholarshipImportance: '',
};

const localizedDigits: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export function parseLocalizedNumber(value: string): number | null {
  const normalized = value
    .trim()
    .replace(/[۰-۹٠-٩]/g, (digit) => localizedDigits[digit] ?? digit)
    .replace(/[٫,/]/g, '.')
    .replace(/[٬\s]/g, '');

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

type EducationStepValues = z.infer<z.ZodObject<typeof educationShape>>;

function refineEducation(values: EducationStepValues, context: z.RefinementCtx): void {
  const average = parseLocalizedNumber(values.gradeAverage);
  if (average === null) {
    context.addIssue({
      code: 'custom',
      message: 'معدل را به‌صورت عدد وارد کنید.',
      path: ['gradeAverage'],
    });
    return;
  }

  if (values.gradeScale === '') return;
  const maximum = { '4': 4, '20': 20, '100': 100 }[values.gradeScale];
  if (average < 0 || average > maximum) {
    context.addIssue({
      code: 'custom',
      message: `معدل باید عددی بین ۰ و ${maximum.toLocaleString('fa-IR')} باشد.`,
      path: ['gradeAverage'],
    });
  }
}

type ApplicationGoalStepValues = z.infer<z.ZodObject<typeof applicationGoalShape>>;

function refineApplicationGoal(values: ApplicationGoalStepValues, context: z.RefinementCtx): void {
  const { term, year } = values.intake;
  if (term === '') {
    context.addIssue({
      code: 'custom',
      message: 'زمان شروع تحصیل را انتخاب کنید.',
      path: ['intake', 'term'],
    });
    return;
  }

  if (term === 'undecided') {
    if (year !== null) {
      context.addIssue({
        code: 'custom',
        message: 'برای گزینه نامشخص، سال نباید ثبت شود.',
        path: ['intake', 'year'],
      });
    }
    return;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const intakeDate = year === null ? null : new Date(year, term === 'spring' ? 0 : 8, 1);
  if (
    year === null ||
    year > today.getFullYear() + 10 ||
    intakeDate === null ||
    intakeDate < startOfToday
  ) {
    context.addIssue({
      code: 'custom',
      message: 'یک ورودی معتبر در سال‌های آینده انتخاب کنید.',
      path: ['intake', 'year'],
    });
  }
}

type LanguageStepValues = z.infer<z.ZodObject<typeof languageShape>>;

function addCertificateIssue(
  context: z.RefinementCtx,
  index: number,
  field: 'type' | 'score' | 'level',
  message: string,
): void {
  context.addIssue({
    code: 'custom',
    message,
    path: ['languageCertificates', index, field],
  });
}

function validateScore(
  value: string,
  minimum: number,
  maximum: number,
  increment: number,
  context: z.RefinementCtx,
  index: number,
): void {
  const parsed = parseLocalizedNumber(value);
  const increments = parsed === null ? 0 : (parsed - minimum) / increment;
  if (
    parsed === null ||
    parsed < minimum ||
    parsed > maximum ||
    Math.abs(increments - Math.round(increments)) > 1e-8
  ) {
    addCertificateIssue(
      context,
      index,
      'score',
      increment === 1
        ? `نمره باید عددی صحیح بین ${minimum.toLocaleString('fa-IR')} و ${maximum.toLocaleString('fa-IR')} باشد.`
        : `نمره باید بین ${minimum.toLocaleString('fa-IR')} و ${maximum.toLocaleString('fa-IR')} و با گام ${increment.toLocaleString('fa-IR')} باشد.`,
    );
  }
}

function validateLevel(
  levelValue: string,
  levels: readonly string[],
  label: string,
  context: z.RefinementCtx,
  index: number,
): void {
  if (!levels.includes(levelValue.trim().toUpperCase())) {
    addCertificateIssue(context, index, 'level', `${label} را انتخاب کنید.`);
  }
}

function refineLanguage(values: LanguageStepValues, context: z.RefinementCtx): void {
  if (values.hasLanguageCertificate === null) {
    context.addIssue({
      code: 'custom',
      message: 'لطفاً مشخص کنید مدرک زبان دارید یا نه.',
      path: ['hasLanguageCertificate'],
    });
    return;
  }
  if (!values.hasLanguageCertificate) return;

  if (values.languageCertificates.length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'یک مدرک زبان انتخاب کنید.',
      path: ['languageCertificates'],
    });
    return;
  }

  values.languageCertificates.forEach((certificate, index) => {
    switch (certificate.type) {
      case 'ielts':
        validateScore(certificate.score, 0, 9, 0.5, context, index);
        break;
      case 'toefl':
        validateScore(certificate.score, 0, 120, 1, context, index);
        break;
      case 'tcf':
        validateScore(certificate.score, 100, 699, 1, context, index);
        break;
      case 'duolingo':
        validateScore(certificate.score, 10, 160, 5, context, index);
        break;
      case 'delf':
        validateLevel(certificate.level, ['A1', 'A2', 'B1', 'B2'], 'سطح DELF', context, index);
        break;
      case 'dalf':
        validateLevel(certificate.level, ['C1', 'C2'], 'سطح DALF', context, index);
        break;
      case 'tef':
        validateLevel(
          certificate.level,
          ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
          'سطح CEFR مدرک',
          context,
          index,
        );
        break;
      case 'cambridge':
        validateLevel(
          certificate.level,
          ['B2', 'C1', 'C2'],
          'سطح Cambridge',
          context,
          index,
        );
        break;
      case '':
        addCertificateIssue(context, index, 'type', 'نوع مدرک زبان را انتخاب کنید.');
        break;
    }
  });
}

export const educationStepSchema = z.object(educationShape).superRefine(refineEducation);
export const applicationGoalStepSchema = z
  .object(applicationGoalShape)
  .superRefine(refineApplicationGoal);
export const languageStepSchema = z.object(languageShape).superRefine(refineLanguage);
export const preferencesStepSchema = z.object(preferencesShape);

export const onboardingStepSchemas = [
  educationStepSchema,
  applicationGoalStepSchema,
  languageStepSchema,
  preferencesStepSchema,
] as const;

export const onboardingSchema = onboardingFormSchema.superRefine((values, context) => {
  refineEducation(values, context);
  refineApplicationGoal(values, context);
  refineLanguage(values, context);
});

const onboardingDraftValuesSchema = z
  .object({
    currentDegree: optionalSelection(educationDegreeValues).optional().catch(undefined),
    fieldId: z.string().optional().catch(undefined),
    fieldOfStudy: z.string().optional().catch(undefined),
    universityId: z.string().optional().catch(undefined),
    institution: z.string().optional().catch(undefined),
    studyStatus: optionalSelection(studyStatusValues).optional().catch(undefined),
    gradeAverage: z.string().optional().catch(undefined),
    gradeScale: optionalSelection(gradeScaleValues).optional().catch(undefined),
    targetFieldId: z.string().optional().catch(undefined),
    targetField: z.string().optional().catch(undefined),
    targetDegree: optionalSelection(targetDegreeValues).optional().catch(undefined),
    targetCountries: z.array(z.string()).optional().catch(undefined),
    intake: z
      .object({ term: intakeTermSchema, year: z.number().int().nullable() })
      .optional()
      .catch(undefined),
    hasLanguageCertificate: z.boolean().nullable().optional().catch(undefined),
    languageCertificates: z
      .array(languageCertificateFormSchema.partial())
      .optional()
      .catch(undefined),
    annualBudget: optionalSelection(annualBudgetValues).optional().catch(undefined),
    scholarshipImportance: optionalSelection(scholarshipImportanceValues)
      .optional()
      .catch(undefined),
  })
  .passthrough();

export function parseOnboardingDraftValues(value: unknown): OnboardingFormValues | null {
  const result = onboardingDraftValuesSchema.safeParse(value);
  if (!result.success) return null;

  const fieldId = resolveIranianAcademicFieldId(
    result.data.fieldId ?? result.data.fieldOfStudy ?? '',
  );
  const universityId = resolveIranianUniversityId(
    result.data.universityId ?? result.data.institution ?? '',
  );
  const targetFieldId = resolveIranianAcademicFieldId(
    result.data.targetFieldId ?? result.data.targetField ?? '',
  );

  return {
    ...onboardingDefaultValues,
    ...result.data,
    currentDegree: result.data.currentDegree ?? '',
    fieldId: fieldId ?? '',
    universityId: universityId ?? '',
    studyStatus: result.data.studyStatus ?? '',
    gradeAverage: result.data.gradeAverage ?? '',
    gradeScale: result.data.gradeScale ?? '',
    targetFieldId: targetFieldId ?? '',
    targetDegree: result.data.targetDegree ?? '',
    intake: result.data.intake ?? { ...onboardingDefaultValues.intake },
    targetCountries: [
      ...new Set(
        (result.data.targetCountries ?? []).filter((country) =>
          targetCountryCodes.some((candidate) => candidate === country),
        ),
      ),
    ] as OnboardingFormValues['targetCountries'],
    languageCertificates: (result.data.languageCertificates ?? [])
      .slice(0, 1)
      .map((certificate) => ({ ...emptyLanguageCertificate, ...certificate })),
    hasLanguageCertificate: result.data.hasLanguageCertificate ?? null,
    annualBudget: result.data.annualBudget ?? '',
    scholarshipImportance: result.data.scholarshipImportance ?? '',
  };
}

export function isOnboardingStepComplete(values: unknown, dataStep: OnboardingDataStep): boolean {
  return onboardingStepSchemas[dataStep].safeParse(values).success;
}

function toIntakeValue(intake: IntakeFormValue): IntakeValue {
  if (intake.term === 'undecided' && intake.year === null) {
    return { term: 'undecided', year: null };
  }
  if ((intake.term === 'spring' || intake.term === 'fall') && intake.year !== null) {
    return { term: intake.term, year: intake.year };
  }
  throw new Error('Cannot normalize an invalid onboarding intake.');
}

function certificateTestDate(testDate: string | undefined): { testDate?: string } {
  const normalized = testDate?.trim();
  return normalized ? { testDate: normalized } : {};
}

function toLanguageCertificate(certificate: LanguageCertificateFormValue): LanguageCertificate {
  const testDate = certificateTestDate(certificate.testDate);
  switch (certificate.type) {
    case 'ielts':
    case 'toefl':
    case 'tcf':
    case 'duolingo': {
      const score = parseLocalizedNumber(certificate.score);
      if (score === null) throw new Error('Cannot normalize an invalid language score.');
      return { type: certificate.type, score, ...testDate };
    }
    case 'delf': {
      const level = certificate.level.trim().toUpperCase();
      if (level !== 'A1' && level !== 'A2' && level !== 'B1' && level !== 'B2') {
        throw new Error('Cannot normalize an invalid DELF level.');
      }
      return { type: 'delf', level, ...testDate };
    }
    case 'dalf': {
      const level = certificate.level.trim().toUpperCase();
      if (level !== 'C1' && level !== 'C2') {
        throw new Error('Cannot normalize an invalid DALF level.');
      }
      return { type: 'dalf', level, ...testDate };
    }
    case 'cambridge': {
      const level = certificate.level.trim().toUpperCase();
      if (level !== 'B2' && level !== 'C1' && level !== 'C2') {
        throw new Error('Cannot normalize an invalid Cambridge level.');
      }
      return { type: 'cambridge', level, ...testDate };
    }
    case 'tef': {
      const level = certificate.level.trim().toUpperCase();
      if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
        throw new Error('Cannot normalize an invalid CEFR level.');
      }
      return {
        type: 'tef',
        level: level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
        ...testDate,
      };
    }
    case '':
      throw new Error('Cannot normalize a language certificate without a type.');
  }
}

export function toInitialProfileData(values: OnboardingFormValues): InitialProfileData {
  const parsed = onboardingSchema.parse(values);
  if (
    parsed.currentDegree === '' ||
    parsed.studyStatus === '' ||
    parsed.gradeScale === '' ||
    parsed.targetDegree === '' ||
    parsed.hasLanguageCertificate === null ||
    parsed.annualBudget === '' ||
    parsed.scholarshipImportance === ''
  ) {
    throw new Error('Cannot normalize incomplete onboarding values.');
  }

  const gradeAverage = parseLocalizedNumber(parsed.gradeAverage);
  if (gradeAverage === null) throw new Error('Cannot normalize an invalid grade average.');

  return {
    currentDegree: parsed.currentDegree,
    educationCountryCode: 'IR',
    fieldId: parsed.fieldId,
    universityId: parsed.universityId,
    studyStatus: parsed.studyStatus,
    gradeAverage,
    gradeScale: parsed.gradeScale,
    targetFieldId: parsed.targetFieldId,
    targetDegree: parsed.targetDegree,
    targetCountries: parsed.targetCountries,
    intake: toIntakeValue(parsed.intake),
    hasLanguageCertificate: parsed.hasLanguageCertificate,
    languageCertificates: parsed.hasLanguageCertificate
      ? parsed.languageCertificates.map(toLanguageCertificate)
      : [],
    annualBudget: parsed.annualBudget,
    scholarshipImportance: parsed.scholarshipImportance,
  };
}

export function fromInitialProfileData(profile?: InitialProfileData): OnboardingFormValues {
  if (!profile) return { ...onboardingDefaultValues };

  return {
    currentDegree: profile.currentDegree,
    fieldId: profile.fieldId,
    universityId: profile.universityId,
    studyStatus: profile.studyStatus,
    gradeAverage: String(profile.gradeAverage),
    gradeScale: profile.gradeScale,
    targetFieldId: profile.targetFieldId,
    targetDegree: profile.targetDegree,
    targetCountries: [...profile.targetCountries],
    intake: { ...profile.intake },
    hasLanguageCertificate: profile.hasLanguageCertificate,
    languageCertificates: profile.languageCertificates.map((certificate) => ({
      type: certificate.type,
      score: 'score' in certificate ? String(certificate.score) : '',
      level: 'level' in certificate ? certificate.level : '',
      testDate: certificate.testDate ?? '',
    })),
    annualBudget: profile.annualBudget,
    scholarshipImportance: profile.scholarshipImportance,
  };
}
