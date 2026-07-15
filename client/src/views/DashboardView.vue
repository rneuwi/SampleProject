<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useLoanApplicationsStore } from '@/stores/loanApplications';
import DataTable from '@/components/common/DataTable.vue';
import MultiSelectDropdown from '@/components/common/MultiSelectDropdown.vue';
import Pagination from '@/components/common/Pagination.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import type { DataTableColumn } from '@/types/dataTable';
import type { LoanApplicationWithApplicant, UnderwritingStatus } from '@/types/domain';
import { formatCurrency, formatDate, formatPercent } from '@/utils/formatters';

const router = useRouter();
const store = useLoanApplicationsStore();
const { items, pagination, isLoading, statusFilter, sortBy, sortDir, summary } = storeToRefs(store);

const columns: DataTableColumn<LoanApplicationWithApplicant>[] = [
  { key: 'applicant', label: 'Applicant' },
  { key: 'loanType', label: 'Loan Type' },
  { key: 'loanAmount', label: 'Loan Amount', sortable: true, align: 'end' },
  { key: 'creditScore', label: 'Credit Score', sortable: true, align: 'end' },
  { key: 'dtiRatio', label: 'DTI', sortable: true, align: 'end' },
  { key: 'ltvRatio', label: 'LTV', sortable: true, align: 'end' },
  { key: 'underwritingStatus', label: 'Status' },
  { key: 'createdAt', label: 'Submitted', sortable: true },
];

const NEEDS_REVIEW_STATUSES: UnderwritingStatus[] = ['conditional', 'refer'];

const statusOptions: { value: UnderwritingStatus; label: string }[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'refer', label: 'Refer' },
  { value: 'declined', label: 'Declined' },
];

const needsReviewCount = computed(() => (summary.value?.byStatus.conditional ?? 0) + (summary.value?.byStatus.refer ?? 0));

function statusFilterMatches(statuses: UnderwritingStatus[]): boolean {
  return statusFilter.value.length === statuses.length && statuses.every((s) => statusFilter.value.includes(s));
}

function applyStatusFilter(statuses: UnderwritingStatus[]): void {
  store.setStatusFilter(statuses);
}

// v-model on the multi-select swaps in a new array on every change (including
// when the stat cards call applyStatusFilter above), so a plain (non-deep)
// watch is enough to refetch page 1 whenever the filter changes.
watch(statusFilter, () => store.fetchList(1));

function onSort(key: string): void {
  store.setSort(key);
  store.fetchList(1);
}

function onPageChange(page: number): void {
  store.fetchList(page);
}

function onRowClick(row: LoanApplicationWithApplicant): void {
  router.push(`/applications/${row.id}`);
}

onMounted(() => {
  store.fetchList(1);
  store.fetchSummary();
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Loan Applications</h1>
      <RouterLink to="/applications/new" class="btn btn-primary"> <i class="bi bi-plus-lg me-1"></i>New Application </RouterLink>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-lg-3">
        <StatCard
          label="Total Applications"
          :value="summary?.totalApplications ?? '—'"
          icon="bi bi-files"
          variant="primary"
          clickable
          :active="statusFilter.length === 0"
          @click="applyStatusFilter([])"
        />
      </div>
      <div class="col-sm-6 col-lg-3">
        <StatCard
          label="Approved"
          :value="summary?.byStatus.approved ?? '—'"
          icon="bi bi-check-circle"
          variant="success"
          clickable
          :active="statusFilterMatches(['approved'])"
          @click="applyStatusFilter(['approved'])"
        />
      </div>
      <div class="col-sm-6 col-lg-3">
        <StatCard
          label="Needs Review"
          :value="summary ? needsReviewCount : '—'"
          icon="bi bi-hourglass-split"
          variant="warning"
          clickable
          :active="statusFilterMatches(NEEDS_REVIEW_STATUSES)"
          @click="applyStatusFilter(NEEDS_REVIEW_STATUSES)"
        />
      </div>
      <div class="col-sm-6 col-lg-3">
        <StatCard
          label="Declined"
          :value="summary?.byStatus.declined ?? '—'"
          icon="bi bi-x-circle"
          variant="danger"
          clickable
          :active="statusFilterMatches(['declined'])"
          @click="applyStatusFilter(['declined'])"
        />
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <span class="fw-semibold"><i class="bi bi-list-ul me-2"></i>All Applications</span>
        <MultiSelectDropdown v-model="statusFilter" :options="statusOptions" placeholder="All statuses" />
      </div>
      <DataTable
        :columns="columns"
        :rows="items"
        row-key="id"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :loading="isLoading"
        empty-message="No loan applications match these filters."
        @sort="onSort"
        @row-click="onRowClick"
      >
        <template #cell-applicant="{ row }">
          <div class="fw-semibold">{{ row.applicant.firstName }} {{ row.applicant.lastName }}</div>
          <div class="text-muted small">{{ row.applicant.email }}</div>
        </template>
        <template #cell-loanType="{ value }">
          <span class="text-uppercase small">{{ value }}</span>
        </template>
        <template #cell-loanAmount="{ value }">{{ formatCurrency(value) }}</template>
        <template #cell-dtiRatio="{ value }">{{ formatPercent(value) }}</template>
        <template #cell-ltvRatio="{ value }">{{ formatPercent(value) }}</template>
        <template #cell-underwritingStatus="{ row }">
          <StatusBadge :status="row.underwritingStatus" />
        </template>
        <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
      </DataTable>
      <div class="card-footer">
        <Pagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :total-items="pagination.totalItems"
          :total-pages="pagination.totalPages"
          @update:page="onPageChange"
        />
      </div>
    </div>
  </div>
</template>
