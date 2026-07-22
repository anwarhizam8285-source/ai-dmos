import { db, auth } from "../services/firebaseService.js";

export async function checkDatabaseHealth() {
  try {
    // Test Firestore connection
    const testDoc = await db.collection("_health").doc("test").get();
    return {
      status: "healthy",
      service: "firestore",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      service: "firestore",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function checkAuthHealth() {
  try {
    // Test Firebase Auth (just check if service is accessible)
    if (auth) {
      return {
        status: "healthy",
        service: "firebase-auth",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: "unhealthy",
      service: "firebase-auth",
      error: "Auth service not initialized",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      service: "firebase-auth",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export function checkMemoryHealth() {
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  return {
    status: heapUsedPercent < 90 ? "healthy" : "warning",
    service: "memory",
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
    heapUsedPercent: heapUsedPercent.toFixed(2) + "%",
    rss: Math.round(memUsage.rss / 1024 / 1024) + " MB",
    timestamp: new Date().toISOString(),
  };
}

export function checkUptimeHealth() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return {
    status: "healthy",
    service: "uptime",
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: uptime,
    timestamp: new Date().toISOString(),
  };
}

export async function getFullHealthStatus() {
  const [db, auth, memory, uptime] = await Promise.all([
    checkDatabaseHealth(),
    checkAuthHealth(),
    Promise.resolve(checkMemoryHealth()),
    Promise.resolve(checkUptimeHealth()),
  ]);

  const allHealthy = [db, auth, memory, uptime].every(
    (check) => check.status === "healthy" || check.status === "warning"
  );

  return {
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0-alpha",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: db,
      auth: auth,
      memory: memory,
      uptime: uptime,
    },
  };
}
