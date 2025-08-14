import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title."],
    minLength: [3, "Title must contain at least 3 Characters!"],
    maxLength: [30, "Title cannot exceed 30 Characters!"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
    minLength: [30, "Description must contain at least 30 Characters!"],
    maxLength: [500, "Description cannot exceed 500 Characters!"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
    enum: [
      "Tailoring & Fashion Design",
      "Carpentry & Furniture Making",
      "Electrical & Wiring Services",
      "Food Vending & Catering",
      "Plumbing & Repairs",
      "Cleaning & Domestic Services",
      "Laundry Services",
      "Farming & Agriculture",
      "Other Informal Jobs",
    ],
  },
  country: {
    type: String,
    required: [true, "Please provide a country name."],
    default: "Kenya",
  },
  city: {
    type: String,
    required: [true, "Please provide a city name."],
    enum: [
      "Nairobi",
      "Mombasa",
      "Bungoms",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Nyeri",
      "Machakos",
      "Other",
    ],
  },
  location: {
    type: String,
    required: [true, "Please provide location."],
    minLength: [10, "Location must contain at least 10 characters!"],
  },
  fixedSalary: {
    type: Number,
    min: [5000, "Salary must be at least KES 5,000"],
    max: [1000000, "Salary cannot exceed KES 1,000,000"],
  },
  salaryFrom: {
    type: Number,
    min: [5000, "Salary must be at least KES 5,000"],
    max: [1000000, "Salary cannot exceed KES 1,000,000"],
  },
  salaryTo: {
    type: Number,
    min: [5000, "Salary must be at least KES 5,000"],
    max: [1000000, "Salary cannot exceed KES 1,000,000"],
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