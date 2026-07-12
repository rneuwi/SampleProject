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

export const updateLoanApplicationSchema = loanFieldsSchema.partial();

export const listLoanApplicationsQuerySchema = paginationQuerySchema.extend({
  status: underwritingStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'loanAmount', 'creditScore', 'dtiRatio', 'ltvRatio']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type ListLoanApplicationsQuery = z.infer<typeof listLoanApplicationsQuerySchema>;
