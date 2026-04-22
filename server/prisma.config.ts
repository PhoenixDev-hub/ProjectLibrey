import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  db: {
    url: 'postgresql://bibliotecaria:ProjectLibray@localhost:5432/librey',
  },
})
