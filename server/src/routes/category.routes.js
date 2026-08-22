import { Router } from 'express';
import { handleGetCategories } from '../controllers/category.controller.js';

const router = Router();

router.get('/', handleGetCategories);

export default router;