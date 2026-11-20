import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DEFAULT_DATABASE_URL =
  "mysql://u905414804_sscouriers:SS%40Couriers26@127.0.0.1:3306/u905414804_sscouriers?connection_limit=5";

function getResolvedDatabaseUrl(): string {
  // If individual DB variables are specified in .env, build safe encoded URL
  if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    const user = encodeURIComponent(process.env.DB_USER);
    const pass = encodeURIComponent(process.env.DB_PASSWORD);
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = process.env.DB_PORT || "3306";
    const name = process.env.DB_NAME;
    const urlFromParts = `mysql://${user}:${pass}@${host}:${port}/${name}?connection_limit=5`;

    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes(name)) {
      return urlFromParts;
    }
  }

  if (process.env.DATABASE_URL) {
    const raw = process.env.DATABASE_URL.trim();
    const prefix = "mysql://";
    if (raw.startsWith(prefix)) {
      const rest = raw.slice(prefix.length);
      const lastAt = rest.lastIndexOf("@");
      if (lastAt !== -1) {
        const authPart = rest.slice(0, lastAt);
        const hostDbPart = rest.slice(lastAt + 1);
        const colonIdx = authPart.indexOf(":");
        if (colonIdx !== -1) {
          const rawUser = authPart.slice(0, colonIdx);
          const rawPass = authPart.slice(colonIdx + 1);
          const u = encodeURIComponent(decodeURIComponent(rawUser));
          const p = encodeURIComponent(decodeURIComponent(rawPass));

          let hostDb = hostDbPart;
          let extra = "?connection_limit=5";
          const qIdx = hostDb.indexOf("?");
          if (qIdx !== -1) {
            extra = hostDb.slice(qIdx);
            hostDb = hostDb.slice(0, qIdx);
            if (!extra.includes("connection_limit")) {
              extra += "&connection_limit=5";
            }
          }
          return `mysql://${u}:${p}@${hostDb}${extra}`;
        }
      }
    }
    return raw;
  }

  return DEFAULT_DATABASE_URL;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getResolvedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
