import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Тестовый пользователь",
    },
  });

  const category = await prisma.category.create({
    data: { category: "Проверка" },
  });

  const prompt = await prisma.realtyPlaybook.create({
    data: {
      ownerId: user.id,
      title: "Тестовый промт",
      content: "Содержимое тестового промта",
      description: "Для проверки схемы БД",
      categoryId: category.id,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  });

  const vote = await prisma.vote.create({
    data: {
      userId: user.id,
      promptId: prompt.id,
      value: 1,
    },
  });

  console.log("OK: пользователь", user.id);
  console.log("OK: промт", prompt.id);
  console.log("OK: голос", vote.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
