import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || "teamfirst";

// Reuse the same connection in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function dbConnect() {
  if (!global._mongooseConn) {
    if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");
    global._mongooseConn = mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  }
  return global._mongooseConn;
}
