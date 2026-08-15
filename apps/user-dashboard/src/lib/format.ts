const persianNumber = new Intl.NumberFormat('fa-IR');

export function formatNumber(value: number): string {
  return persianNumber.format(value);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}٪`;
}
