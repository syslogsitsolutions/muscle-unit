import mongoose, { Connection } from "mongoose";

let cachedConnection: Connection | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return { connection: cachedConnection };
  }

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://syslogsitsolutions:xYwF7WbgKmRAzhjc@cluster0.yky1f6e.mongodb.net/muscle-unit";

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI);
    cachedConnection = connection.connection;

    return { connection: cachedConnection };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Unable to connect to database");
  }
}
