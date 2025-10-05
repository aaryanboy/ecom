import mongoose from "mongoose";

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    // Already connected
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URL); // no deprecated options
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    throw error; // Let the API route handle this
  }
};

export default connectToDatabase;
