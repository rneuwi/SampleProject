import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { Applicant, PaginatedResult } from '../types/domain';
import { ApplicantInput, ListApplicantsQuery } from '../validation/applicantSchemas';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, resolvePagination } from '../utils/pagination';

interface ApplicantRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: Date;
}

function mapApplicant(row: ApplicantRow): Applicant {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at.toISOString(),
  };
}

/**
 * Finds an applicant by email (the natural key for this domain) and refreshes
 * their contact details, or creates a new one. Runs on a caller-supplied
 * connection so it can participate in the loan application's transaction.
 */
export async function findOrCreateApplicant(connection: PoolConnection, input: ApplicantInput): Promise<Applicant> {
  const [existingRows] = await connection.query<ApplicantRow[]>('SELECT * FROM applicants WHERE email = ? LIMIT 1', [
    input.email,
  ]);

  if (existingRows.length > 0) {
    const existingId = existingRows[0].id;
    await connection.query('UPDATE applicants SET first_name = ?, last_name = ?, phone = ? WHERE id = ?', [
      input.firstName,
      input.lastName,
      input.phone ?? null,
      existingId,
    ]);
    return getApplicantById(existingId, connection);
  }

  const [result] = await connection.query<ResultSetHeader>(
    'INSERT INTO applicants (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
    [input.firstName, input.lastName, input.email, input.phone ?? null]
  );

  return getApplicantById(result.insertId, connection);
}

export async function listApplicants(
  query: ListApplicantsQuery
): Promise<PaginatedResult<Applicant & { loanApplicationCount: number }>> {
  const { page, pageSize, offset } = resolvePagination(query.page, query.pageSize);

  const filters: string[] = [];
  const values: unknown[] = [];
  if (query.search) {
    filters.push('(a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ?)');
    const like = `%${query.search}%`;
    values.push(like, like, like);
  }
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM applicants a ${whereClause}`,
    values
  );
  const totalItems = Number(countRows[0].total);

  const [rows] = await pool.query<(ApplicantRow & { loan_application_count: number })[]>(
    `SELECT a.*, COUNT(la.id) AS loan_application_count
     FROM applicants a
     LEFT JOIN loan_applications la ON la.applicant_id = a.id
     ${whereClause}
     GROUP BY a.id
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  );

  return {
    data: rows.map((row) => ({ ...mapApplicant(row), loanApplicationCount: Number(row.loan_application_count) })),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getApplicantById(id: number, connection: PoolConnection | typeof pool = pool): Promise<Applicant> {
  const [rows] = await connection.query<ApplicantRow[]>('SELECT * FROM applicants WHERE id = ?', [id]);
  if (rows.length === 0) {
    throw ApiError.notFound(`Applicant ${id} not found`);
  }
  return mapApplicant(rows[0]);
}
