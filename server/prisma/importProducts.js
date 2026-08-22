import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient();

// Search terms mapped to our internal categories + a plausible price range (INR).
// Open Food Facts has no price data (it's a nutrition/label database), so prices
// here are approximate, assigned for demo purposes only.
const SEARCH_TERMS = [
  { term: 'milk', category: 'Dairy', priceRange: [50, 90] },
  { term: 'curd', category: 'Dairy', priceRange: [30, 60] },
  { term: 'butter', category: 'Dairy', priceRange: [50, 120] },
  { term: 'basmati rice', category: 'Grains', priceRange: [150, 450] },
  { term: 'wheat atta', category: 'Grains', priceRange: [200, 400] },
  { term: 'biscuits', category: 'Snacks', priceRange: [10, 60] },
  { term: 'potato chips', category: 'Snacks', priceRange: [10, 50] },
  { term: 'tea', category: 'Beverages', priceRange: [60, 250] },
  { term: 'coffee', category: 'Beverages', priceRange: [80, 300] },
  { term: 'orange juice', category: 'Beverages', priceRange: [50, 150] },
  { term: 'toothpaste', category: 'Personal Care', priceRange: [60, 200] },
  { term: 'shampoo', category: 'Personal Care', priceRange: [80, 350] },
  { term: 'bread', category: 'Bakery', priceRange: [30, 70] },
  { term: 'apple', category: 'Fruits', priceRange: [100, 250] },
  { term: 'banana', category: 'Fruits', priceRange: [30, 60] },
];

function randomPrice([min, max]) {
  return Math.round(min + Math.random() * (max - min));
}

async function fetchProductsForTerm(term) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=5`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'VoiceCart-Student-Project/1.0' },
  });

  if (!response.ok) {
    console.warn(`Skipping "${term}" - API returned ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.products || [];
}

async function main() {
  const categoryRecords = {};

  for (const { term, category, priceRange } of SEARCH_TERMS) {
    if (!categoryRecords[category]) {
      categoryRecords[category] = await prisma.productCategory.upsert({
        where: { name: category },
        update: {},
        create: { name: category },
      });
    }

    console.log(`Fetching "${term}" from Open Food Facts...`);
    const products = await fetchProductsForTerm(term);

    for (const p of products) {
      const name = p.product_name ? p.product_name.trim() : null;
      if (!name) continue;

      const brand = p.brands ? p.brands.split(',')[0].trim() : null;
      const size = p.quantity || null;

      const existing = await prisma.product.findFirst({
        where: { name, brand },
      });

      if (existing) continue;

      await prisma.product.create({
        data: {
          name,
          brand,
          size,
          price: randomPrice(priceRange),
          currency: 'INR',
          available: true,
          categoryId: categoryRecords[category].id,
        },
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log('Product import from Open Food Facts complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
