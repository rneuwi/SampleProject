import { Router } from 'express';
import * as loanApplicationController from '../controllers/loanApplicationController';
import { validateBody } from '../utils/validation';
import { createLoanApplicationSchema, updateLoanApplicationSchema } from '../validation/loanApplicationSchemas';

const router = Router();

router.get('/', loanApplicationController.listLoanApplications);
router.get('/summary', loanApplicationController.getLoanApplicationsSummary);
router.get('/:id', loanApplicationController.getLoanApplication);
router.post('/', validateBody(createLoanApplicationSchema), loanApplicationController.createLoanApplication);
router.patch('/:id', validateBody(updateLoanApplicationSchema), loanApplicationController.updateLoanApplication);
router.delete('/:id', loanApplicationController.deleteLoanApplication);

export default router;
