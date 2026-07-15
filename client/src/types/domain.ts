export type LoanType = 'conventional' | 'fha' | 'va' | 'usda';
export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired';
export type UnderwritingStatus = 'approved' | 'conditional' | 'refer' | 'declined';
export type LoanApplicationSortColumn = 'createdAt' | 'loanAmount' | 'creditScore' | 'dtiRatio' | 'ltvRatio' | 'applicant';

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface LoanApplicationWithApplicant {
  id: number;
  applicantId: number;
  loanType: LoanType;
  loanAmount: number;
  propertyValue: number;
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
  employmentStatus: EmploymentStatus;
  interestRate: number;
  loanTermMonths: number;
  monthlyHousingPayment: number;
  dtiRatio: number;
  ltvRatio: number;
  underwritingStatus: UnderwritingStatus;
  underwritingNotes: string;
  createdAt: string;
  updatedAt: string;
  applicant: Pick<Applicant, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface LoanApplicationsSummary {
  totalApplications: number;
  byStatus: Record<UnderwritingStatus, number>;
  averageDti: number;
  averageLtv: number;
}

export interface ApplicantInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// Numeric fields are typed loosely as string | number: form inputs hand us
// strings, and the API's Zod schemas coerce them server-side, so there's no
// need to duplicate numeric parsing/validation on the client.
export interface CreateLoanApplicationPayload {
  applicant: ApplicantInput;
  loanType: LoanType;
  loanAmount: string | number;
  propertyValue: string | number;
  annualIncome: string | number;
  monthlyDebts: string | number;
  creditScore: string | number;
  employmentStatus: EmploymentStatus;
  interestRate?: string | number;
  loanTermMonths?: string | number;
}

export type UpdateLoanApplicationPayload = Partial<Omit<CreateLoanApplicationPayload, 'applicant'>> & {
  // Set to manually override the automated recommendation (e.g. a reviewer's decision).
  // Omit both to let the server keep recomputing the decision from the financial fields.
  underwritingStatus?: UnderwritingStatus;
  underwritingNotes?: string;
};

export interface ListLoanApplicationsParams {
  page?: number;
  pageSize?: number;
  status?: UnderwritingStatus | UnderwritingStatus[];
  search?: string;
  sortBy?: LoanApplicationSortColumn;
  sortDir?: 'asc' | 'desc';
}

export interface ApiValidationErrorDetail {
  path: string;
  message: string;
}
