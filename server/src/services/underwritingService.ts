import { EmploymentStatus, UnderwritingResult, UnderwritingStatus } from '../types/domain';

interface UnderwritingInput {
  creditScore: number;
  dtiRatio: number;
  ltvRatio: number;
  employmentStatus: EmploymentStatus;
}

/**
 * Simplified, illustrative underwriting rules loosely modeled on common
 * conventional-loan automated underwriting guidelines. This is a portfolio
 * demo, not real underwriting policy or a substitute for compliance review.
 *
 * Rules are evaluated in order; the first match wins. Hard-decline checks
 * run first, then approval tiers from strictest to most lenient, falling
 * back to a manual referral when nothing else matches.
 */
export function evaluateUnderwriting(input: UnderwritingInput): UnderwritingResult {
  const { creditScore, dtiRatio, ltvRatio, employmentStatus } = input;

  if (employmentStatus === 'unemployed') {
    return decision('declined', 'Applicant reports no current source of employment income.');
  }
  if (creditScore < 580) {
    return decision('declined', 'Credit score falls below the minimum threshold of 580.');
  }
  if (dtiRatio > 50) {
    return decision('declined', 'Debt-to-income ratio exceeds the maximum allowable threshold of 50%.');
  }
  if (ltvRatio > 97) {
    return decision('declined', 'Loan-to-value ratio exceeds the maximum allowable threshold of 97%.');
  }

  if (creditScore >= 740 && dtiRatio <= 36 && ltvRatio <= 80) {
    return decision('approved', 'Strong credit profile with conservative debt-to-income and loan-to-value ratios.');
  }
  if (creditScore >= 680 && dtiRatio <= 43 && ltvRatio <= 90) {
    return decision('approved', 'Meets standard conventional underwriting guidelines.');
  }
  if (creditScore >= 620 && dtiRatio <= 45 && ltvRatio <= 95) {
    return decision(
      'conditional',
      'Meets minimum guidelines; recommend conditional approval pending documentation review.'
    );
  }

  return decision('refer', 'Does not clearly meet automated guidelines; refer to an underwriter for manual review.');
}

function decision(status: UnderwritingStatus, notes: string): UnderwritingResult {
  return { status, notes };
}
