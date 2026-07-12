import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam, parseQuery } from '../utils/validation';
import { listLoanApplicationsQuerySchema } from '../validation/loanApplicationSchemas';
import * as loanApplicationService from '../services/loanApplicationService';

export const listLoanApplications = asyncHandler(async (req: Request, res: Response) => {
  const query = parseQuery(listLoanApplicationsQuerySchema, req.query);
  const result = await loanApplicationService.listLoanApplications(query);
  res.json(result);
});

export const getLoanApplicationsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await loanApplicationService.getLoanApplicationsSummary();
  res.json(summary);
});

export const getLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const loanApplication = await loanApplicationService.getLoanApplicationById(id);
  res.json(loanApplication);
});

export const createLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const loanApplication = await loanApplicationService.createLoanApplication(req.body);
  res.status(201).json(loanApplication);
});

export const updateLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const loanApplication = await loanApplicationService.updateLoanApplication(id, req.body);
  res.json(loanApplication);
});

export const deleteLoanApplication = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await loanApplicationService.deleteLoanApplication(id);
  res.status(204).send();
});
