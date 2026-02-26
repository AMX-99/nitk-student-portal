import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} from '../controllers/notice.controller.js';

const router = Router();
router.use(verifyJWT);

router.get('/', getNotices);
router.get('/:id', getNotice);
router.post('/', checkRole('teacher', 'admin'), createNotice);
router.patch('/:id', updateNotice);
router.delete('/:id', deleteNotice);

export default router;