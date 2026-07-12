import { api } from './api';
import type {
  CreateLoanApplicationPayload,
  ListLoanApplicationsParams,
  LoanApplicationsSummary,
  LoanApplicationWithApplicant,
  PaginatedResult,
  UpdateLoanApplicationPayload,
} from '@/types/domain';

export async function listLoanApplications(
  params: ListLoanApplicationsParams
): Promise<PaginatedResult<LoanApplicationWithApplicant>> {
  const { data } = await api.get<PaginatedResult<LoanApplicationWithApplicant>>('/loan-applications', { params });
  return data;
}

export async function getLoanApplicationsSummary(): Promise<LoanApplicationsSummary> {
  const { data } = await api.get<LoanApplicationsSummary>('/loan-applications/summary');
  return data;
}

export async function getLoanApplication(id: number): Promise<LoanApplicationWithApplicant> {
  const { data } = await api.get<LoanApplicationWithApplicant>(`/loan-applications/${id}`);
  return data;
}

export async function createLoanApplication(
  payload: CreateLoanApplicationPayload
): Promise<LoanApplicationWithApplicant> {
  const { data } = await api.post<LoanApplicationWithApplicant>('/loan-applications', payload);
  return data;
}

export async function updateLoanApplication(
  id: number,
  payload: UpdateLoanApplicationPayload
): Promise<LoanApplicationWithApplicant> {
  const { data } = await api.patch<LoanApplicationWithApplicant>(`/loan-applications/${id}`, payload);
  return data;
}

export async function deleteLoanApplication(id: number): Promise<void> {
  await api.delete(`/loan-applications/${id}`);
}
