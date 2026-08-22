import prisma from '../config/prisma.js';

/**
 * Returns all product categories along with how many products exist in each.
 */
export async function getCategoriesWithCounts() {
  const categories = await prisma.productCategory.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    itemCount: c._count.products,
  }));
}