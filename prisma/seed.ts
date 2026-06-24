import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: {
      email: "seed@example.com",
      name: "Seed User",
    },
  });

  await prisma.note.createMany({
    data: [
      { ownerId: user.id, title: "Первая заметка" },
      { ownerId: user.id, title: "Вторая заметка" },
      { ownerId: user.id, title: "Третья заметка" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
