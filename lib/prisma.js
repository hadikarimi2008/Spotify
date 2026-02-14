import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = typeof globalThis !== "undefined" ? globalThis : global

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL is not set in .env file. Please create .env file and add DATABASE_URL."
  )
}

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// PrismaClient configuration
const prismaConfig = {
  adapter: adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
}

// Create PrismaClient instance
let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaConfig)
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(prismaConfig)
  }
  prisma = globalForPrisma.prisma
}

export { prisma }
export default prisma
