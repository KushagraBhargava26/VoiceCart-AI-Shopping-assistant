import prisma from "../config/prisma.js";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Gets (or lazily creates) the default shopping list for the MVP's single default user.
 */
export async function getDefaultShoppingList() {
  let list = await prisma.shoppingList.findFirst({
    where: { userId: DEFAULT_USER_ID },
  });

  if (!list) {
    list = await prisma.shoppingList.create({
      data: {
        name: "My Shopping List",
        userId: DEFAULT_USER_ID,
      },
    });
  }

  return list;
}

/**
 * Very small, deterministic category guesser for the MVP.
 * This is intentionally simple; Phase 5 (Automatic Categorization) can replace/extend this.
 */
function guessCategory(name) {
  const normalized = name.toLowerCase();

  const map = {
    Dairy: ["milk", "cheese", "butter", "curd", "yogurt", "paneer"],
    Fruits: ["apple", "banana", "orange", "mango", "grape"],
    Vegetables: ["tomato", "potato", "onion", "carrot", "spinach"],
    Beverages: ["water", "juice", "soda", "cola", "tea", "coffee"],
    Snacks: ["chips", "biscuit", "cookie", "namkeen"],
    Grains: ["rice", "wheat", "flour", "atta", "oats"],
    "Personal Care": ["soap", "shampoo", "toothpaste", "brush"],
  };

  for (const [category, keywords] of Object.entries(map)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return null;
}

export async function getShoppingList() {
  const list = await getDefaultShoppingList();

  const items = await prisma.shoppingItem.findMany({
    where: { shoppingListId: list.id },
    orderBy: { createdAt: "asc" },
  });

  return items;
}
export async function addShoppingItem({ name, quantity, unit, category, brand }) {
  const list = await getDefaultShoppingList();

  const existing = await prisma.shoppingItem.findFirst({
    where: {
      shoppingListId: list.id,
      name: { equals: name.trim(), mode: 'insensitive' },
      unit,
    },
  });

  if (existing) {
    const merged = await prisma.shoppingItem.update({
      where: { id: existing.id },
      data: { quantity: Number(existing.quantity) + Number(quantity) },
    });
    return merged;
  }

  const resolvedCategory = category || guessCategory(name);

  const item = await prisma.shoppingItem.create({
    data: {
      name,
      quantity,
      unit,
      category: resolvedCategory,
      brand: brand || null,
      shoppingListId: list.id,
    },
  });

  return item;
}

export async function updateShoppingItem(id, updates) {
  const existing = await prisma.shoppingItem.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error("Shopping item not found.");
    error.code = "NOT_FOUND";
    throw error;
  }

  const data = {};

  if (updates.name !== undefined) data.name = updates.name;
  if (updates.quantity !== undefined) data.quantity = updates.quantity;
  if (updates.unit !== undefined) data.unit = updates.unit;
  if (updates.category !== undefined) data.category = updates.category;
  if (updates.brand !== undefined) data.brand = updates.brand;
  if (updates.status !== undefined) data.status = updates.status;

  const updated = await prisma.shoppingItem.update({
    where: { id },
    data,
  });

  // If item is marked completed, log it to shopping history for future suggestions.
  if (updates.status === "COMPLETED") {
    await prisma.shoppingHistory.create({
      data: {
        userId: DEFAULT_USER_ID,
        itemName: updated.name,
        quantity: updated.quantity,
        unit: updated.unit,
        category: updated.category,
      },
    });
  }

  return updated;
}

export async function deleteShoppingItem(id) {
  const existing = await prisma.shoppingItem.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error("Shopping item not found.");
    error.code = "NOT_FOUND";
    throw error;
  }

  await prisma.shoppingItem.delete({ where: { id } });
}

/**
 * Finds an existing shopping item by (case-insensitive) name within the default list.
 * Used by voice commands, where the user refers to items by name rather than ID.
 */
export async function findShoppingItemByName(name) {
  const list = await getDefaultShoppingList();

  return prisma.shoppingItem.findFirst({
    where: {
      shoppingListId: list.id,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
}
