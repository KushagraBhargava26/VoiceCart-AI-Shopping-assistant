import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient();

// Keyword -> correct category mapping. Checked in order; first match wins.
// This overrides whatever category a product was originally assigned during import,
// since search-term-based import (e.g. "banana") can wrongly bucket a snack like
// "Banana Chips" into Fruits just because it matched the search term.
const CATEGORY_RULES = [
  { keywords: ['chips', 'biscuit', 'cookie', 'namkeen', 'wafer', 'crisps'], category: 'Snacks' },
  { keywords: ['milk', 'cheese', 'butter', 'curd', 'yogurt', 'yoghurt', 'paneer', 'cream'], category: 'Dairy' },
  { keywords: ['tea', 'coffee', 'juice', 'water', 'soda', 'cola', 'drink'], category: 'Beverages' },
  { keywords: ['rice', 'atta', 'flour', 'wheat', 'oats', 'quinoa'], category: 'Grains' },
  { keywords: ['bread', 'bun', 'bakery', 'croissant'], category: 'Bakery' },
  { keywords: ['toothpaste', 'shampoo', 'soap', 'brush'], category: 'Personal Care' },
  { keywords: ['apple', 'banana', 'orange', 'mango', 'grape', 'fruit'], category: 'Fruits' },
];

function findCorrectCategory(productName) {
  const name = productName.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => name.includes(kw))) {
      return rule.category;
    }
  }
  return null; // no rule matched, leave as-is
}

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  const categoryCache = {};
  let fixedCount = 0;

  for (const product of products) {
    const correctCategoryName = findCorrectCategory(product.name);
    if (!correctCategoryName) continue;

    const currentCategoryName = product.category?.name;
    if (currentCategoryName === correctCategoryName) continue; // already correct

    if (!categoryCache[correctCategoryName]) {
      categoryCache[correctCategoryName] = await prisma.productCategory.upsert({
        where: { name: correctCategoryName },
        update: {},
        create: { name: correctCategoryName },
      });
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: categoryCache[correctCategoryName].id },
    });

    console.log(
      `Fixed: "${product.name}" moved from "${currentCategoryName}" to "${correctCategoryName}"`
    );
    fixedCount++;
  }

  console.log(`\nDone. ${fixedCount} product(s) recategorized.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });