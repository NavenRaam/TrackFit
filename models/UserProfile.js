// models/UserProfile.js (Example snippet)
import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    age: Number,
    gender: String,
    height: Number, // in cm
    weight: Number, // in kg
    fitnessGoal: String,
    activityLevel: String,
    targetWeight: Number,
    durationWeeks: Number,
    dietType: String,
    mealsPerDay: Number,
    workoutLocation: String,
    allergies: [String], // Array of strings
    preferredWorkouts: [String], // Array of strings
    maintenanceCalories: Number,
    // --- NEW FIELDS ---
    workoutDaysPerWeek: { type: Number, default: 3 }, // Make sure this matches
    preferredWorkoutDurationMinutes: { type: Number, default: 60 },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    // --- END NEW FIELDS ---
}, { timestamps: true });

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);