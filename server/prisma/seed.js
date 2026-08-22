import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

async function seedDefaultUser() {
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      name: "Default User",
    },
  });

  const existingList = await prisma.shoppingList.findFirst({
    where: { userId: user.id },
  });

  if (!existingList) {
    await prisma.shoppingList.create({
      data: {
        name: "My Shopping List",
        userId: user.id,
      },
    });
    console.log("Default user and shopping list created.");
  } else {
    console.log("Default user and shopping list already exist.");
  }
}

async function seedProducts() {
  const categories = ["Dairy", "Personal Care", "Beverages", "Snacks", "Grains", "Fruits", "Bakery"];
  const categoryRecords = {};
  for (const name of categories) {
    const category = await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryRecords[name] = category;
  }

  const products = [
    { name: "Toothpaste", brand: "Colgate", category: "Personal Care", price: 120, currency: "INR", size: "100g" },
    { name: "Toothpaste", brand: "Pepsodent", category: "Personal Care", price: 95, currency: "INR", size: "100g" },
    { name: "Shampoo", brand: "Dove", category: "Personal Care", price: 250, currency: "INR", size: "200ml" },
    { name: "Milk", brand: "Amul", category: "Dairy", price: 60, currency: "INR", size: "1 litre" },
    { name: "Water Bottle", brand: "Bisleri", category: "Beverages", price: 20, currency: "INR", size: "1 litre" },
    { name: "Potato Chips", brand: "Lays", category: "Snacks", price: 20, currency: "INR", size: "52g" },
    { name: "Rice", brand: "India Gate", category: "Grains", price: 400, currency: "INR", size: "5kg" },
    { name: "Apples", brand: null, category: "Fruits", price: 180, currency: "INR", size: "1kg" },
    { name: "Bananas", brand: null, category: "Fruits", price: 50, currency: "INR", size: "1 dozen" },
    { name: "Eggs", brand: null, category: "Dairy", price: 80, currency: "INR", size: "12 pieces" },
    { name: "Bread", brand: "Britannia", category: "Bakery", price: 45, currency: "INR", size: "400g" },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, brand: product.brand },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          brand: product.brand,
          price: product.price,
          currency: product.currency,
          size: product.size,
          available: true,
          categoryId: categoryRecords[product.category].id,
        },
      });
    }
  }

  console.log("Sample products seeded.");
}

async function main() {
  await seedDefaultUser();
  await seedProducts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
