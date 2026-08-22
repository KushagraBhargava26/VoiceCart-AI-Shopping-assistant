import prisma from '../config/prisma.js';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Returns the shopping history for the default user, most recent first.
 */
export async function getShoppingHistory({ limit = 50 } = {}) {
  const records = await prisma.shoppingHistory.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { purchasedAt: 'desc' },
    take: limit,
  });

  return records;
}