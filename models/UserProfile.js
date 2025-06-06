import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  fitnessGoal: String,
  activityLevel: String,
  targetWeight: Number,
  durationWeeks: Number,
  workoutDays: Number,
  dietType: String,
  allergies: [String],
  preferredWorkouts: [String],
  workoutLocation: String,
  maintenanceCalories: Number,
  mealsPerDay: Number,
}, { timestamps: true });

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
