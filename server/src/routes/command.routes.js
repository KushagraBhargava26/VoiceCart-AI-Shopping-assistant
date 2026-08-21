import { Router } from 'express';
import { handleVoiceCommand } from '../controllers/command.controller.js';

const router = Router();

router.post('/', handleVoiceCommand);

export default router;