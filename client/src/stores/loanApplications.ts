import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as loanApplicationsApi from '@/services/loanApplicationsApi';
import type {
  CreateLoanApplicationPayload,
  LoanApplicationsSummary,
  LoanApplicationWithApplicant,
  PaginationMeta,
  UnderwritingStatus,
} from '@/types/domain';

const DEFAULT_PAGINATION: PaginationMeta = { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 };

export const useLoanApplicationsStore = defineStore('loanApplications', () => {
  const items = ref<LoanApplicationWithApplicant[]>([]);
  const pagination = ref<PaginationMeta>({ ...DEFAULT_PAGINATION });
  const statusFilter = ref<UnderwritingStatus | undefined>(undefined);
  const sortBy = ref('createdAt');
  const sortDir = ref<'asc' | 'desc'>('desc');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const current = ref<LoanApplicationWithApplicant | null>(null);
  const isLoadingCurrent = ref(false);

  const summary = ref<LoanApplicationsSummary | null>(null);

  async function fetchList(page = pagination.value.page): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await loanApplicationsApi.listLoanApplications({
        page,
        pageSize: pagination.value.pageSize,
        status: statusFilter.value,
        sortBy: sortBy.value as never,
        sortDir: sortDir.value,
      });
      items.value = result.data;
      pagination.value = result.pagination;
    } catch {
      error.value = 'Failed to load loan applications.';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSummary(): Promise<void> {
    summary.value = await loanApplicationsApi.getLoanApplicationsSummary();
  }

  async function fetchById(id: number): Promise<void> {
    isLoadingCurrent.value = true;
    error.value = null;
    current.value = null;
    try {
      current.value = await loanApplicationsApi.getLoanApplication(id);
    } catch {
      error.value = 'Loan application not found.';
    } finally {
      isLoadingCurrent.value = false;
    }
  }

  async function createApplication(payload: CreateLoanApplicationPayload): Promise<LoanApplicationWithApplicant> {
    return loanApplicationsApi.createLoanApplication(payload);
  }

  async function deleteApplication(id: number): Promise<void> {
    await loanApplicationsApi.deleteLoanApplication(id);
    items.value = items.value.filter((item) => item.id !== id);
  }

  function setStatusFilter(status: UnderwritingStatus | undefined): void {
    statusFilter.value = status;
  }

  function setSort(column: string): void {
    if (sortBy.value === column) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = column;
      sortDir.value = 'asc';
    }
  }

  return {
    items,
    pagination,
    statusFilter,
    sortBy,
    sortDir,
    isLoading,
    error,
    current,
    isLoadingCurrent,
    summary,
    fetchList,
    fetchSummary,
    fetchById,
    createApplication,
    deleteApplication,
    setStatusFilter,
    setSort,
  };
});
