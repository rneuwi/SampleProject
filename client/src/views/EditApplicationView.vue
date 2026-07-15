<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { isAxiosError } from 'axios';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useLoanApplicationsStore } from '@/stores/loanApplications';
import { unmaskNumeric } from '@/utils/masks';
import type {
  ApiValidationErrorDetail,
  EmploymentStatus,
  LoanType,
  UnderwritingStatus,
  UpdateLoanApplicationPayload,
} from '@/types/domain';

const route = useRoute();
const router = useRouter();
const store = useLoanApplicationsStore();
const { current, isLoadingCurrent, error } = storeToRefs(store);

const applicationId = computed(() => Number(route.params.id));

const form = reactive({
  loanType: 'conventional' as LoanType,
  loanAmount: '',
  propertyValue: '',
  annualIncome: '',
  monthlyDebts: '',
  creditScore: '',
  employmentStatus: 'employed' as EmploymentStatus,
  interestRate: '',
  loanTermMonths: '',
});

const overrideDecision = ref(false);
const reviewStatus = ref<UnderwritingStatus>('approved');
const reviewNotes = ref('');

const loanTypeOptions = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
];

const employmentStatusOptions = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
];

const statusOptions: { value: UnderwritingStatus; label: string }[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'refer', label: 'Refer' },
  { value: 'declined', label: 'Declined' },
];

const REQUIRED_FIELDS = ['loanAmount', 'propertyValue', 'annualIncome', 'monthlyDebts', 'creditScore'] as const;

const fieldErrors = reactive<Record<string, string>>({});
const submitError = ref<string | null>(null);
const isSubmitting = ref(false);

function populateForm(): void {
  if (!current.value) return;
  form.loanType = current.value.loanType;
  form.loanAmount = String(current.value.loanAmount);
  form.propertyValue = String(current.value.propertyValue);
  form.annualIncome = String(current.value.annualIncome);
  form.monthlyDebts = String(current.value.monthlyDebts);
  form.creditScore = String(current.value.creditScore);
  form.employmentStatus = current.value.employmentStatus;
  form.interestRate = String(current.value.interestRate);
  form.loanTermMonths = String(current.value.loanTermMonths);
  reviewStatus.value = current.value.underwritingStatus;
  reviewNotes.value = current.value.underwritingNotes;
}

watch(current, populateForm);

function clearErrors(): void {
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
  submitError.value = null;
}

watch(form, () => clearErrors(), { deep: true });

function validateClientSide(): boolean {
  let valid = true;
  for (const field of REQUIRED_FIELDS) {
    if (!String(form[field]).trim()) {
      fieldErrors[field] = 'This field is required.';
      valid = false;
    }
  }
  return valid;
}

function buildPayload(): UpdateLoanApplicationPayload {
  const payload: UpdateLoanApplicationPayload = {
    loanType: form.loanType,
    loanAmount: unmaskNumeric(form.loanAmount),
    propertyValue: unmaskNumeric(form.propertyValue),
    annualIncome: unmaskNumeric(form.annualIncome),
    monthlyDebts: unmaskNumeric(form.monthlyDebts),
    creditScore: form.creditScore,
    employmentStatus: form.employmentStatus,
    interestRate: form.interestRate || undefined,
    loanTermMonths: form.loanTermMonths || undefined,
  };
  if (overrideDecision.value) {
    payload.underwritingStatus = reviewStatus.value;
    payload.underwritingNotes = reviewNotes.value || undefined;
  }
  return payload;
}

async function onSubmit(): Promise<void> {
  clearErrors();
  if (!validateClientSide()) return;

  isSubmitting.value = true;
  try {
    await store.updateApplication(applicationId.value, buildPayload());
    router.push(`/applications/${applicationId.value}`);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 400) {
      const details: ApiValidationErrorDetail[] | undefined = err.response.data?.details;
      details?.forEach((detail) => {
        fieldErrors[detail.path] = detail.message;
      });
      if (!details) {
        submitError.value = err.response.data?.error ?? 'Please check the form and try again.';
      }
    } else {
      submitError.value = 'Something went wrong saving this application. Please try again.';
    }
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  await store.fetchById(applicationId.value);
  populateForm();
});
</script>

<template>
  <div>
    <RouterLink :to="`/applications/${applicationId}`" class="btn btn-link px-0 mb-3">&larr; Back to application</RouterLink>

    <div v-if="isLoadingCurrent" class="text-muted">Loading…</div>
    <div v-else-if="error || !current" class="alert alert-warning">Loan application not found.</div>

    <template v-else>
      <h1 class="h3 mb-1">Edit Loan Application</h1>
      <p class="text-muted mb-4">
        {{ current.applicant.firstName }} {{ current.applicant.lastName }} &middot; {{ current.applicant.email }}
      </p>

      <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>

      <form novalidate @submit.prevent="onSubmit">
        <div class="card mb-4">
          <div class="card-header fw-semibold"><i class="bi bi-house me-2"></i>Loan Details</div>
          <div class="card-body row g-3">
            <FormField
              v-model="form.loanType"
              id="loanType"
              class="col-md-6"
              type="select"
              label="Loan Type"
              :options="loanTypeOptions"
            />
            <FormField
              v-model="form.employmentStatus"
              id="employmentStatus"
              class="col-md-6"
              type="select"
              label="Employment Status"
              :options="employmentStatusOptions"
            />
            <FormField
              v-model="form.loanAmount"
              id="loanAmount"
              class="col-md-6"
              type="text"
              inputmode="decimal"
              mask="currency"
              label="Loan Amount ($)"
              required
              min="1"
              :error="fieldErrors.loanAmount"
            />
            <FormField
              v-model="form.propertyValue"
              id="propertyValue"
              class="col-md-6"
              type="text"
              inputmode="decimal"
              mask="currency"
              label="Property Value ($)"
              required
              min="1"
              :error="fieldErrors.propertyValue"
            />
            <FormField
              v-model="form.annualIncome"
              id="annualIncome"
              class="col-md-6"
              type="text"
              inputmode="decimal"
              mask="currency"
              label="Annual Income ($)"
              required
              min="1"
              :error="fieldErrors.annualIncome"
            />
            <FormField
              v-model="form.monthlyDebts"
              id="monthlyDebts"
              class="col-md-6"
              type="text"
              inputmode="decimal"
              mask="currency"
              label="Monthly Debts ($)"
              required
              min="0"
              :error="fieldErrors.monthlyDebts"
              hint="Recurring monthly debt payments, excluding the mortgage."
            />
            <FormField
              v-model="form.creditScore"
              id="creditScore"
              class="col-md-6"
              type="text"
              inputmode="numeric"
              label="Credit Score"
              required
              min="300"
              max="850"
              :error="fieldErrors.creditScore"
            />
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header fw-semibold"><i class="bi bi-sliders me-2"></i>Advanced</div>
          <div class="card-body row g-3">
            <FormField
              v-model="form.interestRate"
              id="interestRate"
              class="col-md-6"
              type="text"
              inputmode="decimal"
              mask="percent"
              label="Interest Rate (%)"
              min="0"
              max="25"
            />
            <FormField
              v-model="form.loanTermMonths"
              id="loanTermMonths"
              class="col-md-6"
              type="text"
              inputmode="numeric"
              label="Loan Term (months)"
              min="1"
              max="600"
            />
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header fw-semibold"><i class="bi bi-clipboard-check me-2"></i>Underwriting Decision</div>
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="text-muted small">Current:</span>
              <StatusBadge :status="current.underwritingStatus" />
              <span class="text-muted small">{{ current.underwritingNotes }}</span>
            </div>

            <div class="form-check mb-3">
              <input id="overrideDecision" v-model="overrideDecision" class="form-check-input" type="checkbox" />
              <label for="overrideDecision" class="form-check-label">
                Manually set the underwriting decision (reviewer override)
              </label>
            </div>

            <div v-if="overrideDecision" class="row g-3">
              <FormField
                v-model="reviewStatus"
                id="reviewStatus"
                class="col-md-6"
                type="select"
                label="Reviewer Decision"
                :options="statusOptions"
              />
              <FormField
                v-model="reviewNotes"
                id="reviewNotes"
                class="col-md-12"
                label="Reviewer Notes"
                placeholder="Explain the manual decision…"
              />
            </div>
            <p v-else class="text-muted small mb-0">
              Leave unchecked to keep recalculating the decision automatically from the loan details above.
            </p>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            Save Changes
          </button>
          <RouterLink :to="`/applications/${applicationId}`" class="btn btn-outline-secondary">Cancel</RouterLink>
        </div>
      </form>
    </template>
  </div>
</template>
