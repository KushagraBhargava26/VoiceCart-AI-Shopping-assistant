import { searchProducts } from '../services/search.service.js';

export async function handleSearchProducts(req, res) {
  const { query, brand, minPrice, maxPrice, size, category } = req.query;

  try {
    const filters = {};
    if (brand) filters.brand = brand;
    if (size) filters.size = size;
    if (category) filters.category = category;
    if (minPrice !== undefined) filters.minPrice = Number(minPrice);
    if (maxPrice !== undefined) filters.maxPrice = Number(maxPrice);

    const results = await searchProducts({ query, ...filters });

    res.status(200).json({
      success: true,
      data: {
        query: query || null,
        filters,
        results,
      },
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'We could not search products right now. Please try again.',
      },
    });
  }
}