import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();


async function main() {
  const users = await prisma.usuario.findMany({ where: { email: { contains: 'librey.com' } } });
  console.log("Users in DB:", users);
}


main().catch(console.error).finally(() => prisma.$disconnect());
