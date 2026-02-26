import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import { initiatePayment, verifyPayment, handleWebhook } from '../controllers/payment.controller.js';

const router = Router();

router.post('/initiate', verifyJWT, checkRole('student'), initiatePayment);
router.post('/verify', verifyJWT, checkRole('student'), verifyPayment);

router.post('/webhook', handleWebhook);

export default router;