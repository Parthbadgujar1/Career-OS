import "server-only";
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createAdapter() {
  const url = process.env.DATABASE_URL ?? "mysql://root@localhost:3306/career_os";
  const parsed = new URL(url);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  return new PrismaMariaDb({
    host: parsed.hostname || "localhost",
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database: (parsed.pathname || "/career_os").replace(/^\//, ""),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 5),
  });
}

function createClient() {
  const adapter = createAdapter();
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
