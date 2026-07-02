import { PrismaClient } from '../generated/prisma/index.js'
const prisma = new PrismaClient()
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER DATABASE postgres REFRESH COLLATION VERSION;')
    await prisma.$executeRawUnsafe('ALTER DATABASE librey REFRESH COLLATION VERSION;')
    console.log('Fixed collation')
  } catch(e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
