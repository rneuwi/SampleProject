import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam, parseQuery } from '../utils/validation';
import { listApplicantsQuerySchema } from '../validation/applicantSchemas';
import * as applicantService from '../services/applicantService';
import * as loanApplicationService from '../services/loanApplicationService';

export const listApplicants = asyncHandler(async (req: Request, res: Response) => {
  const query = parseQuery(listApplicantsQuerySchema, req.query);
  const result = await applicantService.listApplicants(query);
  res.json(result);
});

export const getApplicant = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const [applicant, loanApplications] = await Promise.all([
    applicantService.getApplicantById(id),
    loanApplicationService.listLoanApplicationsForApplicant(id),
  ]);
  res.json({ ...applicant, loanApplications });
});
