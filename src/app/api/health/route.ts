import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "unreachable";
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const isHealthy = dbStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(uptimeSeconds),
      response_time_ms: Date.now() - startTime,
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
      },
      memory: {
        rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
        heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
