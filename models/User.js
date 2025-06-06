import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  fitnessGoal: {
    type: String,
    enum: ['Lose Weight', 'Gain Muscle', 'Maintain']
  },
  activityLevel: String,

  // Common goal-based fields
  targetWeight: Number,
  durationWeeks: Number,
  dietType: String,
  mealsPerDay: Number,
  workoutDays: Number,
  preferredWorkouts: [String],
  workoutLocation: String,
  allergies: [String],
  maintenanceCalories: Number
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: UserProfileSchema // Embedded sub-document for profile
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
