export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function sanitizeDecimal(value: string, maxDecimals: number): string {
  let cleaned = value.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  const [intPart, decPart] = cleaned.split('.');
  const trimmedInt = intPart.replace(/^0+(?=\d)/, '');
  return decPart === undefined ? trimmedInt : `${trimmedInt}.${decPart.slice(0, maxDecimals)}`;
}

export function maskCurrency(value: string): string {
  const [intPart, decPart] = sanitizeDecimal(value, 2).split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart === undefined ? withCommas : `${withCommas}.${decPart}`;
}

export function maskPercent(value: string): string {
  return sanitizeDecimal(value, 2);
}

/** Strips display-only formatting (thousands separators) so the value can be sent to the API. */
export function unmaskNumeric(value: string): string {
  return value.replace(/,/g, '');
}
