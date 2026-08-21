import 'dotenv/config';
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });