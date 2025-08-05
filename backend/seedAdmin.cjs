import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/userSchema.js"; // Adjust path as needed

// Connect to your MongoDB
mongoose.connect("mongodb://localhost:27017/handexa", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() =>
  console.log("Connected to MongoDB"))
  .catch((err) => 
  console.error("MongoDB connection error:", err));



const seedAdmin = async () => {
  try {
    // Hash the password
    const password = "JOYLAND210";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@handexa.com",
      phone: "0748293113", // Example phone number
      password: hashedPassword,
      role: "Admin",
      status: "approved", // Assuming status is a field; add if needed
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