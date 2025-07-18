// models/Progress.js
import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  email: String,              // user ID
  date: String,               // "YYYY-MM-DD"
  completed: Boolean,         // workout done?
  weight: Number,             // kg
  calories: Number,           // kcal
  metric1: Number,            // protein (g)  – rename if you like
  metric2: Number             // steps        – rename if you like
});

export default mongoose.models.Progress ||
       mongoose.model("Progress", ProgressSchema);
