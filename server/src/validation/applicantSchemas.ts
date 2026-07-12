import { z } from 'zod';
import { paginationQuerySchema } from './pagination';

export const applicantInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Must be a valid email address').max(255),
  phone: z.string().trim().max(20).optional(),
});

export const listApplicantsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(255).optional(),
});

export type ApplicantInput = z.infer<typeof applicantInputSchema>;
export type ListApplicantsQuery = z.infer<typeof listApplicantsQuerySchema>;
