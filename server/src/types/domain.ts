export type LoanType = 'conventional' | 'fha' | 'va' | 'usda';
export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired';
export type UnderwritingStatus = 'approved' | 'conditional' | 'refer' | 'declined';

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface LoanApplication {
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
}

export interface LoanApplicationWithApplicant extends LoanApplication {
  applicant: Pick<Applicant, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
}

export interface UnderwritingResult {
  status: UnderwritingStatus;
  notes: string;
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
