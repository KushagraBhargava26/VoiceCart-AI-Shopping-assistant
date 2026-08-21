import { Router } from 'express';
import {
  handleGetShoppingList,
  handleAddShoppingItem,
  handleUpdateShoppingItem,
  handleDeleteShoppingItem,
} from '../controllers/shopping.controller.js';

const router = Router();

router.get('/', handleGetShoppingList);
router.post('/items', handleAddShoppingItem);
router.patch('/items/:id', handleUpdateShoppingItem);
router.delete('/items/:id', handleDeleteShoppingItem);

export default router;