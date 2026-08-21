import { Router } from 'express';
import { handleSearchProducts } from '../controllers/search.controller.js';

const router = Router();

router.get('/', handleSearchProducts);

export default router;