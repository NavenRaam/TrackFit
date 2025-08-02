// models/UserProfile.js
import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 13, max: 100 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    height: { type: Number },
    weight: { type: Number },
    // **A1: Standardize Fitness Goal Enums**
    fitnessGoal: { type: String, enum: ["Weight Loss", "Muscle Gain", "Maintenance", "Improve Endurance"] },
    // **A2: Standardize Activity Level Enums**
    activityLevel: {
        type: String,
        enum: [
            "Sedentary",          // No extra description
            "Lightly Active",     // No extra description
            "Moderately Active",  // No extra description
            "Very Active",        // No extra description
            "Extra Active"        // No extra description
        ]
    },
    targetWeight: { type: Number },
    durationWeeks: { type: Number, min: 1, max: 24, default: 8 },

    workoutLocation: { type: String, enum: ["Home", "Gym", "Outdoor", "Any"] },
    preferredWorkouts: { type: [String], default: [] }, // Ensure default is empty array

    // Correct field name and structure
    workoutDaysPerWeek: { type: Number, default: 3, min: 1, max: 7 },
    preferredWorkoutDurationMinutes: { type: Number, default: 60, min: 30, max: 120 },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },

    maintenanceCalories: { type: Number }, // Can be null/undefined if not 'Maintenance' goal
    targetCalories: { type: Number }, // Calculated by backend
    targetMacros: { // Calculated by backend
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number },
    },

    // **A3: Ensure Dietary Preferences is an object with nested fields**
    dietaryPreferences: {
        dietType: {
            type: String,
            // **A4: Standardize Diet Type Enums**
            enum: ["None", "Vegan", "Vegetarian", "Keto", "Paleo", "Pescatarian", "Balanced", "Mediterranean"],
            default: "None"
        },
        allergies: { type: [String], default: [] },
        dislikes: { type: [String], default: [] }, // Use 'dislikes' consistently
        mealsPerDay: { type: Number, min: 1, max: 6 }, // Nested here
        otherNotes: { type: String },
    },

}, { timestamps: true });

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);