import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import {
  getMyFees,
  getAllFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getAllDemands,
  raiseDemand,
  raiseBatchDemand,
  markDemandPaid,
} from '../controllers/fee.controller.js';

const router = Router();
router.use(verifyJWT);
router.get('/me', checkRole('student'), getMyFees);
router.get('/structures', checkRole('admin'), getAllFeeStructures);
router.post('/structures', checkRole('admin'), createFeeStructure);
router.put('/structures/:id', checkRole('admin'), updateFeeStructure);
router.delete('/structures/:id', checkRole('admin'), deleteFeeStructure);
router.get('/demands', checkRole('admin'), getAllDemands);
router.post('/demands/raise', checkRole('admin'), raiseDemand);
router.post('/demands/raise-batch', checkRole('admin'), raiseBatchDemand);
router.patch('/demands/:id/mark-paid', checkRole('admin'), markDemandPaid);

export default router;