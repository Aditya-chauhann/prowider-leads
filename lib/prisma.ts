import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: any }

export const prisma =
  globalForPrisma.prisma ||
  new (require('@prisma/client').PrismaClient)({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma