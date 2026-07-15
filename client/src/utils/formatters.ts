const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatters = {
  long: new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }),
  medium: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }),
} as const;

export function formatCurrency(value: unknown): string {
  return currencyFormatter.format(value as number);
}

export function formatPercent(value: unknown): string {
  return `${(value as number).toFixed(1)}%`;
}

export function formatDate(value: unknown, style: keyof typeof dateFormatters = 'medium'): string {
  return dateFormatters[style].format(new Date(value as string));
}
