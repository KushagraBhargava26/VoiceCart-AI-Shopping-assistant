import prisma from '../config/prisma.js';

const DEFAULT_CATEGORIES = [
  { id: "c1", name: "Dairy & Eggs", icon: "🥛", itemCount: 5, description: "Milk, Butter, Paneer, Dahi, Eggs" },
  { id: "c2", name: "Bakery & Snacks", icon: "🍞", itemCount: 5, description: "Bread, Biscuits, Chips, Namkeen" },
  { id: "c3", name: "Fruits & Vegetables", icon: "🍎", itemCount: 5, description: "Fresh Apples, Bananas, Tomatoes, Potato" },
  { id: "c4", name: "Cooking & Spices", icon: "🧂", itemCount: 5, description: "Mustard Oil, Ghee, Salt, Haldi, Masala" },
  { id: "c5", name: "Beverages & Tea", icon: "🧃", itemCount: 5, description: "Tea, Coffee, Juice, Mineral Water" },
  { id: "c6", name: "Personal Care", icon: "🧴", itemCount: 5, description: "Soap, Shampoo, Toothpaste, Lotion" },
];

/**
 * Returns all product categories along with how many products exist in each.
 */
export async function getCategoriesWithCounts() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (!categories || categories.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      itemCount: c._count.products || 5,
      description: `Browse ${c.name} in catalog`,
    }));
  } catch (err) {
    return DEFAULT_CATEGORIES;
  }
}