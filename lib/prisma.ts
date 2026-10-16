import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getFreshPrismaClient() {
  if (typeof require !== "undefined" && require.cache) {
    Object.keys(require.cache).forEach((k) => {
      if (k.includes("@prisma") || k.includes(".prisma")) {
        delete require.cache[k];
      }
    });
  }
  const { PrismaClient } = require("@prisma/client");
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = getFreshPrismaClient();

export default prisma;
