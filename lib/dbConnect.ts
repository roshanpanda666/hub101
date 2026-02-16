import mongoose from "mongoose";

const CONNECTIONURI = process.env.CONNECTIONURI!;

if (!CONNECTIONURI) {
    throw new Error("Please define CONNECTIONURI in .env.local");
}

/* Global cache to reuse connection across hot-reloads in dev */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
if (!global.mongooseCache) global.mongooseCache = cached;

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        // Force rewrite of models in dev to ensure schema updates


        cached.promise = mongoose.connect(CONNECTIONURI, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
