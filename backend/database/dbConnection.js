//bridge between Node.js and MongoDB
import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("✅ We’re alive. Data can flow now!!!");
    })
    .catch((err) => {
      console.error(`❌ Something is VERY wrong. Fix it now: ${err}`);
      process.exit(1); // stop the server
    });
};
