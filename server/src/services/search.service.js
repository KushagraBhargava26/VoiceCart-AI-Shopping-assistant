import prisma from '../config/prisma.js';

/**
 * Searches the Product catalog using an optional text query and filters.
 * Filters: brand, minPrice, maxPrice, size, category (all optional).
 */
export async function searchProducts({ query, brand, minPrice, maxPrice, size, category }) {
  const where = {};

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }

  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  if (size) {
    where.size = { equals: size, mode: 'insensitive' };
  }

  if (category) {
    where.category = { name: { equals: category, mode: 'insensitive' } };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  where.available = true;

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    take: 20,
    orderBy: { name: 'asc' },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category?.name || null,
    description: p.description,
    price: p.price,
    currency: p.currency,
    size: p.size,
  }));
}