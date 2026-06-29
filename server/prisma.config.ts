import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: 'postgresql://bibliotecaria:ProjectLibray@localhost:5432/librey',
  },
})
