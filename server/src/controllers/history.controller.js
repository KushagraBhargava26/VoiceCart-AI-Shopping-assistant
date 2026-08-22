import { getShoppingHistory } from '../services/history.service.js';

export async function handleGetHistory(req, res) {
  try {
    const history = await getShoppingHistory();

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'We could not fetch your history right now. Please try again.',
      },
    });
  }
}