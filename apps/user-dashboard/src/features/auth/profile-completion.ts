import type { ProfileCompletion, ProfileCompletionSection } from '@/features/auth/types';

type CompletionSectionBlueprint = Omit<ProfileCompletionSection, 'completedWeight'> & {
  onboardingWeight: number;
};

export const PROFILE_COMPLETION_SECTIONS = [
  { id: 'base', label: 'اطلاعات تحصیلی پایه', totalWeight: 15, onboardingWeight: 15 },
  { id: 'goals', label: 'هدف‌های اپلای', totalWeight: 10, onboardingWeight: 10 },
  { id: 'language', label: 'اطلاعات زبان', totalWeight: 10, onboardingWeight: 5 },
  { id: 'documents', label: 'مدارک', totalWeight: 35, onboardingWeight: 0 },
  { id: 'resume', label: 'رزومه و سوابق', totalWeight: 30, onboardingWeight: 0 },
] as const satisfies readonly CompletionSectionBlueprint[];

function createSections(onboardingCompleted: boolean): ProfileCompletionSection[] {
  return PROFILE_COMPLETION_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    completedWeight: onboardingCompleted ? section.onboardingWeight : 0,
    totalWeight: section.totalWeight,
  }));
}

export function createProfileCompletion(onboardingCompleted: boolean): ProfileCompletion {
  const sections = createSections(onboardingCompleted);
  const completedWeight = sections.reduce((total, section) => total + section.completedWeight, 0);
  const totalWeight = sections.reduce((total, section) => total + section.totalWeight, 0);

  return {
    percentage: totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100),
    completedWeight,
    totalWeight,
    sections,
  };
}

export const EMPTY_PROFILE_COMPLETION = createProfileCompletion(false);
