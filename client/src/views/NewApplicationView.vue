<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isAxiosError } from 'axios';
import FormField from '@/components/common/FormField.vue';
import { useLoanApplicationsStore } from '@/stores/loanApplications';
import type { ApiValidationErrorDetail, CreateLoanApplicationPayload, EmploymentStatus, LoanType } from '@/types/domain';

const router = useRouter();
const store = useLoanApplicationsStore();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
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

const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'loanAmount',
  'propertyValue',
  'annualIncome',
  'monthlyDebts',
  'creditScore',
] as const;

const fieldErrors = reactive<Record<string, string>>({});
const submitError = ref<string | null>(null);
const isSubmitting = ref(false);

function clearErrors(): void {
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
  submitError.value = null;
}

function validateClientSide(): boolean {
  let valid = true;
  for (const field of REQUIRED_FIELDS) {
    if (!form[field].trim()) {
      fieldErrors[field] = 'This field is required.';
      valid = false;
    }
  }
  return valid;
}

function buildPayload(): CreateLoanApplicationPayload {
  return {
    applicant: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
    },
    loanType: form.loanType,
    loanAmount: form.loanAmount,
    propertyValue: form.propertyValue,
    annualIncome: form.annualIncome,
    monthlyDebts: form.monthlyDebts,
    creditScore: form.creditScore,
    employmentStatus: form.employmentStatus,
    interestRate: form.interestRate || undefined,
    loanTermMonths: form.loanTermMonths || undefined,
  };
}

async function onSubmit(): Promise<void> {
  clearErrors();
  if (!validateClientSide()) return;

  isSubmitting.value = true;
  try {
    const created = await store.createApplication(buildPayload());
    router.push(`/applications/${created.id}`);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 400) {
      const details: ApiValidationErrorDetail[] | undefined = err.response.data?.details;
      details?.forEach((detail) => {
        fieldErrors[detail.path.replace(/^applicant\./, '')] = detail.message;
      });
      if (!details) {
        submitError.value = err.response.data?.error ?? 'Please check the form and try again.';
      }
    } else {
      submitError.value = 'Something went wrong submitting this application. Please try again.';
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="h3 mb-1">New Loan Application</h1>
    <p class="text-muted mb-4">
      Submitting calculates DTI and LTV and returns an automated underwriting recommendation immediately.
    </p>

    <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>

    <form novalidate @submit.prevent="onSubmit">
      <div class="card mb-4">
        <div class="card-header fw-semibold"><i class="bi bi-person me-2"></i>Applicant Information</div>
        <div class="card-body row g-3">
          <FormField
            v-model="form.firstName"
            id="firstName"
            class="col-md-6"
            label="First Name"
            required
            :error="fieldErrors.firstName"
          />
          <FormField
            v-model="form.lastName"
            id="lastName"
            class="col-md-6"
            label="Last Name"
            required
            :error="fieldErrors.lastName"
          />
          <FormField
            v-model="form.email"
            id="email"
            class="col-md-6"
            type="email"
            label="Email"
            required
            :error="fieldErrors.email"
          />
          <FormField
            v-model="form.phone"
            id="phone"
            class="col-md-6"
            type="tel"
            label="Phone (optional)"
            :error="fieldErrors.phone"
          />
        </div>
      </div>

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
            type="number"
            label="Loan Amount ($)"
            required
            min="1"
            :error="fieldErrors.loanAmount"
          />
          <FormField
            v-model="form.propertyValue"
            id="propertyValue"
            class="col-md-6"
            type="number"
            label="Property Value ($)"
            required
            min="1"
            :error="fieldErrors.propertyValue"
          />
          <FormField
            v-model="form.annualIncome"
            id="annualIncome"
            class="col-md-6"
            type="number"
            label="Annual Income ($)"
            required
            min="1"
            :error="fieldErrors.annualIncome"
          />
          <FormField
            v-model="form.monthlyDebts"
            id="monthlyDebts"
            class="col-md-6"
            type="number"
            label="Monthly Debts ($)"
            required
            min="0"
            :error="fieldErrors.monthlyDebts"
            hint="Recurring monthly debt payments, excluding the new mortgage."
          />
          <FormField
            v-model="form.creditScore"
            id="creditScore"
            class="col-md-6"
            type="number"
            label="Credit Score"
            required
            min="300"
            max="850"
            :error="fieldErrors.creditScore"
          />
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header fw-semibold"><i class="bi bi-sliders me-2"></i>Advanced (optional)</div>
        <div class="card-body row g-3">
          <FormField
            v-model="form.interestRate"
            id="interestRate"
            class="col-md-6"
            type="number"
            label="Interest Rate (%)"
            min="0"
            max="25"
            hint="Defaults to 6.5% if left blank."
          />
          <FormField
            v-model="form.loanTermMonths"
            id="loanTermMonths"
            class="col-md-6"
            type="number"
            label="Loan Term (months)"
            min="1"
            max="600"
            hint="Defaults to 360 months (30 years) if left blank."
          />
        </div>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          Submit Application
        </button>
        <RouterLink to="/" class="btn btn-outline-secondary">Cancel</RouterLink>
      </div>
    </form>
  </div>
</template>
