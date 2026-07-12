import { Router } from 'express';
import * as applicantController from '../controllers/applicantController';

const router = Router();

router.get('/', applicantController.listApplicants);
router.get('/:id', applicantController.getApplicant);

export default router;
