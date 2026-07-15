import { z } from 'zod';
import { applicantInputSchema } from './applicantSchemas';
import { paginationQuerySchema } from './pagination';

export const loanTypeSchema = z.enum(['conventional', 'fha', 'va', 'usda']);
export const employmentStatusSchema = z.enum(['employed', 'self_employed', 'unemployed', 'retired']);
export const underwritingStatusSchema = z.enum(['approved', 'conditional', 'refer', 'declined']);

const loanFieldsSchema = z.object({
  loanType: loanTypeSchema,
  loanAmount: z.coerce.number().positive().max(100_000_000),
  propertyValue: z.coerce.number().positive().max(100_000_000),
  annualIncome: z.coerce.number().positive().max(100_000_000),
  monthlyDebts: z.coerce.number().min(0).max(1_000_000),
  creditScore: z.coerce.number().int().min(300).max(850),
  employmentStatus: employmentStatusSchema,
  interestRate: z.coerce.number().min(0).max(25).optional(),
  loanTermMonths: z.coerce.number().int().positive().max(600).optional(),
});

export const createLoanApplicationSchema = loanFieldsSchema.extend({
  applicant: applicantInputSchema,
});

export const updateLoanApplicationSchema = loanFieldsSchema.partial().extend({
  // Lets a reviewer manually override the automated recommendation. When omitted,
  // the service keeps recomputing the decision from the (possibly-edited) financial
  // fields, same as before this pair existed.
  underwritingStatus: underwritingStatusSchema.optional(),
  underwritingNotes: z.string().trim().max(2000).optional(),
});

export const listLoanApplicationsQuerySchema = paginationQuerySchema.extend({
  // Accepts a single status ("refer"), a comma-separated list ("conditional,refer"),
  // or repeated query keys (Express parses those into an array) — all normalized to
  // an array so the service can always filter with a single `IN (?)` clause.
  status: z
    .union([z.string(), z.array(z.string())])
    .transform((val) =>
      (Array.isArray(val) ? val : [val]).flatMap((v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    )
    .pipe(z.array(underwritingStatusSchema).min(1))
    .optional(),
  search: z.string().trim().max(255).optional(),
  sortBy: z.enum(['createdAt', 'loanAmount', 'creditScore', 'dtiRatio', 'ltvRatio', 'applicant']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type ListLoanApplicationsQuery = z.infer<typeof listLoanApplicationsQuerySchema>;
