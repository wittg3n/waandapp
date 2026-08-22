const localizedDigits: Readonly<Record<string, string>> = {
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

export function normalizeLocalizedDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => localizedDigits[digit] ?? digit);
}

export function cooldownDeadline(now: number, seconds: number): number {
  return now + Math.max(0, Math.ceil(seconds)) * 1_000;
}

export function cooldownRemaining(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1_000));
}

export interface AuthOperation {
  id: number;
  signal: AbortSignal;
}

export function createAuthOperationGate() {
  let sequence = 0;
  let active: { id: number; controller: AbortController } | null = null;

  return {
    start(): AuthOperation {
      active?.controller.abort();
      const controller = new AbortController();
      active = { id: ++sequence, controller };
      return { id: active.id, signal: controller.signal };
    },

    isCurrent(operation: AuthOperation): boolean {
      return active?.id === operation.id && !operation.signal.aborted;
    },

    isBusy(): boolean {
      return active !== null && !active.controller.signal.aborted;
    },

    finish(operation: AuthOperation): void {
      if (active?.id === operation.id) active = null;
    },

    cancel(): void {
      active?.controller.abort();
      active = null;
    },
  };
}
