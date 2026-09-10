import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import dns from "node:dns";

// Fix Windows DNS SRV ECONNREFUSED for MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // ignore
}

// Load .env.local if not already in environment (e.g. running standalone scripts)
if (!process.env.MONGODB_URI) {
  try {
    const candidates = [
      path.resolve(process.cwd(), ".env.local"),
      path.resolve(__dirname, "../../.env.local"),
      path.resolve(__dirname, "../../../.env.local"),
    ];
    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const [key, ...rest] = trimmed.split("=");
            const val = rest.join("=").trim();
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
        break;
      }
    }
  } catch (e) {
    // ignore
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cric";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log(`[MongoDB] Connected successfully to: ${m.connection.host || m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
