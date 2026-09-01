// Cached Mongoose connection helper.
//
// Next.js dev mode hot-reloads server modules on every request, which would
// normally open a fresh MongoDB connection each time and quickly exhaust the
// connection pool. The standard fix is to cache the connection promise on
// `globalThis` so it survives module reloads. See:
// https://mongoosejs.com/docs/nextjs.html
import dns from "dns";
import mongoose from "mongoose";

// Read lazily (inside connectToDatabase, not at module top-level) so this
// module can be imported before an .env file has been loaded — e.g. by
// Playwright's globalSetup, which loads .env.local itself before calling in.
function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI;
}

// `mongodb+srv://` connection strings need working SRV/TXT DNS resolution
// (Node's c-ares resolver, via dns.resolveSrv/resolveTxt) — separate from
// the plain A-record lookup (dns.lookup / getaddrinfo) most other code
// relies on. Some sandboxed/containerized environments ship a broken or
// unreachable default nameserver for c-ares specifically while the OS
// resolver still works fine, which surfaces as `querySrv ECONNREFUSED`. If
// that happens, retry once after pointing c-ares at public resolvers rather
// than failing outright.
let usedFallbackDnsServers = false;
function useFallbackDnsServers() {
  if (usedFallbackDnsServers) return;
  usedFallbackDnsServers = true;
  dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);
}

function isDnsSrvFailure(err: unknown): boolean {
  return (
    err instanceof Error &&
    "code" in err &&
    (err as NodeJS.ErrnoException).code === "ECONNREFUSED" &&
    "syscall" in err &&
    typeof (err as { syscall?: unknown }).syscall === "string" &&
    ((err as { syscall: string }).syscall === "querySrv" || (err as { syscall: string }).syscall === "queryTxt")
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
if (!global._mongooseCache) {
  global._mongooseCache = cache;
}

/**
 * Returns a cached, ready-to-use Mongoose connection to the `flowdesk`
 * database. Throws a clear error at call time (not at import time) if
 * `MONGODB_URI` is missing, so builds that never touch the database don't
 * require it to be set.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and set MONGODB_URI to your MongoDB Atlas connection string."
    );
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, { bufferCommands: false }).catch((err) => {
      if (isDnsSrvFailure(err)) {
        useFallbackDnsServers();
        return mongoose.connect(mongoUri, { bufferCommands: false });
      }
      throw err;
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
