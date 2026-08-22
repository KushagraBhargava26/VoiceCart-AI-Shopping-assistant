import { getCategoriesWithCounts } from '../services/category.service.js';

export async function handleGetCategories(req, res) {
  try {
    const categories = await getCategoriesWithCounts();

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'We could not fetch categories right now. Please try again.',
      },
    });
  }
}