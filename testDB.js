// testDB.js
import connectToDatabase from "./src/lib/db.js"; 
import 'dotenv/config'; // Loads process.env from .env

const testConnection = async () => {
  try {
    await connectToDatabase();
    console.log("Database test successful!");
    process.exit(0); // exit after test
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1); // exit with error
  }
};

testConnection();
