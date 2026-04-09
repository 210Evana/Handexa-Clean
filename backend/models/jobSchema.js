import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title."],
    minLength: [3, "Title must contain at least 3 Characters!"],
    maxLength: [100, "Title cannot exceed 100 Characters!"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
    // No min/max length — even one word is fine for informal jobs
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
    enum: [
      "Cleaning & Domestic Services",
      "Chefs & Cooks",
      "Nannies",
      "Photographers",
      "Househelps",
      "Laundry Services",
      "Construction",
      "Artisans",
      "Gardeners",
      "Electrical & Wiring Services",
      "Tailoring & Fashion Design",
      "Carpentry & Furniture Making",
      "Plumbing & Repairs",
      "Masseuse/Masseur",
      "Event Planners",
      "Nail Technicians",
      "Make Up Artists",
      "Fumigators",
      "Painter",
      "Drivers",
      "Farming & Agriculture",
      "Food Vending & Catering",
      "Other Informal Jobs",
    ],
  },
  county: {
    type: String,
    required: [true, "Please provide a county name."],
    enum: [
      "Baringo", "Bomet", "Bungoma", "Busia",
      "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
      "Isiolo", "Kajiado", "Kakamega", "Kericho",
      "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
      "Kisumu", "Kitui", "Kwale", "Laikipia",
      "Lamu", "Machakos", "Makueni", "Mandera",
      "Marsabit", "Meru", "Migori", "Mombasa",
      "Murang'a", "Nairobi", "Nakuru", "Nandi",
      "Narok", "Nyamira", "Nyandarua", "Nyeri",
      "Samburu", "Siaya", "Taita-Taveta", "Tana River",
      "Tharaka-Nithi", "Trans Nzoia", "Turkana",
      "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
    ],
  },
  location: {
    type: String,
    required: [true, "Please provide location."],
    minLength: [3, "Location must contain at least 3 characters!"],
  },
  fixedSalary: {
    type: Number,
    min: [100, "Salary must be at least KES 100"],
    max: [10000000, "Salary cannot exceed KES 10,000,000"],
  },
  salaryFrom: {
    type: Number,
    min: [100, "Salary must be at least KES 100"],
    max: [10000000, "Salary cannot exceed KES 10,000,000"],
  },
  salaryTo: {
    type: Number,
    min: [100, "Salary must be at least KES 100"],
    max: [10000000, "Salary cannot exceed KES 10,000,000"],
  },
  expired: {
    type: Boolean,
    default: false,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Job = mongoose.model("Job", jobSchema);
