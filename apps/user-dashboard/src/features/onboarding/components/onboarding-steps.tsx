import { ApplicationGoalStep } from './steps/application-goal-step';
import { CompletionStep } from './steps/completion-step';
import { EducationStep } from './steps/education-step';
import { LanguageStep } from './steps/language-step';
import { PreferencesStep } from './steps/preferences-step';
import { WelcomeStep } from './steps/welcome-step';

export const WELCOME_VIEW = -1;
export const COMPLETION_VIEW = 4;

export function OnboardingStep({
  completion,
  firstName,
  view,
}: {
  completion: number;
  firstName?: string;
  view: number;
}) {
  if (view === WELCOME_VIEW) return <WelcomeStep firstName={firstName} />;
  if (view === 0) return <EducationStep />;
  if (view === 1) return <ApplicationGoalStep />;
  if (view === 2) return <LanguageStep />;
  if (view === 3) return <PreferencesStep />;
  return <CompletionStep completion={completion} />;
}
