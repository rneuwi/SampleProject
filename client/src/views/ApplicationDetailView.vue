<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useLoanApplicationsStore } from '@/stores/loanApplications';
import StatusBadge from '@/components/common/StatusBadge.vue';
import RatioProgress from '@/components/common/RatioProgress.vue';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const route = useRoute();
const router = useRouter();
const store = useLoanApplicationsStore();
const { current, isLoadingCurrent, error } = storeToRefs(store);

const applicationId = computed(() => Number(route.params.id));
const showDeleteModal = ref(false);
const isDeleting = ref(false);

async function confirmDelete(): Promise<void> {
  if (!current.value) return;
  isDeleting.value = true;
  try {
    await store.deleteApplication(current.value.id);
    router.push('/');
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
}

onMounted(() => store.fetchById(applicationId.value));
watch(applicationId, (id) => store.fetchById(id));
</script>

<template>
  <div>
    <RouterLink to="/" class="btn btn-link px-0 mb-3">&larr; Back to dashboard</RouterLink>

    <div v-if="isLoadingCurrent" class="text-muted">Loading…</div>
    <div v-else-if="error || !current" class="alert alert-warning">Loan application not found.</div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h1 class="h3 mb-1">{{ current.applicant.firstName }} {{ current.applicant.lastName }}</h1>
          <div class="text-muted">{{ current.applicant.email }} &middot; {{ current.applicant.phone ?? 'No phone on file' }}</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <StatusBadge :status="current.underwritingStatus" />
          <RouterLink :to="`/applications/${current.id}/edit`" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit
          </RouterLink>
          <button class="btn btn-outline-danger btn-sm" @click="showDeleteModal = true">
            <i class="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card mb-4">
            <div class="card-header fw-semibold"><i class="bi bi-house me-2"></i>Loan Details</div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-5">Loan Type</dt>
                <dd class="col-sm-7 text-uppercase">{{ current.loanType }}</dd>
                <dt class="col-sm-5">Loan Amount</dt>
                <dd class="col-sm-7">{{ formatCurrency(current.loanAmount) }}</dd>
                <dt class="col-sm-5">Property Value</dt>
                <dd class="col-sm-7">{{ formatCurrency(current.propertyValue) }}</dd>
                <dt class="col-sm-5">Annual Income</dt>
                <dd class="col-sm-7">{{ formatCurrency(current.annualIncome) }}</dd>
                <dt class="col-sm-5">Monthly Debts</dt>
                <dd class="col-sm-7">{{ formatCurrency(current.monthlyDebts) }}</dd>
                <dt class="col-sm-5">Credit Score</dt>
                <dd class="col-sm-7">{{ current.creditScore }}</dd>
                <dt class="col-sm-5">Employment Status</dt>
                <dd class="col-sm-7 text-capitalize">{{ current.employmentStatus.replace('_', ' ') }}</dd>
                <dt class="col-sm-5">Rate / Term</dt>
                <dd class="col-sm-7">{{ current.interestRate }}% / {{ current.loanTermMonths }} months</dd>
                <dt class="col-sm-5">Est. Monthly Payment</dt>
                <dd class="col-sm-7">{{ formatCurrency(current.monthlyHousingPayment) }}</dd>
                <dt class="col-sm-5">Submitted</dt>
                <dd class="col-sm-7 mb-0">{{ formatDate(current.createdAt, 'long') }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card mb-4">
            <div class="card-header fw-semibold"><i class="bi bi-clipboard-check me-2"></i>Underwriting Decision</div>
            <div class="card-body">
              <StatusBadge :status="current.underwritingStatus" />
              <p class="mt-3 mb-0">{{ current.underwritingNotes }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-header fw-semibold"><i class="bi bi-graph-up me-2"></i>Risk Metrics</div>
            <div class="card-body d-flex flex-column gap-4">
              <RatioProgress label="Debt-to-Income (DTI)" :value="current.dtiRatio" :good-threshold="36" :warn-threshold="45" />
              <RatioProgress label="Loan-to-Value (LTV)" :value="current.ltvRatio" :good-threshold="80" :warn-threshold="95" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <Modal v-model="showDeleteModal" title="Delete Application">
      <p>
        Are you sure you want to delete this loan application for
        <strong>{{ current?.applicant.firstName }} {{ current?.applicant.lastName }}</strong>? This cannot be undone.
      </p>
      <template #footer>
        <button class="btn btn-outline-secondary" @click="showDeleteModal = false">Cancel</button>
        <button class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2"></span>
          Delete
        </button>
      </template>
    </Modal>
  </div>
</template>
