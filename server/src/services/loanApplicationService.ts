import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import {
  EmploymentStatus,
  LoanApplicationsSummary,
  LoanApplicationWithApplicant,
  LoanType,
  PaginatedResult,
  UnderwritingStatus,
} from '../types/domain';
import {
  CreateLoanApplicationInput,
  ListLoanApplicationsQuery,
  UpdateLoanApplicationInput,
} from '../validation/loanApplicationSchemas';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, resolvePagination } from '../utils/pagination';
import { calculateDTI, calculateLTV, calculateMonthlyPayment, MORTGAGE_DEFAULTS } from '../utils/mortgageMath';
import { evaluateUnderwriting } from './underwritingService';
import { findOrCreateApplicant } from './applicantService';

interface LoanApplicationRow extends RowDataPacket {
  id: number;
  applicant_id: number;
  loan_type: LoanType;
  loan_amount: string;
  property_value: string;
  annual_income: string;
  monthly_debts: string;
  credit_score: number;
  employment_status: EmploymentStatus;
  interest_rate: string;
  loan_term_months: number;
  monthly_housing_payment: string;
  dti_ratio: string;
  ltv_ratio: string;
  underwriting_status: UnderwritingStatus;
  underwriting_notes: string;
  created_at: Date;
  updated_at: Date;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  applicant_phone: string | null;
}

const SELECT_WITH_APPLICANT = `
  SELECT
    la.*,
    a.first_name AS applicant_first_name,
    a.last_name AS applicant_last_name,
    a.email AS applicant_email,
    a.phone AS applicant_phone
  FROM loan_applications la
  JOIN applicants a ON a.id = la.applicant_id
`;

const SORT_COLUMNS: Record<string, string> = {
  createdAt: 'la.created_at',
  loanAmount: 'la.loan_amount',
  creditScore: 'la.credit_score',
  dtiRatio: 'la.dti_ratio',
  ltvRatio: 'la.ltv_ratio',
};

function mapLoanApplication(row: LoanApplicationRow): LoanApplicationWithApplicant {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    loanType: row.loan_type,
    loanAmount: Number(row.loan_amount),
    propertyValue: Number(row.property_value),
    annualIncome: Number(row.annual_income),
    monthlyDebts: Number(row.monthly_debts),
    creditScore: row.credit_score,
    employmentStatus: row.employment_status,
    interestRate: Number(row.interest_rate),
    loanTermMonths: row.loan_term_months,
    monthlyHousingPayment: Number(row.monthly_housing_payment),
    dtiRatio: Number(row.dti_ratio),
    ltvRatio: Number(row.ltv_ratio),
    underwritingStatus: row.underwriting_status,
    underwritingNotes: row.underwriting_notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    applicant: {
      id: row.applicant_id,
      firstName: row.applicant_first_name,
      lastName: row.applicant_last_name,
      email: row.applicant_email,
      phone: row.applicant_phone,
    },
  };
}

interface FinancialInput {
  loanAmount: number;
  propertyValue: number;
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
  employmentStatus: EmploymentStatus;
  interestRate?: number;
  loanTermMonths?: number;
}

/** Runs the calculators + rules engine over a candidate set of loan terms. */
function deriveMetrics(input: FinancialInput) {
  const interestRate = input.interestRate ?? MORTGAGE_DEFAULTS.annualInterestRatePct;
  const loanTermMonths = input.loanTermMonths ?? MORTGAGE_DEFAULTS.termMonths;
  const monthlyHousingPayment = calculateMonthlyPayment(input.loanAmount, interestRate, loanTermMonths);
  const dtiRatio = calculateDTI(input.monthlyDebts, monthlyHousingPayment, input.annualIncome);
  const ltvRatio = calculateLTV(input.loanAmount, input.propertyValue);
  const { status, notes } = evaluateUnderwriting({
    creditScore: input.creditScore,
    dtiRatio,
    ltvRatio,
    employmentStatus: input.employmentStatus,
  });

  return {
    interestRate,
    loanTermMonths,
    monthlyHousingPayment,
    dtiRatio,
    ltvRatio,
    underwritingStatus: status,
    underwritingNotes: notes,
  };
}

export async function createLoanApplication(input: CreateLoanApplicationInput): Promise<LoanApplicationWithApplicant> {
  const metrics = deriveMetrics(input);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const applicant = await findOrCreateApplicant(connection, input.applicant);

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO loan_applications
        (applicant_id, loan_type, loan_amount, property_value, annual_income, monthly_debts,
         credit_score, employment_status, interest_rate, loan_term_months, monthly_housing_payment,
         dti_ratio, ltv_ratio, underwriting_status, underwriting_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        applicant.id,
        input.loanType,
        input.loanAmount,
        input.propertyValue,
        input.annualIncome,
        input.monthlyDebts,
        input.creditScore,
        input.employmentStatus,
        metrics.interestRate,
        metrics.loanTermMonths,
        metrics.monthlyHousingPayment,
        metrics.dtiRatio,
        metrics.ltvRatio,
        metrics.underwritingStatus,
        metrics.underwritingNotes,
      ]
    );

    await connection.commit();
    return getLoanApplicationById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listLoanApplications(
  query: ListLoanApplicationsQuery
): Promise<PaginatedResult<LoanApplicationWithApplicant>> {
  const { page, pageSize, offset } = resolvePagination(query.page, query.pageSize);

  const filters: string[] = [];
  const values: unknown[] = [];
  if (query.status) {
    filters.push('la.underwriting_status = ?');
    values.push(query.status);
  }
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const sortColumn = SORT_COLUMNS[query.sortBy ?? 'createdAt'];
  const sortDir = query.sortDir === 'asc' ? 'ASC' : 'DESC';

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM loan_applications la ${whereClause}`,
    values
  );
  const totalItems = Number(countRows[0].total);

  const [rows] = await pool.query<LoanApplicationRow[]>(
    `${SELECT_WITH_APPLICANT} ${whereClause} ORDER BY ${sortColumn} ${sortDir} LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  );

  return {
    data: rows.map(mapLoanApplication),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function listLoanApplicationsForApplicant(applicantId: number): Promise<LoanApplicationWithApplicant[]> {
  const [rows] = await pool.query<LoanApplicationRow[]>(
    `${SELECT_WITH_APPLICANT} WHERE la.applicant_id = ? ORDER BY la.created_at DESC`,
    [applicantId]
  );
  return rows.map(mapLoanApplication);
}

export async function getLoanApplicationById(id: number): Promise<LoanApplicationWithApplicant> {
  const [rows] = await pool.query<LoanApplicationRow[]>(`${SELECT_WITH_APPLICANT} WHERE la.id = ?`, [id]);
  if (rows.length === 0) {
    throw ApiError.notFound(`Loan application ${id} not found`);
  }
  return mapLoanApplication(rows[0]);
}

export async function updateLoanApplication(
  id: number,
  input: UpdateLoanApplicationInput
): Promise<LoanApplicationWithApplicant> {
  const existing = await getLoanApplicationById(id);

  const merged: FinancialInput & { loanType: LoanType } = {
    loanType: input.loanType ?? existing.loanType,
    loanAmount: input.loanAmount ?? existing.loanAmount,
    propertyValue: input.propertyValue ?? existing.propertyValue,
    annualIncome: input.annualIncome ?? existing.annualIncome,
    monthlyDebts: input.monthlyDebts ?? existing.monthlyDebts,
    creditScore: input.creditScore ?? existing.creditScore,
    employmentStatus: input.employmentStatus ?? existing.employmentStatus,
    interestRate: input.interestRate ?? existing.interestRate,
    loanTermMonths: input.loanTermMonths ?? existing.loanTermMonths,
  };

  const metrics = deriveMetrics(merged);

  await pool.query(
    `UPDATE loan_applications SET
       loan_type = ?, loan_amount = ?, property_value = ?, annual_income = ?, monthly_debts = ?,
       credit_score = ?, employment_status = ?, interest_rate = ?, loan_term_months = ?,
       monthly_housing_payment = ?, dti_ratio = ?, ltv_ratio = ?, underwriting_status = ?, underwriting_notes = ?
     WHERE id = ?`,
    [
      merged.loanType,
      merged.loanAmount,
      merged.propertyValue,
      merged.annualIncome,
      merged.monthlyDebts,
      merged.creditScore,
      merged.employmentStatus,
      metrics.interestRate,
      metrics.loanTermMonths,
      metrics.monthlyHousingPayment,
      metrics.dtiRatio,
      metrics.ltvRatio,
      metrics.underwritingStatus,
      metrics.underwritingNotes,
      id,
    ]
  );

  return getLoanApplicationById(id);
}

export async function getLoanApplicationsSummary(): Promise<LoanApplicationsSummary> {
  const [statusRows] = await pool.query<(RowDataPacket & { underwriting_status: UnderwritingStatus; count: number })[]>(
    'SELECT underwriting_status, COUNT(*) AS count FROM loan_applications GROUP BY underwriting_status'
  );

  const byStatus: Record<UnderwritingStatus, number> = { approved: 0, conditional: 0, refer: 0, declined: 0 };
  let totalApplications = 0;
  for (const row of statusRows) {
    const count = Number(row.count);
    byStatus[row.underwriting_status] = count;
    totalApplications += count;
  }

  const [averageRows] = await pool.query<(RowDataPacket & { avg_dti: string | null; avg_ltv: string | null })[]>(
    'SELECT AVG(dti_ratio) AS avg_dti, AVG(ltv_ratio) AS avg_ltv FROM loan_applications'
  );

  return {
    totalApplications,
    byStatus,
    averageDti: averageRows[0].avg_dti ? Number(averageRows[0].avg_dti) : 0,
    averageLtv: averageRows[0].avg_ltv ? Number(averageRows[0].avg_ltv) : 0,
  };
}

export async function deleteLoanApplication(id: number): Promise<void> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM loan_applications WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw ApiError.notFound(`Loan application ${id} not found`);
  }
}
