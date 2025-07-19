// pages/api/profile/calculate-metrics.js
import dbConnect from '@/lib/mongodb'; // Ensure this path is correct for your DB connection
import UserProfile from '@/models/UserProfile'; // Path to your updated UserProfile model

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;

  // Basic validation for essential fields needed for calculation
  if (!email || age === undefined || !gender || height === undefined || weight === undefined || !activityLevel || !fitnessGoal) {
    return res.status(400).json({ message: 'Missing required profile data for calculation.' });
  }

  try {
    await dbConnect();

    let bmr;
    // Mifflin-St Jeor Equation
    // For Men: BMR=(10×weight in kg)+(6.25×height in cm)−(5×age in years)+5
    // For Women: BMR=(10×weight in kg)+(6.25×height in cm)−(5×age in years)−161
    if (gender === "Male") {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === "Female") {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      // Handle "Other" or default to a common average or male formula
      bmr = (10 * weight) + (6.25 * height) - (5 * age); // Neutralized for simplicity, could be more nuanced
    }

    let tdee; // Total Daily Energy Expenditure (Maintenance Calories)
    // Activity Factor: Multiply BMR by an activity factor
    switch (activityLevel) {
      case "Sedentary": tdee = bmr * 1.2; break;
      case "Lightly active": tdee = bmr * 1.375; break;
      case "Moderately active": tdee = bmr * 1.55; break;
      case "Very active": tdee = bmr * 1.725; break;
      case "Extra active": tdee = bmr * 1.9; break;
      default: tdee = bmr * 1.55; // Fallback to moderately active
    }

    let targetCalories = tdee;
    let proteinPercent, carbsPercent, fatsPercent;

    // Adjust target calories and macro percentages based on fitness goal
    switch (fitnessGoal) {
      case "Weight Loss":
        targetCalories = tdee - 500; // 500 kcal deficit
        proteinPercent = 0.40; carbsPercent = 0.30; fatsPercent = 0.30;
        break;
      case "Muscle Gain":
        targetCalories = tdee + 300; // 300 kcal surplus (Adjust this based on desired gain rate)
        proteinPercent = 0.35; carbsPercent = 0.45; fatsPercent = 0.20;
        break;
      case "Maintenance":
      default:
        proteinPercent = 0.25; carbsPercent = 0.50; fatsPercent = 0.25; // More balanced
        break;
    }

    // Convert macro percentages to grams
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const targetMacros = {
      protein: Math.round((targetCalories * proteinPercent) / 4),
      carbs: Math.round((targetCalories * carbsPercent) / 4),
      fats: Math.round((targetCalories * fatsPercent) / 9),
    };

    // Update the user profile with these calculated metrics
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email },
      {
        $set: {
          maintenanceCalories: Math.round(tdee),
          targetCalories: Math.round(targetCalories),
          targetMacros,
          // If this endpoint is also used for general profile updates,
          // ensure other fields from req.body are also passed to $set
          // For simplicity, this example only updates the calculated metrics.
          // In a real app, you'd likely merge req.body with these calculated values
          // before passing to $set.
        },
      },
      { new: true, upsert: true } // upsert: true creates if not exists, new: true returns updated doc
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json({
      message: 'Profile metrics updated successfully.',
      profile: updatedProfile,
    });

  } catch (err) {
    console.error('Error calculating or updating profile metrics:', err);
    res.status(500).json({ message: 'Server error during metric calculation.' });
  }
}