import { Router } from 'express';
import { handleGetSuggestions } from '../controllers/suggestion.controller.js';

const router = Router();

router.get('/', handleGetSuggestions);

export default router;