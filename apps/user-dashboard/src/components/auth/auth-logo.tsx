import { WaandLogo } from '../ui/waand-logo';
export function AuthLogo() {
  return (
    <span
      aria-label="Waand"
      className="auth-logo inline-flex h-8 items-center gap-2 text-primary lg:h-[34px]"
      role="img"
    >
      <WaandLogo dir="ltr" className="flex-row-reverse" />
    </span>
  );
}
