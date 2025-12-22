import mongoose from "mongoose";

const MONGOOSE_URI = process.env.MONGOOSE_URI!;
if (!MONGOOSE_URI) throw new Error("Missing MONGOOSE_URI");

declare global {
  var mongooseGlobal:
    | {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
      }
    | undefined;
}

let cached = global.mongooseGlobal;
if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGOOSE_URI)
      .then((mongoose) => mongoose);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
