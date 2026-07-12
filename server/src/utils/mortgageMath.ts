// Pure calculation helpers — no framework or DB dependency, so they're
// trivially unit-testable and reusable outside an HTTP request.

const DEFAULT_ANNUAL_INTEREST_RATE_PCT = 6.5;
const DEFAULT_LOAN_TERM_MONTHS = 360;

export const MORTGAGE_DEFAULTS = {
  annualInterestRatePct: DEFAULT_ANNUAL_INTEREST_RATE_PCT,
  termMonths: DEFAULT_LOAN_TERM_MONTHS,
};

/** Estimated monthly principal & interest payment via the standard amortization formula. */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRatePct: number = DEFAULT_ANNUAL_INTEREST_RATE_PCT,
  termMonths: number = DEFAULT_LOAN_TERM_MONTHS
): number {
  const monthlyRate = annualInterestRatePct / 100 / 12;

  if (monthlyRate === 0) {
    return round2(principal / termMonths);
  }

  const growth = Math.pow(1 + monthlyRate, termMonths);
  const payment = (principal * (monthlyRate * growth)) / (growth - 1);
  return round2(payment);
}

/** Back-end debt-to-income ratio (%): all monthly debts, including the proposed housing payment, over gross monthly income. */
export function calculateDTI(monthlyDebts: number, monthlyHousingPayment: number, annualIncome: number): number {
  const monthlyIncome = annualIncome / 12;
  if (monthlyIncome <= 0) {
    return 0;
  }
  return round2(((monthlyDebts + monthlyHousingPayment) / monthlyIncome) * 100);
}

/** Loan-to-value ratio (%): requested loan amount over appraised property value. */
export function calculateLTV(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) {
    return 0;
  }
  return round2((loanAmount / propertyValue) * 100);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
