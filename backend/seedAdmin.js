import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/userSchema.js";

// Atlas connection string
const uri = "mongodb+srv://Yvannah:BetterDaysLove@cluster0.rveqgwh.mongodb.net/handexa?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB Atlas connection error:", err));

const seedAdmin = async () => {
  try {
    // Hash the new password
    const password = "Junito210";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@handexa.com",
      phone: "0700000000", // Example phone number
      password: hashedPassword,
      role: "Admin",
      createdAt: new Date(),
    });

    console.log("Admin user created:", adminUser);
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();

  