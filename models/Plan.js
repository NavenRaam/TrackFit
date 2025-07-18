import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  email: String,           // user id
  goal: String,            // Gain Muscle / Lose Weight / Maintain
  type: String,            // workout / diet / tutorial
  content: String,         // JSON or markdown blob
  startDate: String,       // "YYYY-MM-DD" – when the plan starts
  durationWeeks: { type: Number, default: 8 }  // program length
}, { timestamps: true });

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
