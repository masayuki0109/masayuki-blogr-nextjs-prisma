import { PrismaClient } from '@prisma/client'
import { Prisma } from 'next-auth/adapters'

let prisma: PrismaClient
declare global {
  namespace NodeJS {
    interface Global {
      prisma: any;
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma