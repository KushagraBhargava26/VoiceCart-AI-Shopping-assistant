import {
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from '../services/shopping.service.js';

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export async function handleGetShoppingList(req, res) {
  try {
    const listData = await getShoppingList();
    res.status(200).json({
      success: true,
      data: listData,
    });
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    sendError(res, 500, 'DATABASE_ERROR', 'We could not fetch your shopping list. Please try again.');
  }
}

export async function handleAddShoppingItem(req, res) {
  const { name, quantity, unit, category, brand, price } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return sendError(res, 422, 'VALIDATION_ERROR', 'Item name is required.');
  }

  if (quantity === undefined || Number(quantity) <= 0) {
    return sendError(res, 422, 'VALIDATION_ERROR', 'Quantity must be a positive number.');
  }

  if (!unit || typeof unit !== 'string') {
    return sendError(res, 422, 'VALIDATION_ERROR', 'Unit is required.');
  }

  try {
    const item = await addShoppingItem({
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      category: category || null,
      brand: brand || null,
      price: price ? Number(price) : null,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error('Error adding shopping item:', err);
    sendError(res, 500, 'DATABASE_ERROR', 'We could not add this item. Please try again.');
  }
}

export async function handleUpdateShoppingItem(req, res) {
  const { id } = req.params;
  const updates = req.body;

  if (updates.quantity !== undefined && Number(updates.quantity) <= 0) {
    return sendError(res, 422, 'VALIDATION_ERROR', 'Quantity must be a positive number.');
  }

  if (updates.status !== undefined && !['PENDING', 'COMPLETED'].includes(updates.status)) {
    return sendError(res, 422, 'VALIDATION_ERROR', 'Status must be PENDING or COMPLETED.');
  }

  try {
    const item = await updateShoppingItem(id, updates);
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return sendError(res, 404, 'ITEM_NOT_FOUND', 'This item does not exist.');
    }
    console.error('Error updating shopping item:', err);
    sendError(res, 500, 'DATABASE_ERROR', 'We could not update this item. Please try again.');
  }
}

export async function handleDeleteShoppingItem(req, res) {
  const { id } = req.params;

  try {
    await deleteShoppingItem(id);
    res.status(200).json({
      success: true,
      data: { message: 'Item removed successfully.' },
    });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return sendError(res, 404, 'ITEM_NOT_FOUND', 'This item does not exist.');
    }
    console.error('Error deleting shopping item:', err);
    sendError(res, 500, 'DATABASE_ERROR', 'We could not remove this item. Please try again.');
  }
}