// models/UserProfile.js
import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 13, max: 100 }, // Added min/max for validation
    gender: { type: String, enum: ["Male", "Female", "Other"] }, // Added enum for validation
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    fitnessGoal: { type: String, enum: ["Weight Loss", "Muscle Gain", "Maintenance"] }, // Added enum for validation
    activityLevel: { 
        type: String, 
        enum: ["Sedentary", "Lightly active", "Moderately active", "Very active", "Extra active"] 
    },
    targetWeight: { type: Number }, // Existing field
    durationWeeks: { type: Number, min: 1, max: 24, default: 8 }, // Added min/max for validation
    mealsPerDay: { type: Number, min: 1, max: 6 }, // Existing field, added min/max

    workoutLocation: { type: String, enum: ["Home", "Gym", "Outdoor", "Any"] }, // Added enum for validation
    preferredWorkouts: { type: [String] }, // Array of strings

    // Workout-specific preferences (already in your schema, just ensuring consistency)
    workoutDaysPerWeek: { type: Number, default: 3, min: 1, max: 7 }, 
    preferredWorkoutDurationMinutes: { type: Number, default: 60, min: 30, max: 120 },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },

    // >>>>>>>>>>> DIET-SPECIFIC CALCULATED METRICS <<<<<<<<<<<
    maintenanceCalories: { type: Number }, // TDEE
    targetCalories: { type: Number },     // Adjusted for goal

    // Calculated macro split in grams
    targetMacros: {
      protein: { type: Number },
      carbs: { type: Number },
      fats: { type: Number },
    },

    // >>>>>>>>>>> DIETARY PREFERENCES (consolidated) <<<<<<<<<<<
    // Moving 'allergies' and 'dietType' into this structured object for better organization
    dietaryPreferences: { 
        allergies: { type: [String], default: [] }, // e.g., ["peanuts", "dairy"]
        dislikes: { type: [String], default: [] },  // e.g., ["cilantro", "broccoli"]
        dietType: { 
          type: String, 
          enum: ["None", "Vegan", "Vegetarian", "Keto", "Paleo", "Pescatarian"], 
          default: "None" 
        },
        otherNotes: { type: String }, // Any other specific dietary notes/requests for the AI
    },

}, { timestamps: true }); // Keep your existing timestamps option

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);