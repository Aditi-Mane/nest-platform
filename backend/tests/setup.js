import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // ✅ important

  mongo = await MongoMemoryServer.create({
    binary: { version: "6.0.6" }
  });

  const uri = mongo.getUri();
  await mongoose.connect(uri);
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongo) {
    await mongo.stop();
  }
};
