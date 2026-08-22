import { Router } from 'express';
import { handleGetHistory } from '../controllers/history.controller.js';

const router = Router();

router.get('/', handleGetHistory);

export default router;